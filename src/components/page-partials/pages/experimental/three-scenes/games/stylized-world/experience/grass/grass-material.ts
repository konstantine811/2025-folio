import * as THREE from "three/webgpu";
import {
  Fn,
  abs,
  cameraPosition,
  clamp,
  color,
  cross,
  float,
  floor,
  instanceIndex,
  length,
  max,
  mix,
  modelWorldMatrix,
  mul,
  normalize,
  oneMinus,
  pow,
  sqrt,
  time,
  uniform,
  uv,
  vec2,
  vec3,
  vec4,
} from "three/tsl";
import type { GrassUniforms } from "./config";
import {
  applyVertexSway,
  applyViewDependentTilt,
  applyWindPush,
  bezier3,
  bezier3Tangent,
  getBezierControlPoints,
  safeNormalize2D,
} from "./shader-helpers";

export function createGrassMaterial(
  grassData: ReturnType<typeof import("./grass-geometry").createGrassData>,
  visibleIndicesBuffer: ReturnType<
    typeof import("./grass-geometry").createVisibleIndicesBuffer
  >,
  uniforms: GrassUniforms["material"],
) {
  const material = new THREE.MeshBasicNodeMaterial();
  material.side = THREE.DoubleSide;
  material.depthWrite = true;

  const trueIndex = visibleIndicesBuffer.element(instanceIndex);
  const data = grassData.element(trueIndex);

  const grassVertex = Fn(() => {
    const d0 = data.get("data0").toConst();
    const d1 = data.get("data1").toConst();
    const d2 = data.get("data2").toConst();
    const d3 = data.get("data3").toConst();

    const instancePos = d0.xyz;
    const bladeType = floor(d0.w.mul(3));
    const width = d1.x;
    const height = d1.y;
    const bend = d1.z;
    const windStrength01 = d1.w;
    const rotSin = d2.x;
    const rotCos = d2.y;
    const clumpSeed01 = d2.z;
    const perBladeHash01 = d2.w;
    const pushVector = d3.zw;

    const rotateXZ = (v: ReturnType<typeof vec2>) =>
      vec2(v.x.mul(rotCos).sub(v.y.mul(rotSin)), v.x.mul(rotSin).add(v.y.mul(rotCos)));

    const worldBasePos = instancePos;
    const worldXZ = vec2(worldBasePos.x, worldBasePos.z);
    const uvCoords = uv();
    const t = uvCoords.y;
    const s = uvCoords.x.sub(0.5).mul(2);

    const p0 = vec3(0, 0, 0);
    let p3 = vec3(0, height, 0);
    const controls = getBezierControlPoints(bladeType, height, bend);
    let p1 = controls.p1;
    let p2 = controls.p2;

    const windDir2 = safeNormalize2D(uniforms.uWindDir);
    const windDir = vec3(windDir2.x, float(0), windDir2.y);
    const windPushed = applyWindPush(p1, p2, p3, windDir, windStrength01, height);
    p1 = windPushed.p1;
    p2 = windPushed.p2;
    p3 = windPushed.p3;

    const spine = bezier3(p0, p1, p2, p3, t);
    const tangent = normalize(bezier3Tangent(p0, p1, p2, p3, t));
    const side = normalize(cross(vec3(0, 0, 1), tangent));
    const vertexSway = applyVertexSway(
      side,
      t,
      height,
      windStrength01,
      perBladeHash01,
      worldXZ,
      windDir2,
      time,
      uniforms.uWindSwayStrength,
    );
    const spineWithSway = spine.add(vertexSway);
    const normal = normalize(cross(side, tangent));

    const widthFactor = t
      .add(uniforms.uBaseWidth)
      .mul(pow(oneMinus(t), uniforms.uTipThin));
    const lposBase = spineWithSway.add(side.mul(width).mul(widthFactor).mul(s));
    const lposXZ = rotateXZ(vec2(lposBase.x, lposBase.z));
    let lpos = vec3(lposXZ.x, lposBase.y, lposXZ.y);

    lpos = vec3(
      lpos.x.add(pushVector.x.mul(pow(t, 2))),
      lpos.y.mul(oneMinus(length(pushVector).mul(uniforms.uCharacterFlattenAmount).mul(t))),
      lpos.z.add(pushVector.y.mul(pow(t, 2))),
    );

    const normalXZ = rotateXZ(vec2(normal.x, normal.z));
    const sideRotated = normalize(vec3(rotateXZ(vec2(side.x, side.z)).x, side.y, rotateXZ(vec2(side.x, side.z)).y));

    const worldPos = vec3(
      instancePos.x.add(lpos.x),
      instancePos.y.add(lpos.y),
      instancePos.z.add(lpos.z),
    );

    const tilted = applyViewDependentTilt(
      lpos,
      worldPos,
      sideRotated,
      vec3(normalXZ.x, normal.y, normalXZ.y),
      uvCoords,
      t,
      uniforms.uThicknessStrength,
      modelWorldMatrix,
      cameraPosition,
    );

    const tiltDelta = tilted.sub(lpos);
    const tiltDeltaWorld = mul(modelWorldMatrix, vec4(tiltDelta, float(0))).xyz;
    return vec4(worldPos.add(tiltDeltaWorld), float(1));
  });

  material.positionNode = Fn(() => grassVertex().sub(uniforms.uGroupOffset))();

  material.colorNode = Fn(() => {
    const d2 = data.get("data2").toConst();
    const clumpSeed01 = d2.z;
    const perBladeHash01 = d2.w;
    const t = uv().y;

    const baseColor = uniforms.uBaseColor;
    const tipColor = uniforms.uTipColor;
    const clumpFactor = mix(uniforms.uClumpSeedRange.x, uniforms.uClumpSeedRange.y, clumpSeed01);
    const bladeFactor = mix(uniforms.uBladeSeedRange.x, uniforms.uBladeSeedRange.y, perBladeHash01);
    const gradient = mix(baseColor, tipColor, t);
    const ao = mix(float(0.55), float(1), pow(t, uniforms.uAOPower));
    return gradient.mul(clumpFactor).mul(bladeFactor).mul(ao);
  })();

  return material;
}

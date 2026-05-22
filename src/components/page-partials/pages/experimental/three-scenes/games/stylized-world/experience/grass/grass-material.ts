import * as THREE from "three/webgpu";
import {
  Fn,
  cameraPosition,
  clamp,
  color,
  cross,
  dot,
  float,
  floor,
  instanceIndex,
  length,
  materialRoughness,
  max,
  mix,
  normalize,
  oneMinus,
  pmremTexture,
  pow,
  select,
  smoothstep,
  sqrt,
  time,
  transformNormalToView,
  uv,
  varying,
  vec2,
  vec3,
  vec4,
} from "three/tsl";
import type { GrassUniforms } from "./config";
import {
  applyVertexSway,
  applyWindPush,
  bezier3,
  bezier3Tangent,
  computeGrassBillboardSide,
  getBezierControlPoints,
  safeNormalize2D,
} from "./shader-helpers";
import { applySlopeAlignment } from "./terrain-helpers";

export function createGrassMaterial(
  grassData: ReturnType<typeof import("./grass-geometry").createGrassData>,
  visibleIndicesBuffer: ReturnType<
    typeof import("./grass-geometry").createVisibleIndicesBuffer
  >,
  uniforms: GrassUniforms["material"],
  debugColor?: THREE.Color,
) {
  const vLightNormal = varying(vec3(0));
  const vHeight = varying(float(0));
  const vDistFade = varying(float(0));
  const vClumpSeed = varying(float(0));
  const vBladeSeed = varying(float(0));

  const material = new THREE.MeshStandardNodeMaterial();
  material.side = THREE.FrontSide;
  material.depthWrite = true;
  material.roughness = 0.42;
  material.metalness = 0;

  const trueIndex = visibleIndicesBuffer.element(instanceIndex);
  const data = grassData.element(trueIndex);

  const calculateAO = () =>
    mix(
      float(0.55),
      float(1),
      clamp(pow(vHeight, uniforms.uAOPower), float(0), float(1)),
    );

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
    const clumpSeed01 = d2.z;
    const perBladeHash01 = d2.w;
    const tnX = d3.x;
    const tnZ = d3.y;
    const pushVector = d3.zw;
    const tnY = sqrt(max(float(0), float(1).sub(tnX.mul(tnX)).sub(tnZ.mul(tnZ))));
    const tn = vec3(tnX, tnY, tnZ);

    const worldBasePos = instancePos;
    const worldXZ = vec2(worldBasePos.x, worldBasePos.z);
    const dist = length(cameraPosition.sub(worldBasePos));

    const windDistanceFalloff = select(
      uniforms.uWindDistanceEnd.greaterThan(float(0)),
      oneMinus(
        smoothstep(uniforms.uWindDistanceStart, uniforms.uWindDistanceEnd, dist),
      ),
      float(1),
    );
    const windStrength = windStrength01.mul(windDistanceFalloff);

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
    const windPushed = applyWindPush(p1, p2, p3, windDir, windStrength, height);
    p1 = windPushed.p1;
    p2 = windPushed.p2;
    p3 = windPushed.p3;

    const spine = bezier3(p0, p1, p2, p3, t);
    const tangent = normalize(bezier3Tangent(p0, p1, p2, p3, t));
    const spineWorld = vec3(
      instancePos.x.add(spine.x),
      instancePos.y.add(spine.y),
      instancePos.z.add(spine.z),
    );
    const side = computeGrassBillboardSide(spineWorld, cameraPosition);
    const vertexSway = applyVertexSway(
      side,
      t,
      height,
      windStrength,
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
    let lpos = vec3(lposBase.x, lposBase.y, lposBase.z).toVar();

    lpos.assign(
      vec3(
        lpos.x.add(pushVector.x.mul(pow(t, 2))),
        lpos.y.mul(oneMinus(length(pushVector).mul(uniforms.uCharacterFlattenAmount).mul(t))),
        lpos.z.add(pushVector.y.mul(pow(t, 2))),
      ),
    );

    let tangentRotated = normalize(tangent).toVar();
    let sideRotated = normalize(side).toVar();
    let normalRotated = normalize(normal).toVar();

    applySlopeAlignment(tn, lpos, tangentRotated, sideRotated, normalRotated);

    const worldPosFinal = vec3(
      instancePos.x.add(lpos.x),
      instancePos.y.add(lpos.y),
      instancePos.z.add(lpos.z),
    );

    vLightNormal.assign(tn);
    vHeight.assign(t);
    vDistFade.assign(
      smoothstep(uniforms.uDistFadeNear, uniforms.uDistFadeFar, dist),
    );
    vClumpSeed.assign(clumpSeed01);
    vBladeSeed.assign(perBladeHash01);

    return vec4(worldPosFinal, float(1));
  });

  material.positionNode = Fn(() => grassVertex().sub(uniforms.uGroupOffset))();

  material.normalNode = Fn(() => {
    // Billboard geometry rotates with camera; use terrain-up normal for stable lighting.
    const upBias = float(0.72);
    const lightingNormal = normalize(
      mix(normalize(vLightNormal), vec3(0, 1, 0), upBias),
    );
    return transformNormalToView(lightingNormal);
  })();

  material.colorNode = Fn(() => {
    const gradient = mix(uniforms.uBaseColor, uniforms.uTipColor, vHeight);
    const clumpFactor = mix(
      uniforms.uClumpSeedRange.x,
      uniforms.uClumpSeedRange.y,
      vClumpSeed,
    );
    const bladeFactor = mix(
      uniforms.uBladeSeedRange.x,
      uniforms.uBladeSeedRange.y,
      vBladeSeed,
    );
    let grassColor = gradient.mul(clumpFactor).mul(bladeFactor).mul(calculateAO());

    const grayValue = dot(grassColor, vec3(0.333));
    const distFadeFactor = vDistFade.mul(float(0.18));
    grassColor = grassColor
      .mul(oneMinus(distFadeFactor))
      .add(vec3(grayValue).mul(distFadeFactor));

    if (debugColor) {
      const lodDebugColor = color(debugColor.r, debugColor.g, debugColor.b);
      return mix(grassColor, lodDebugColor, uniforms.uDebugLod);
    }

    return grassColor;
  })();

  material.roughnessNode = Fn(() => {
    const ao = calculateAO();
    const baseRoughness = materialRoughness;
    const roughnessMin = baseRoughness.mul(0.5);
    const roughnessMax = baseRoughness;
    const aoFactor = smoothstep(float(0.35), float(1), ao);
    return clamp(mix(roughnessMax, roughnessMin, aoFactor), float(0), float(1));
  })();

  material.envNode = Fn(() => pmremTexture(material.envMap).mul(calculateAO()))();

  return material;
}

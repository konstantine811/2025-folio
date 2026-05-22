import {
  Fn,
  If,
  abs,
  atomicAdd,
  atomicStore,
  cos,
  float,
  floor,
  instanceIndex,
  int,
  length,
  mix,
  round,
  select,
  sin,
  smoothstep,
  step,
  uint,
  vec2,
  vec3,
  vec4,
} from "three/tsl";
import {
  BLADES_PER_AXIS,
  GRASS_AREA_SIZE,
  type GrassUniforms,
  type LODBufferConfig,
} from "./config";
import { hash2to1, hash2to2 } from "./shader-helpers";

const BLADE_SPACING = GRASS_AREA_SIZE / BLADES_PER_AXIS;

export function createGrassCompute(
  grassData: ReturnType<typeof import("./grass-geometry").createGrassData>,
  lodConfig: LODBufferConfig,
  uniforms: GrassUniforms["compute"],
) {
  const bladesPerAxis = float(BLADES_PER_AXIS);
  const grassAreaSize = float(GRASS_AREA_SIZE);
  const bladeSpacing = float(BLADE_SPACING);

  const performCulling = Fn(([worldPos]: [ReturnType<typeof vec3>]) => {
    const radius = float(1.5);
    const clipPos = uniforms.uViewProjectionMatrix.mul(
      vec4(worldPos.x, worldPos.y, worldPos.z, float(1)),
    );
    const isInFront = clipPos.w.greaterThan(radius.negate());
    const xIn = abs(clipPos.x).lessThan(clipPos.w.add(radius));
    const yIn = abs(clipPos.y).lessThan(clipPos.w.add(radius));
    const zIn = clipPos.z.lessThan(clipPos.w.add(radius));
    const inFrustum = isInFront.and(xIn).and(yIn).and(zIn);
    const isInCircle = length(worldPos.sub(uniforms.uGroupOffset)).lessThan(
      grassAreaSize.mul(0.5),
    );
    return inFrustum.and(isInCircle);
  });

  const computeFn = Fn(() => {
    const uIdx = uint(instanceIndex);
    const iGridX = uIdx.div(uint(BLADES_PER_AXIS));
    const iGridZ = uIdx.mod(uint(BLADES_PER_AXIS));
    const offsetStepsX = round(uniforms.uGridIndex.x);
    const offsetStepsZ = round(uniforms.uGridIndex.y);

    const globalGridX = int(iGridX).add(int(offsetStepsX));
    const globalGridZ = int(iGridZ).add(int(offsetStepsZ));

    const jitterRand = hash2to2(globalGridX, globalGridZ);
    const jitterX = jitterRand.x.sub(0.5).mul(bladeSpacing);
    const jitterZ = jitterRand.y.sub(0.5).mul(bladeSpacing);

    const gridX = float(iGridX);
    const gridZ = float(iGridZ);
    const fx = gridX.div(bladesPerAxis).sub(0.5);
    const fz = gridZ.div(bladesPerAxis).sub(0.5);
    const px = fx.mul(grassAreaSize);
    const pz = fz.mul(grassAreaSize);

    const worldPos = vec3(px.add(jitterX), float(0), pz.add(jitterZ)).add(
      uniforms.uGroupOffset,
    );

    const diff = worldPos.sub(uniforms.uCameraPosition);
    const distToCamera = length(diff);
    const isCloseEnough = abs(diff.x).add(abs(diff.z)).lessThan(float(3));
    const isVisible = isCloseEnough.or(performCulling(worldPos));

    If(isVisible, () => {
      const worldXZ = vec2(worldPos.x, worldPos.z);
      const height = mix(
        uniforms.uBladeHeightMin,
        uniforms.uBladeHeightMax,
        hash2to1(globalGridX, globalGridZ),
      );
      const width = mix(
        uniforms.uBladeWidthMin,
        uniforms.uBladeWidthMax,
        hash2to1(globalGridX.add(17), globalGridZ.add(31)),
      );
      const bend = mix(
        uniforms.uBendAmountMin,
        uniforms.uBendAmountMax,
        hash2to1(globalGridX.add(53), globalGridZ.add(71)),
      );
      const type = hash2to1(globalGridX.add(97), globalGridZ.add(113));
      const perBladeHash01 = hash2to1(globalGridX, globalGridZ.add(5));
      const clumpSeed01 = hash2to1(globalGridX.add(7), globalGridZ.add(11));
      const angle = perBladeHash01.mul(6.28318);

      const charDiff = worldXZ.sub(
        vec2(uniforms.uCharacterWorldPos.x, uniforms.uCharacterWorldPos.z),
      );
      const charDist = length(charDiff);
      const safeCharDir = select(
        charDist.lessThan(float(0.001)),
        vec2(0, 0),
        charDiff.div(charDist),
      );
      const pushFactor = smoothstep(
        uniforms.uCharacterPushRadius,
        float(0),
        charDist,
      );
      const pushVector = safeCharDir
        .mul(pushFactor)
        .mul(uniforms.uCharacterPushAmount)
        .mul(step(float(0.001), pushFactor));

      const data = grassData.element(instanceIndex);
      data.get("data0").assign(vec4(worldPos, type));
      data.get("data1").assign(vec4(width, height, bend, float(0.35)));
      data
        .get("data2")
        .assign(vec4(sin(angle), cos(angle), clumpSeed01, perBladeHash01));
      data.get("data3").assign(vec4(float(0), float(0), pushVector.x, pushVector.y));

      const lodIndex = atomicAdd(
        lodConfig.drawStorage.get("instanceCount"),
        uint(1),
      );
      lodConfig.indices.element(lodIndex).assign(uint(instanceIndex));
    });
  });

  return { computeFn };
}

export function createResetDrawBufferCompute(lodConfig: LODBufferConfig) {
  const resetFn = Fn(() => {
    const drawBuffer = lodConfig.drawStorage;
    drawBuffer.get("vertexCount").assign(uint(lodConfig.vertexCount));
    atomicStore(drawBuffer.get("instanceCount"), uint(0));
    drawBuffer.get("firstVertex").assign(uint(0));
    drawBuffer.get("firstInstance").assign(uint(0));
    drawBuffer.get("offset").assign(uint(0));
  });

  return resetFn().compute(1);
}

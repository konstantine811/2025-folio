import {
  Fn,
  If,
  abs,
  atan,
  atomicAdd,
  atomicStore,
  cos,
  dot,
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
  sqrt,
  step,
  uint,
  vec2,
  vec3,
  vec4,
} from "three/tsl";
import {
  BLADES_PER_AXIS,
  BLADES_PER_CELL,
  GRASS_AREA_SIZE,
  type GrassUniforms,
  type LODBufferConfig,
} from "./config";
import { hash2to1, hash2to2, calculateWindStrength, applyWindFacing, applyBladeRandomness } from "./shader-helpers";
import { getGroundTerrainHeight, getTerrainNormal } from "./terrain-helpers";

const BLADE_SPACING = GRASS_AREA_SIZE / BLADES_PER_AXIS;

function appendToLodBucket(
  lodConfig: LODBufferConfig,
  bladeIndex: ReturnType<typeof instanceIndex>,
) {
  const lodIndex = atomicAdd(lodConfig.drawStorage.get("instanceCount"), uint(1));
  lodConfig.indices.element(lodIndex).assign(uint(bladeIndex));
}

function createLODRoutingChainBuilder(
  lodConfigs: LODBufferConfig[],
  lodNoiseScale: ReturnType<typeof import("three/tsl").uniform>,
) {
  return (
    distToCamera: ReturnType<typeof float>,
    bladeIndex: ReturnType<typeof instanceIndex>,
  ) => {
    if (lodConfigs.length === 0) return;

    if (lodConfigs.length === 1) {
      appendToLodBucket(lodConfigs[0], bladeIndex);
      return;
    }

    const buildChain = (index: number) => {
      if (index >= lodConfigs.length) return;

      const config = lodConfigs[index];
      const isLast = index === lodConfigs.length - 1;
      const minDist = float(config.minDistance);
      const maxDist =
        config.maxDistance === Infinity ? float(1e9) : float(config.maxDistance);

      const noiseSeed = float(bladeIndex).mul(0.12345).fract().mul(2).sub(1);
      const noisyDist = distToCamera.add(
        distToCamera.mul(lodNoiseScale).mul(noiseSeed),
      );

      const inRange = noisyDist.greaterThanEqual(minDist).and(
        isLast || config.maxDistance === Infinity
          ? noisyDist.lessThanEqual(maxDist)
          : noisyDist.lessThan(maxDist),
      );

      const lodBlock = () => {
        appendToLodBucket(config, bladeIndex);
      };

      if (isLast) {
        return If(inRange, lodBlock);
      }

      const nextChain = buildChain(index + 1);
      return If(inRange, lodBlock).Else(() => {
        if (nextChain) nextChain;
      });
    };

    const chain = buildChain(0);
    if (chain) chain;
  };
}

export function createGrassCompute(
  grassData: ReturnType<typeof import("./grass-geometry").createGrassData>,
  lodConfigs: LODBufferConfig[],
  uniforms: GrassUniforms["compute"],
) {
  const bladesPerAxis = float(BLADES_PER_AXIS);
  const grassAreaSize = float(GRASS_AREA_SIZE);
  const bladeSpacing = float(BLADE_SPACING);

  const buildLODRouting = createLODRoutingChainBuilder(
    lodConfigs,
    uniforms.uLODNoiseScale,
  );
  const sampleGroundHeight = getGroundTerrainHeight(uniforms.uTerrainSeed);
  const sampleGroundNormal = getTerrainNormal(sampleGroundHeight);

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
    const subBladeCount = uint(BLADES_PER_CELL);
    const uIdx = uint(instanceIndex);
    const subIdx = uIdx.mod(subBladeCount);
    const cellIdx = uIdx.div(subBladeCount);
    const iGridX = cellIdx.div(uint(BLADES_PER_AXIS));
    const iGridZ = cellIdx.mod(uint(BLADES_PER_AXIS));
    const offsetStepsX = round(uniforms.uGridIndex.x);
    const offsetStepsZ = round(uniforms.uGridIndex.y);

    const globalGridX = int(iGridX).add(int(offsetStepsX));
    const globalGridZ = int(iGridZ).add(int(offsetStepsZ));

    const subRand = hash2to2(
      globalGridX.add(int(subIdx).mul(17)),
      globalGridZ.add(int(subIdx).mul(31)),
    );
    const jitterX = subRand.x.sub(0.5).mul(bladeSpacing);
    const jitterZ = subRand.y.sub(0.5).mul(bladeSpacing);

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
      const maxSubBlades = uniforms.uDensity.mul(float(BLADES_PER_CELL));

      If(float(subIdx).lessThan(maxSubBlades), () => {
      const worldXZ = vec2(worldPos.x, worldPos.z);
      const terrainY = sampleGroundHeight(worldXZ);
      const finalPos = vec3(worldPos.x, terrainY, worldPos.z);
      const tn = sampleGroundNormal(worldXZ);

      const bladesPerClump = uniforms.uClumpSize.div(bladeSpacing);
      const cx = floor(float(globalGridX).div(bladesPerClump));
      const cz = floor(float(globalGridZ).div(bladesPerClump));
      const fxClump = float(globalGridX).div(bladesPerClump).fract();
      const fzClump = float(globalGridZ).div(bladesPerClump).fract();
      const currentPos = vec2(fxClump, fzClump);

      const minD2 = float(1e9).toVar();
      const secondMinD2 = float(1e9).toVar();
      const bestID = vec2(0, 0).toVar();
      const secondBestID = vec2(0, 0).toVar();
      const bestDiff = vec2(0, 0).toVar();

      const visitNeighbor = (ox: number, oz: number) => {
        const neighborX = cx.add(float(ox));
        const neighborZ = cz.add(float(oz));
        const rand = hash2to2(int(neighborX), int(neighborZ));
        const point = vec2(float(ox), float(oz)).add(rand);
        const cellDiff = point.sub(currentPos);
        const d2 = dot(cellDiff, cellDiff);

        If(d2.lessThan(minD2), () => {
          secondMinD2.assign(minD2);
          secondBestID.assign(bestID);
          bestDiff.assign(cellDiff);
          minD2.assign(d2);
          bestID.assign(vec2(neighborX, neighborZ));
        }).ElseIf(d2.lessThan(secondMinD2), () => {
          secondMinD2.assign(d2);
          secondBestID.assign(vec2(neighborX, neighborZ));
        });
      };

      visitNeighbor(-1, -1);
      visitNeighbor(0, -1);
      visitNeighbor(1, -1);
      visitNeighbor(-1, 0);
      visitNeighbor(0, 0);
      visitNeighbor(1, 0);
      visitNeighbor(-1, 1);
      visitNeighbor(0, 1);
      visitNeighbor(1, 1);

      const d1 = sqrt(minD2);
      const d2v = sqrt(secondMinD2);
      const centerFactor = smoothstep(
        float(0),
        uniforms.uClumpBlendSmoothness,
        d2v.sub(d1),
      );
      const blendFactor = mix(float(0.5), float(1), centerFactor);
      const toCenter = bestDiff.mul(uniforms.uClumpSize);

      const p1Height = mix(
        uniforms.uBladeHeightMin,
        uniforms.uBladeHeightMax,
        hash2to1(int(bestID.x), int(bestID.y)),
      );
      const p1Width = mix(
        uniforms.uBladeWidthMin,
        uniforms.uBladeWidthMax,
        hash2to1(int(bestID.x).add(17), int(bestID.y).add(31)),
      );
      const p1Bend = mix(
        uniforms.uBendAmountMin,
        uniforms.uBendAmountMax,
        hash2to1(int(bestID.x).add(53), int(bestID.y).add(71)),
      );
      const type = hash2to1(int(bestID.x).add(97), int(bestID.y).add(113));

      const p2Height = mix(
        uniforms.uBladeHeightMin,
        uniforms.uBladeHeightMax,
        hash2to1(int(secondBestID.x), int(secondBestID.y)),
      );
      const p2Width = mix(
        uniforms.uBladeWidthMin,
        uniforms.uBladeWidthMax,
        hash2to1(int(secondBestID.x).add(17), int(secondBestID.y).add(31)),
      );
      const p2Bend = mix(
        uniforms.uBendAmountMin,
        uniforms.uBendAmountMax,
        hash2to1(int(secondBestID.x).add(53), int(secondBestID.y).add(71)),
      );

      const clumpHeight = mix(p2Height, p1Height, blendFactor);
      const bladeHeight01 = hash2to1(
        globalGridX.add(int(subIdx).mul(43)),
        globalGridZ.add(int(subIdx).mul(67)),
      );
      const perBladeHeight = mix(
        uniforms.uBladeHeightMin,
        uniforms.uBladeHeightMax,
        bladeHeight01,
      );
      const height = mix(clumpHeight, perBladeHeight, uniforms.uHeightVariation);

      const bladeWidth01 = hash2to1(
        globalGridX.add(int(subIdx).mul(89)),
        globalGridZ.add(int(subIdx).mul(101)),
      );
      const clumpWidth = mix(p2Width, p1Width, blendFactor);
      const perBladeWidth = mix(
        uniforms.uBladeWidthMin,
        uniforms.uBladeWidthMax,
        bladeWidth01,
      );
      const width = mix(clumpWidth, perBladeWidth, uniforms.uHeightVariation);

      const bladeBend01 = hash2to1(
        globalGridX.add(int(subIdx).mul(127)),
        globalGridZ.add(int(subIdx).mul(149)),
      );
      const clumpBend = mix(p2Bend, p1Bend, blendFactor);
      const perBladeBend = mix(
        uniforms.uBendAmountMin,
        uniforms.uBendAmountMax,
        bladeBend01,
      );
      const bend = mix(clumpBend, perBladeBend, uniforms.uHeightVariation);

      const bladeRandSeed = hash2to1(
        globalGridX.add(int(subIdx).mul(3)),
        globalGridZ.add(int(subIdx).mul(7)),
      );
      const bladeRandSeed2 = hash2to1(
        globalGridX.add(int(subIdx).mul(11)),
        globalGridZ.add(int(subIdx).mul(13)),
      );
      const bladeRandSeed3 = hash2to1(
        globalGridX.add(int(subIdx).mul(17)),
        globalGridZ.add(int(subIdx).mul(19)),
      );
      const finalHeight = applyBladeRandomness(
        height,
        uniforms.uBladeRandomness.x,
        bladeRandSeed,
      );
      const finalWidth = applyBladeRandomness(
        width,
        uniforms.uBladeRandomness.y,
        bladeRandSeed2,
      );
      const finalBend = applyBladeRandomness(
        bend,
        uniforms.uBladeRandomness.z,
        bladeRandSeed3,
      );

      const perBladeHash01 = hash2to1(
        globalGridX.add(int(subIdx).mul(5)),
        globalGridZ.add(int(subIdx).mul(11)),
      );
      const clumpSeed01 = hash2to1(int(bestID.x).add(47), int(bestID.y).add(31));
      const clumpHash = hash2to1(int(bestID.x), int(bestID.y));
      const baseAngle = float(0)
        .add(atan(toCenter.y, toCenter.x).mul(uniforms.uCenterYaw).mul(centerFactor))
        .add(perBladeHash01.sub(0.5).mul(uniforms.uBladeYaw))
        .add(clumpHash.sub(0.5).mul(uniforms.uClumpYaw).mul(centerFactor));

      const windStrength01 = calculateWindStrength(
        worldXZ,
        uniforms.uWindDir,
        uniforms.uWindScale,
        uniforms.uTime,
        uniforms.uWindSpeed,
        uniforms.uWindStrength,
      );
      const facingAngle = applyWindFacing(
        baseAngle,
        windStrength01,
        uniforms.uWindDir,
        uniforms.uWindFacing,
      );
      const rotSin = sin(facingAngle);
      const rotCos = cos(facingAngle);

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
      data.get("data0").assign(vec4(finalPos, type));
      data.get("data1").assign(vec4(finalWidth, finalHeight, finalBend, windStrength01));
      data
        .get("data2")
        .assign(vec4(rotSin, rotCos, clumpSeed01, perBladeHash01));
      data.get("data3").assign(vec4(tn.x, tn.z, pushVector.x, pushVector.y));

      buildLODRouting(distToCamera, instanceIndex);
      });
    });
  });

  return { computeFn };
}

export function createResetDrawBufferCompute(lodConfigs: LODBufferConfig[]) {
  const resetFn = Fn(() => {
    lodConfigs.forEach((lodConfig) => {
      const drawBuffer = lodConfig.drawStorage;
      drawBuffer.get("vertexCount").assign(uint(lodConfig.vertexCount));
      atomicStore(drawBuffer.get("instanceCount"), uint(0));
      drawBuffer.get("firstVertex").assign(uint(0));
      drawBuffer.get("firstInstance").assign(uint(0));
      drawBuffer.get("offset").assign(uint(0));
    });
  });

  return resetFn().compute(1);
}

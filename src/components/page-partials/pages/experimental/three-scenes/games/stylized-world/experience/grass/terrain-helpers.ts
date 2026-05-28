/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import {
  Fn,
  If,
  abs,
  acos,
  clamp,
  cos,
  cross,
  dot,
  exp,
  float,
  floor,
  int,
  length,
  max,
  mix,
  normalize,
  select,
  sin,
  smoothstep,
  uint,
  vec2,
  vec3,
} from "three/tsl";
import {
  GROUND_TERRAIN_HEIGHT,
  GROUND_TERRAIN_HILL_CELL_SIZE,
  GROUND_TERRAIN_NOISE_SCALE,
} from "../ground-terrain";
import { hash2to1 } from "./shader-helpers";

function sampleFbm(
  xz: ReturnType<typeof vec2>,
  seed: ReturnType<typeof float>,
) {
  void seed;
  const p = xz.add(vec2(0.001, 0.001));
  const fx = p.x.fract();
  const fz = p.y.fract();
  const ix = int(floor(p.x));
  const iz = int(floor(p.y));
  const h00 = hash2to1(ix, iz);
  const h10 = hash2to1(ix.add(int(1)), iz);
  const h01 = hash2to1(ix, iz.add(int(1)));
  const h11 = hash2to1(ix.add(int(1)), iz.add(int(1)));
  const sx = smoothstep(float(0), float(1), fx);
  const sz = smoothstep(float(0), float(1), fz);
  return mix(mix(h00, h10, sx), mix(h01, h11, sx), sz);
}

const perlinFade = Fn(([t]: [ReturnType<typeof float>]) =>
  t.mul(t).mul(t).mul(t.mul(t.mul(6).sub(15)).add(10)),
);

/** Same hash as `ground-terrain.ts` `hash2` (integer cell coordinates). */
const groundTerrainHash2 = Fn(
  ([x, z, seed]: [
    ReturnType<typeof int>,
    ReturnType<typeof int>,
    ReturnType<typeof int>,
  ]) => {
    let h = uint(x)
      .mul(uint(374761393))
      .add(uint(z).mul(uint(668265263)))
      .add(uint(seed).mul(uint(1442695041)));
    h = h.bitXor(h.shiftRight(uint(13))).mul(uint(1274126177));
    return float(h.bitXor(h.shiftRight(uint(16)))).div(float(4294967295));
  },
);

const groundTerrainValueNoise = Fn(
  ([x, z, seed]: [
    ReturnType<typeof float>,
    ReturnType<typeof float>,
    ReturnType<typeof int>,
  ]) => {
    const ix = floor(x);
    const iz = floor(z);
    const fx = perlinFade(x.sub(ix));
    const fz = perlinFade(z.sub(iz));
    const ixInt = int(ix);
    const izInt = int(iz);
    const a = groundTerrainHash2(ixInt, izInt, seed);
    const b = groundTerrainHash2(ixInt.add(int(1)), izInt, seed);
    const c = groundTerrainHash2(ixInt, izInt.add(int(1)), seed);
    const d = groundTerrainHash2(ixInt.add(int(1)), izInt.add(int(1)), seed);
    return mix(mix(a, b, fx), mix(c, d, fx), fz);
  },
);

const groundTerrainFbm = Fn(
  ([worldX, worldZ, seed]: [
    ReturnType<typeof float>,
    ReturnType<typeof float>,
    ReturnType<typeof int>,
  ]) => {
    const nx = worldX.mul(float(GROUND_TERRAIN_NOISE_SCALE));
    const nz = worldZ.mul(float(GROUND_TERRAIN_NOISE_SCALE));
    const low = groundTerrainValueNoise(
      nx.mul(2.2).add(17.1),
      nz.mul(2.2).sub(3.6),
      seed.add(int(42)),
    )
      .mul(2)
      .sub(1);
    const mid = groundTerrainValueNoise(
      nx.mul(4.4).sub(8.4),
      nz.mul(4.4).add(12.7),
      seed.add(int(91)),
    )
      .mul(2)
      .sub(1);
    const high = groundTerrainValueNoise(
      nx.mul(8.0).add(4.2),
      nz.mul(8.0).sub(7.8),
      seed.add(int(137)),
    )
      .mul(2)
      .sub(1);
    return low.mul(0.62).add(mid.mul(0.28)).add(high.mul(0.1));
  },
);

const accumulateHillCell = Fn(
  ([worldX, worldZ, seed, sum, cellX, cellZ, hillCellSize, heightScale, dx, dz]: [
    ReturnType<typeof float>,
    ReturnType<typeof float>,
    ReturnType<typeof int>,
    ReturnType<typeof import("three/tsl").ShaderNodeObject<typeof float>>,
    ReturnType<typeof float>,
    ReturnType<typeof float>,
    ReturnType<typeof float>,
    ReturnType<typeof float>,
    number,
    number,
  ]) => {
    const cx = cellX.add(float(dx));
    const cz = cellZ.add(float(dz));
    const cxInt = int(cx);
    const czInt = int(cz);
    const peakX = cx
      .add(groundTerrainHash2(cxInt, czInt, seed.add(int(11))))
      .mul(hillCellSize);
    const peakZ = cz
      .add(groundTerrainHash2(cxInt, czInt, seed.add(int(17))))
      .mul(hillCellSize);
    const amp = float(0.45)
      .add(groundTerrainHash2(cxInt, czInt, seed.add(int(23))).mul(0.85))
      .mul(heightScale);
    const radius = hillCellSize.mul(
      float(0.32).add(
        groundTerrainHash2(cxInt, czInt, seed.add(int(31))).mul(0.22),
      ),
    );
    const dxw = worldX.sub(peakX);
    const dzw = worldZ.sub(peakZ);
    const t = exp(
      dxw.mul(dxw).add(dzw.mul(dzw)).negate().div(radius.mul(radius).mul(2)),
    );
    sum.addAssign(amp.mul(t));
  },
);

/** Height in world XZ — matches `sampleGroundTerrainHeight` in `ground-terrain.ts`. */
export function getGroundTerrainHeight(
  terrainSeed: ReturnType<typeof import("three/tsl").uniform>,
  terrainHeightScale: ReturnType<typeof import("three/tsl").uniform>,
  terrainNoiseScale: ReturnType<typeof import("three/tsl").uniform>,
  terrainHillCellSize: ReturnType<typeof import("three/tsl").uniform>,
) {
  return Fn(([xz]: [ReturnType<typeof vec2>]) => {
    const seed = int(terrainSeed);
    const worldX = xz.x;
    const worldZ = xz.y;
    const scaleSafe = max(terrainHeightScale, float(0.001));
    const noiseScaleSafe = max(terrainNoiseScale, float(0.0001));
    const hillCellSafe = max(terrainHillCellSize, float(1));
    const base = groundTerrainFbm(
      worldX.mul(noiseScaleSafe.div(float(GROUND_TERRAIN_NOISE_SCALE))),
      worldZ.mul(noiseScaleSafe.div(float(GROUND_TERRAIN_NOISE_SCALE))),
      seed,
    ).mul(scaleSafe);
    const cellX = floor(worldX.div(hillCellSafe));
    const cellZ = floor(worldZ.div(hillCellSafe));
    const hills = float(0).toVar();
    accumulateHillCell(worldX, worldZ, seed, hills, cellX, cellZ, hillCellSafe, scaleSafe, -1, -1);
    accumulateHillCell(worldX, worldZ, seed, hills, cellX, cellZ, hillCellSafe, scaleSafe, 0, -1);
    accumulateHillCell(worldX, worldZ, seed, hills, cellX, cellZ, hillCellSafe, scaleSafe, 1, -1);
    accumulateHillCell(worldX, worldZ, seed, hills, cellX, cellZ, hillCellSafe, scaleSafe, -1, 0);
    accumulateHillCell(worldX, worldZ, seed, hills, cellX, cellZ, hillCellSafe, scaleSafe, 0, 0);
    accumulateHillCell(worldX, worldZ, seed, hills, cellX, cellZ, hillCellSafe, scaleSafe, 1, 0);
    accumulateHillCell(worldX, worldZ, seed, hills, cellX, cellZ, hillCellSafe, scaleSafe, -1, 1);
    accumulateHillCell(worldX, worldZ, seed, hills, cellX, cellZ, hillCellSafe, scaleSafe, 0, 1);
    accumulateHillCell(worldX, worldZ, seed, hills, cellX, cellZ, hillCellSafe, scaleSafe, 1, 1);
    return base.add(hills);
  });
}

/** Large-scale 0–1 FBM for grass field color patches (world XZ). */
export function getGrassFieldNoise(
  noiseScale: ReturnType<typeof float>,
  noiseSeed: ReturnType<typeof float>,
) {
  return Fn(([xz]: [ReturnType<typeof vec2>]) => {
    const sample = xz
      .mul(noiseScale)
      .add(vec2(noiseSeed.mul(0.13), noiseSeed.mul(0.71)));
    const n0 = sampleFbm(sample, noiseSeed);
    const n1 = sampleFbm(
      sample.mul(1.9).add(vec2(11.3, 4.7)),
      noiseSeed.add(29),
    );
    const n2 = sampleFbm(
      sample.mul(3.8).add(vec2(6.1, 14.2)),
      noiseSeed.add(53),
    );
    return clamp(
      n0.mul(0.55).add(n1.mul(0.3)).add(n2.mul(0.15)),
      float(0),
      float(1),
    );
  });
}

export function getTerrainNormal(
  getTerrainHeightFn: ReturnType<ReturnType<typeof getGroundTerrainHeight>>,
) {
  return Fn(([xz]: [ReturnType<typeof vec2>]) => {
    const baseEpsilon = float(0.1);
    const minDist = max(abs(xz.x), abs(xz.y));
    const epsilon = max(baseEpsilon, minDist.mul(0.01));

    const h = getTerrainHeightFn(xz);
    const hx = getTerrainHeightFn(xz.add(vec2(epsilon, float(0))));
    const hz = getTerrainHeightFn(xz.add(vec2(float(0), epsilon)));

    const p1 = vec3(epsilon, hx.sub(h), float(0));
    const p2 = vec3(float(0), hz.sub(h), epsilon);
    const normal = cross(p2, p1);
    const len = length(normal);

    return select(
      len.greaterThan(float(0.0001)),
      normalize(normal),
      vec3(0, 1, 0),
    );
  });
}

export const rotateAxis = Fn(
  ([v, axis, angle]: [
    ReturnType<typeof vec3>,
    ReturnType<typeof vec3>,
    ReturnType<typeof float>,
  ]) => {
    const axisNorm = normalize(axis);
    const proj = axisNorm.mul(dot(axisNorm, v));
    return proj
      .add(v.sub(proj).mul(cos(angle)))
      .add(cross(axisNorm, v).mul(sin(angle)));
  },
);

/** Align blade local up to terrain normal (False Earth slope alignment). */
export function applySlopeAlignment(
  terrainNormal: ReturnType<typeof vec3>,
  lpos: ReturnType<typeof vec3>,
  tangentRotated: ReturnType<typeof vec3>,
  sideRotated: ReturnType<typeof vec3>,
  normalRotated: ReturnType<typeof vec3>,
) {
  const up = vec3(0, 1, 0);
  const axis = cross(up, terrainNormal);
  const dotProd = clamp(dot(up, terrainNormal), float(-1), float(1));
  const angle = acos(dotProd);
  const shouldRotate = length(axis).greaterThan(float(0.001));

  If(shouldRotate, () => {
    const axisNorm = normalize(axis);
    lpos.assign(rotateAxis(lpos, axisNorm, angle));
    tangentRotated.assign(rotateAxis(tangentRotated, axisNorm, angle));
    sideRotated.assign(rotateAxis(sideRotated, axisNorm, angle));
    normalRotated.assign(rotateAxis(normalRotated, axisNorm, angle));
  });
}

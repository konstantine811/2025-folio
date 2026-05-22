import {
  Fn,
  If,
  abs,
  acos,
  clamp,
  cos,
  cross,
  dot,
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
  vec2,
  vec3,
} from "three/tsl";
import { hash2to1 } from "./shader-helpers";

function sampleFbm(
  xz: ReturnType<typeof vec2>,
  seed: ReturnType<typeof float>,
) {
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

/** Procedural FBM height — matches False Earth role without MaterialX noise. */
export function getTerrainHeight(
  terrainAmp: ReturnType<typeof float>,
  terrainFreq: ReturnType<typeof float>,
  terrainSeed: ReturnType<typeof float>,
) {
  return Fn(([xz]: [ReturnType<typeof vec2>]) => {
    const sample = xz.mul(terrainFreq).add(vec2(terrainSeed, float(0)));
    const n0 = sampleFbm(sample, terrainSeed);
    const n1 = sampleFbm(
      sample.mul(2.1).add(vec2(13.7, 9.2)),
      terrainSeed.add(17),
    );
    const n2 = sampleFbm(
      sample.mul(4.3).add(vec2(4.1, 7.9)),
      terrainSeed.add(43),
    );
    const fbm = n0.mul(0.55).add(n1.mul(0.3)).add(n2.mul(0.15));
    return fbm.sub(0.5).mul(2).mul(terrainAmp);
  });
}

export function getTerrainNormal(
  getTerrainHeightFn: ReturnType<ReturnType<typeof getTerrainHeight>>,
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

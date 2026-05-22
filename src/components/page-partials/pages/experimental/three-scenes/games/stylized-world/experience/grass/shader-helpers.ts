import {
  Fn,
  If,
  abs,
  atan,
  clamp,
  cos,
  cross,
  dot,
  float,
  floor,
  int,
  length,
  mix,
  mul,
  normalize,
  oneMinus,
  pow,
  select,
  sin,
  smoothstep,
  uint,
  vec2,
  vec3,
  vec4,
} from "three/tsl";

const PCG_MUL = 747796405;
const PCG_ADD = 2891336453;
const PCG_OUT = 277803737;
const PCG_MAX = 4294967295;

export const pcgHash = Fn(([u]: [ReturnType<typeof uint>]) => {
  const state = u.mul(uint(PCG_MUL)).add(uint(PCG_ADD));
  let word = state
    .shiftRight(state.shiftRight(uint(28)).add(uint(4)))
    .bitXor(state);
  word = word.mul(uint(PCG_OUT));
  word = word.shiftRight(uint(22)).bitXor(word);
  return float(word).div(float(PCG_MAX));
});

export const hash2to1 = Fn(([x, y]: [unknown, unknown]) => {
  const seed = uint(x)
    .mul(uint(1597334677))
    .add(uint(y).mul(uint(3812015801)));
  return pcgHash(seed);
});

export const hash2to2 = Fn(([x, y]: [unknown, unknown]) => {
  const seed1 = uint(x)
    .mul(uint(1597334677))
    .add(uint(y).mul(uint(3812015801)));
  const seed2 = uint(x)
    .mul(uint(3812015801))
    .add(uint(y).mul(uint(1597334677)));
  return vec2(pcgHash(seed1), pcgHash(seed2));
});

export const bezier3 = Fn(
  ([p0, p1, p2, p3, t]: [
    ReturnType<typeof vec3>,
    ReturnType<typeof vec3>,
    ReturnType<typeof vec3>,
    ReturnType<typeof vec3>,
    ReturnType<typeof float>,
  ]) => {
    const u = oneMinus(t);
    const u2 = u.mul(u);
    const u3 = u2.mul(u);
    const t2 = t.mul(t);
    const t3 = t2.mul(t);
    return p0
      .mul(u3)
      .add(p1.mul(float(3)).mul(u2).mul(t))
      .add(p2.mul(float(3)).mul(u).mul(t2))
      .add(p3.mul(t3));
  },
);

export const bezier3Tangent = Fn(
  ([p0, p1, p2, p3, t]: [
    ReturnType<typeof vec3>,
    ReturnType<typeof vec3>,
    ReturnType<typeof vec3>,
    ReturnType<typeof vec3>,
    ReturnType<typeof float>,
  ]) => {
    const u = oneMinus(t);
    return p1
      .sub(p0)
      .mul(u.mul(u).mul(3))
      .add(p2.sub(p1).mul(u.mul(t).mul(6)))
      .add(p3.sub(p2).mul(t.mul(t).mul(3)));
  },
);

/** Plain TSL builder — do not wrap in Fn() when returning multiple nodes. */
export function getBezierControlPoints(
  discreteType: unknown,
  height: unknown,
  bend: unknown,
) {
  const p1Type0 = vec3(float(0), (height as ReturnType<typeof float>).mul(0.4), (bend as ReturnType<typeof float>).mul(0.5));
  const p2Type0 = vec3(float(0), (height as ReturnType<typeof float>).mul(0.75), (bend as ReturnType<typeof float>).mul(0.7));
  const p1Type1 = vec3(float(0), (height as ReturnType<typeof float>).mul(0.35), (bend as ReturnType<typeof float>).mul(0.6));
  const p2Type1 = vec3(float(0), (height as ReturnType<typeof float>).mul(0.7), (bend as ReturnType<typeof float>).mul(0.8));
  const p1Type2 = vec3(float(0), (height as ReturnType<typeof float>).mul(0.3), (bend as ReturnType<typeof float>).mul(0.7));
  const p2Type2 = vec3(float(0), (height as ReturnType<typeof float>).mul(0.65), (bend as ReturnType<typeof float>).mul(1.0));

  const isType0 = (discreteType as ReturnType<typeof float>).equal(float(0));
  const isType1 = (discreteType as ReturnType<typeof float>).equal(float(1));
  const p1 = select(isType0, p1Type0, select(isType1, p1Type1, p1Type2));
  const p2 = select(isType0, p2Type0, select(isType1, p2Type1, p2Type2));
  return { p1, p2 };
}

export function applyWindPush(
  p1: ReturnType<typeof vec3>,
  p2: ReturnType<typeof vec3>,
  p3: ReturnType<typeof vec3>,
  windDir: ReturnType<typeof vec3>,
  windStrength: ReturnType<typeof float>,
  height: ReturnType<typeof float>,
) {
  const tipPush = windStrength.mul(height).mul(0.25);
  const midPush1 = windStrength.mul(height).mul(0.08);
  const midPush2 = windStrength.mul(height).mul(0.15);
  return {
    p1: p1.add(windDir.mul(midPush1)),
    p2: p2.add(windDir.mul(midPush2)),
    p3: p3.add(windDir.mul(tipPush)),
  };
}

export function applyVertexSway(
  side: ReturnType<typeof vec3>,
  t: ReturnType<typeof float>,
  height: ReturnType<typeof float>,
  windStrength: ReturnType<typeof float>,
  perBladeHash01: ReturnType<typeof float>,
  worldXZ: ReturnType<typeof vec2>,
  windDir2: ReturnType<typeof vec2>,
  uTime: ReturnType<typeof float>,
  uWindSwayStrength: ReturnType<typeof float>,
) {
  const topSwayMask = smoothstep(float(0.5), float(1.0), t);
  const seed = perBladeHash01.mul(3.567).mod(float(1.0));
  const gust = float(0.65).add(
    float(0.35).mul(sin(uTime.mul(0.35).add(seed.mul(6.28318)))),
  );
  const wave = dot(worldXZ, windDir2).mul(0.15);
  const baseFreq = float(1.2).add(seed.mul(0.8));
  const phase = perBladeHash01.mul(6.28318).add(wave);
  const low = sin(uTime.mul(baseFreq).add(phase).add(t.mul(2.2)));
  const high = sin(
    uTime.mul(baseFreq.mul(5.0)).add(phase.mul(1.7)).add(t.mul(5.0)),
  );
  const amp = height.mul(windStrength);
  const swayLow = amp.mul(gust).mul(uWindSwayStrength);
  const swayHigh = amp.mul(0.8).mul(uWindSwayStrength);
  const swayAmount = low.mul(swayLow).add(high.mul(swayHigh));
  return side.mul(swayAmount).mul(topSwayMask);
}

export function applyViewDependentTilt(
  posObj: ReturnType<typeof vec3>,
  posW: ReturnType<typeof vec3>,
  side: ReturnType<typeof vec3>,
  normal: ReturnType<typeof vec3>,
  uvCoords: ReturnType<typeof vec2>,
  t: ReturnType<typeof float>,
  thicknessStrength: ReturnType<typeof float>,
  modelWorldMatrix: unknown,
  cameraPos: unknown,
) {
  const camDirW = normalize((cameraPos as ReturnType<typeof vec3>).sub(posW));
  const sideW = normalize(mul(modelWorldMatrix, vec4(side, float(0))).xyz);
  const camDirLocalY = dot(camDirW, sideW);
  const edgeMask = clamp(
    uvCoords.x.sub(0.5).mul(camDirLocalY).mul(pow(abs(camDirLocalY), float(1.2))),
    0,
    1,
  );
  const centerMask = pow(oneMinus(t), float(0.5)).mul(
    pow(t.add(0.05), float(0.33)),
  );
  const normalXZ = normalize(vec3(normal.x, float(0), normal.z));
  return posObj.add(
    normalXZ.mul(thicknessStrength.mul(edgeMask).mul(centerMask)),
  );
}

export function safeNormalize2D(v: ReturnType<typeof vec2>) {
  const len = length(v);
  return len.lessThan(float(0.001)).select(vec2(1, 0), v.div(len));
}

/** Horizontal camera-facing width axis for single-sided grass billboards. */
export function computeGrassBillboardSide(
  spineWorld: ReturnType<typeof vec3>,
  cameraPos: ReturnType<typeof vec3>,
) {
  const toCamXZ = vec2(
    cameraPos.x.sub(spineWorld.x),
    cameraPos.z.sub(spineWorld.z),
  );
  const viewDir2 = safeNormalize2D(toCamXZ);
  return normalize(cross(vec3(0, 1, 0), vec3(viewDir2.x, float(0), viewDir2.y)));
}

/** Per-blade wind strength in [0, maxStrength] — False Earth-style patch + gust noise. */
export function calculateWindStrength(
  worldXZ: ReturnType<typeof vec2>,
  windDir: ReturnType<typeof vec2>,
  windScale: ReturnType<typeof float>,
  uTime: ReturnType<typeof float>,
  windSpeed: ReturnType<typeof float>,
  maxStrength: ReturnType<typeof float>,
) {
  const windDirNorm = safeNormalize2D(windDir);
  const windUv = worldXZ.mul(windScale).add(windDirNorm.mul(uTime).mul(windSpeed));

  const ix = int(floor(windUv.x));
  const iz = int(floor(windUv.y));
  const fx = windUv.x.fract();
  const fz = windUv.y.fract();

  const h00 = hash2to1(ix, iz);
  const h10 = hash2to1(ix.add(int(1)), iz);
  const h01 = hash2to1(ix, iz.add(int(1)));
  const h11 = hash2to1(ix.add(int(1)), iz.add(int(1)));
  const sx = smoothstep(float(0), float(1), fx);
  const sz = smoothstep(float(0), float(1), fz);
  const patchNoise = mix(mix(h00, h10, sx), mix(h01, h11, sx), sz);

  const wavePhase = dot(worldXZ, windDirNorm).mul(windScale.mul(2));
  const gust = sin(uTime.mul(windSpeed.mul(3)).add(wavePhase)).mul(0.5).add(0.5);
  const combined = patchNoise.mul(0.55).add(gust.mul(0.45));

  return clamp(combined.mul(maxStrength), float(0), float(1));
}

/** Multiplicative per-blade jitter after clump shaping — False Earth uBladeRandomness. */
export function applyBladeRandomness(
  value: ReturnType<typeof float>,
  randomness: ReturnType<typeof float>,
  seed: ReturnType<typeof float>,
) {
  return value.mul(mix(oneMinus(randomness), float(1).add(randomness), seed));
}

/** Rotate blade yaw toward wind direction, scaled by gust strength. */
export function applyWindFacing(
  baseAngle: ReturnType<typeof float>,
  windStrength01: ReturnType<typeof float>,
  windDir: ReturnType<typeof vec2>,
  windFacing: ReturnType<typeof float>,
) {
  const windAngle = atan(windDir.y, windDir.x);
  const angleDiff = atan(
    sin(windAngle.sub(baseAngle)),
    cos(windAngle.sub(baseAngle)),
  );
  return baseAngle.add(angleDiff.mul(windFacing.mul(windStrength01)));
}

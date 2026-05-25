import type * as THREE from "three";
import { float, length, texture, time, uniform, vec2 } from "three/tsl";

type WindScalar =
  | ReturnType<typeof float>
  | ReturnType<typeof uniform<number>>;

function safeNormalize2D(v: ReturnType<typeof vec2>) {
  const len = length(v);
  return len.lessThan(float(0.001)).select(vec2(1, 0), v.div(len));
}

/**
 * Dual-frequency scrolling Perlin wind offset in world XZ.
 * Returns vec2 displacement along windDir (same idea as bush/grass wind shaders).
 */
export function samplePerlinWindOffset(
  perlinTexture: THREE.Texture,
  worldXZ: ReturnType<typeof vec2>,
  windDir: ReturnType<typeof vec2>,
  windSpeed: WindScalar,
  strength: WindScalar,
) {
  const direction = safeNormalize2D(windDir);
  const noiseUv1 = worldXZ
    .mul(0.06)
    .add(direction.mul(time.mul(windSpeed.mul(0.1))));
  const noise1 = texture(perlinTexture, noiseUv1).r.sub(0.5);
  const noiseUv2 = worldXZ
    .mul(0.043)
    .add(direction.mul(time.mul(windSpeed.mul(0.03))));
  const noise2 = texture(perlinTexture, noiseUv2).r;
  const intensity = noise1.mul(noise2).mul(strength);
  return direction.mul(intensity);
}

import { useMemo } from "react";
import * as THREE from "three";
import { uniform, vec2, vec3 } from "three/tsl";
import {
  DEFAULT_GRASS_RUNTIME,
  type GrassRuntimeConfig,
  type GrassUniforms,
} from "./config";

export function useGrassUniforms(config: GrassRuntimeConfig = {}) {
  const params = { ...DEFAULT_GRASS_RUNTIME, ...config };

  const uniforms = useMemo<GrassUniforms>(
    () => ({
      compute: {
        uBladeHeightMin: uniform(params.bladeHeightMin),
        uBladeHeightMax: uniform(params.bladeHeightMax),
        uBladeWidthMin: uniform(params.bladeWidthMin),
        uBladeWidthMax: uniform(params.bladeWidthMax),
        uBendAmountMin: uniform(params.bendMin),
        uBendAmountMax: uniform(params.bendMax),
        uLODNoiseScale: uniform(0.08),
        uViewProjectionMatrix: uniform(new THREE.Matrix4()),
        uCameraPosition: uniform(new THREE.Vector3()),
        uGroupOffset: uniform(new THREE.Vector3()),
        uGridIndex: uniform(new THREE.Vector2(0, 0)),
        uCharacterWorldPos: uniform(new THREE.Vector3(9999, 0, 9999)),
        uCharacterPushRadius: uniform(params.pushRadius),
        uCharacterPushAmount: uniform(params.pushAmount),
      },
      material: {
        uWindDir: uniform(
          new THREE.Vector2(params.windDirX, params.windDirZ).normalize(),
        ),
        uWindSwayStrength: uniform(params.windSwayStrength),
        uBaseColor: uniform(vec3(0.28, 0.38, 0.14)),
        uTipColor: uniform(vec3(0.72, 0.78, 0.42)),
        uBladeSeedRange: uniform(vec2(0.94, 1.06)),
        uClumpSeedRange: uniform(vec2(0.9, 1.1)),
        uAOPower: uniform(1.35),
        uBaseWidth: uniform(0.35),
        uTipThin: uniform(0.9),
        uThicknessStrength: uniform(0.1),
        uGroupOffset: uniform(new THREE.Vector3()),
        uCharacterFlattenAmount: uniform(params.flattenAmount),
      },
    }),
    [],
  );

  const syncUniforms = (next: GrassRuntimeConfig) => {
    const merged = { ...DEFAULT_GRASS_RUNTIME, ...next };
    uniforms.compute.uBladeHeightMin.value = merged.bladeHeightMin;
    uniforms.compute.uBladeHeightMax.value = merged.bladeHeightMax;
    uniforms.compute.uBladeWidthMin.value = merged.bladeWidthMin;
    uniforms.compute.uBladeWidthMax.value = merged.bladeWidthMax;
    uniforms.compute.uBendAmountMin.value = merged.bendMin;
    uniforms.compute.uBendAmountMax.value = merged.bendMax;
    uniforms.compute.uCharacterPushRadius.value = merged.pushRadius;
    uniforms.compute.uCharacterPushAmount.value = merged.pushAmount;
    uniforms.material.uWindSwayStrength.value = merged.windSwayStrength;
    uniforms.material.uCharacterFlattenAmount.value = merged.flattenAmount;
    uniforms.material.uWindDir.value
      .set(merged.windDirX, merged.windDirZ)
      .normalize();
  };

  return { uniforms, syncUniforms };
}

import { useCallback, useMemo } from "react";
import * as THREE from "three";
import { uniform, vec2, vec3 } from "three/tsl";
import {
  DEFAULT_GRASS_RUNTIME,
  type GrassRuntimeConfig,
  type GrassUniforms,
} from "./config";

function resolveStraightness(straightness: number) {
  const s = THREE.MathUtils.clamp(straightness, 0, 1);
  return {
    bendMin: THREE.MathUtils.lerp(0.28, 0.02, s),
    bendMax: THREE.MathUtils.lerp(0.62, 0.08, s),
    centerYaw: THREE.MathUtils.lerp(1.0, 0.05, s),
    bladeYaw: THREE.MathUtils.lerp(1.2, 0.12, s),
    clumpYaw: THREE.MathUtils.lerp(0.5, 0.05, s),
  };
}

export function useGrassUniforms(config: GrassRuntimeConfig = {}) {
  const params = { ...DEFAULT_GRASS_RUNTIME, ...config };
  const alignment = resolveStraightness(params.straightness);

  const uniforms = useMemo<GrassUniforms>(
    () => ({
      compute: {
        uBladeHeightMin: uniform(params.bladeHeightMin),
        uBladeHeightMax: uniform(params.bladeHeightMax),
        uBladeWidthMin: uniform(params.bladeWidthMin),
        uBladeWidthMax: uniform(params.bladeWidthMax),
        uBendAmountMin: uniform(alignment.bendMin),
        uBendAmountMax: uniform(alignment.bendMax),
        uClumpSize: uniform(params.clumpSize),
        uClumpBlendSmoothness: uniform(params.clumpBlend),
        uCenterYaw: uniform(alignment.centerYaw),
        uBladeYaw: uniform(alignment.bladeYaw),
        uClumpYaw: uniform(alignment.clumpYaw),
        uDensity: uniform(params.density),
        uHeightVariation: uniform(params.heightVariation),
        uBladeRandomness: uniform(
          new THREE.Vector3(
            params.bladeRandomnessX,
            params.bladeRandomnessY,
            params.bladeRandomnessZ,
          ),
        ),
        uLODNoiseScale: uniform(0.1),
        uViewProjectionMatrix: uniform(new THREE.Matrix4()),
        uCameraPosition: uniform(new THREE.Vector3()),
        uGroupOffset: uniform(new THREE.Vector3()),
        uGridIndex: uniform(new THREE.Vector2(0, 0)),
        uCharacterWorldPos: uniform(new THREE.Vector3(9999, 0, 9999)),
        uCharacterPushRadius: uniform(params.pushRadius),
        uCharacterPushAmount: uniform(params.pushAmount),
        uWindDir: uniform(
          new THREE.Vector2(params.windDirX, params.windDirZ).normalize(),
        ),
        uWindScale: uniform(params.windScale),
        uWindSpeed: uniform(params.windSpeed),
        uWindStrength: uniform(params.windStrength),
        uWindFacing: uniform(params.windFacing),
        uTime: uniform(0),
        uTerrainSeed: uniform(params.terrainSeed),
      },
      material: {
        uWindDir: uniform(
          new THREE.Vector2(params.windDirX, params.windDirZ).normalize(),
        ),
        uWindSwayStrength: uniform(params.windSwayStrength),
        uWindSpeed: uniform(params.windSpeed),
        uBaseColor: uniform(vec3(0.36, 0.5, 0.2)),
        uTipColor: uniform(vec3(0.78, 0.84, 0.48)),
        uBladeSeedRange: uniform(vec2(0.94, 1.06)),
        uClumpSeedRange: uniform(vec2(0.9, 1.1)),
        uAOPower: uniform(1.1),
        uBaseWidth: uniform(0.35),
        uTipThin: uniform(0.9),
        uThicknessStrength: uniform(0.1),
        uGroupOffset: uniform(new THREE.Vector3()),
        uCharacterFlattenAmount: uniform(params.flattenAmount),
        uDebugLod: uniform(params.debugLod ? 1 : 0),
        uMidSoft: uniform(0.25),
        uRimPos: uniform(0.42),
        uRimSoft: uniform(0.03),
        uWindDistanceStart: uniform(params.windDistanceStart),
        uWindDistanceEnd: uniform(params.windDistanceEnd),
        uDistFadeNear: uniform(15),
        uDistFadeFar: uniform(30),
        uColorNoiseScale: uniform<number>(params.colorNoiseScale),
        uColorNoiseSeed: uniform<number>(params.colorNoiseSeed),
        uFieldColorDark: uniform(vec3(0.26, 0.4, 0.15)),
        uFieldColorLight: uniform(vec3(0.64, 0.74, 0.36)),
      },
    }),
    [],
  );

  const syncUniforms = useCallback((next: GrassRuntimeConfig) => {
    const merged = { ...DEFAULT_GRASS_RUNTIME, ...next };
    const nextAlignment = resolveStraightness(merged.straightness);

    uniforms.compute.uBladeHeightMin.value = merged.bladeHeightMin;
    uniforms.compute.uBladeHeightMax.value = merged.bladeHeightMax;
    uniforms.compute.uBladeWidthMin.value = merged.bladeWidthMin;
    uniforms.compute.uBladeWidthMax.value = merged.bladeWidthMax;
    uniforms.compute.uBendAmountMin.value = nextAlignment.bendMin;
    uniforms.compute.uBendAmountMax.value = nextAlignment.bendMax;
    uniforms.compute.uClumpSize.value = merged.clumpSize;
    uniforms.compute.uClumpBlendSmoothness.value = merged.clumpBlend;
    uniforms.compute.uCenterYaw.value = nextAlignment.centerYaw;
    uniforms.compute.uBladeYaw.value = nextAlignment.bladeYaw;
    uniforms.compute.uClumpYaw.value = nextAlignment.clumpYaw;
    uniforms.compute.uDensity.value = THREE.MathUtils.clamp(merged.density, 0.05, 1);
    uniforms.compute.uHeightVariation.value = THREE.MathUtils.clamp(
      merged.heightVariation,
      0,
      1,
    );
    uniforms.compute.uBladeRandomness.value.set(
      merged.bladeRandomnessX,
      merged.bladeRandomnessY,
      merged.bladeRandomnessZ,
    );
    uniforms.compute.uCharacterPushRadius.value = merged.pushRadius;
    uniforms.compute.uCharacterPushAmount.value = merged.pushAmount;
    uniforms.compute.uWindDir.value
      .set(merged.windDirX, merged.windDirZ)
      .normalize();
    uniforms.compute.uWindScale.value = merged.windScale;
    uniforms.compute.uWindSpeed.value = merged.windSpeed;
    uniforms.compute.uWindStrength.value = merged.windStrength;
    uniforms.compute.uWindFacing.value = merged.windFacing;
    uniforms.compute.uTerrainSeed.value = merged.terrainSeed;
    uniforms.material.uWindSwayStrength.value = merged.windSwayStrength;
    uniforms.material.uWindSpeed.value = merged.windSpeed;
    uniforms.material.uCharacterFlattenAmount.value = merged.flattenAmount;
    uniforms.material.uDebugLod.value = merged.debugLod ? 1 : 0;
    uniforms.material.uWindDir.value
      .set(merged.windDirX, merged.windDirZ)
      .normalize();
    uniforms.material.uWindDistanceStart.value = merged.windDistanceStart;
    uniforms.material.uWindDistanceEnd.value = merged.windDistanceEnd;
    uniforms.material.uColorNoiseScale.value = merged.colorNoiseScale;
    uniforms.material.uColorNoiseSeed.value = merged.colorNoiseSeed;
  }, [uniforms]);

  // Keep GPU uniforms in sync every render (same pattern as bush material).
  syncUniforms(params);

  return { uniforms, syncUniforms };
}

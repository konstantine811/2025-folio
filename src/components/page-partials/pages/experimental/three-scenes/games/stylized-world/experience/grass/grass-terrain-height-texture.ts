import * as THREE from "three";
import {
  DEFAULT_TERRAIN_PROFILE,
  sampleGroundTerrainHeight,
  type TerrainProfile,
} from "../ground-terrain";

export const TERRAIN_HEIGHT_TEXTURE_RESOLUTION = 192;
export const TERRAIN_HEIGHT_TEXTURE_HALF_SIZE = 96;
export const TERRAIN_HEIGHT_TEXTURE_REBUILD_MARGIN = 28;

export type GrassTerrainHeightTextureState = {
  texture: THREE.DataTexture | null;
  data: Float32Array | null;
  centerX: number;
  centerZ: number;
  halfSize: number;
};

export function createGrassTerrainHeightTextureState(): GrassTerrainHeightTextureState {
  return {
    texture: null,
    data: null,
    centerX: 0,
    centerZ: 0,
    halfSize: TERRAIN_HEIGHT_TEXTURE_HALF_SIZE,
  };
}

export function rebuildGrassTerrainHeightTexture(
  state: GrassTerrainHeightTextureState,
  centerX: number,
  centerZ: number,
  seed: number,
  profile: TerrainProfile = DEFAULT_TERRAIN_PROFILE,
) {
  const resolution = TERRAIN_HEIGHT_TEXTURE_RESOLUTION;
  const halfSize = TERRAIN_HEIGHT_TEXTURE_HALF_SIZE;
  const pixelCount = resolution * resolution;

  if (!state.data || state.data.length !== pixelCount) {
    state.data = new Float32Array(pixelCount);
  }

  const data = state.data;

  for (let z = 0; z < resolution; z += 1) {
    for (let x = 0; x < resolution; x += 1) {
      const u = x / (resolution - 1);
      const v = z / (resolution - 1);
      const worldX = centerX + (u - 0.5) * halfSize * 2;
      const worldZ = centerZ + (v - 0.5) * halfSize * 2;
      data[z * resolution + x] = sampleGroundTerrainHeight({
        worldX,
        worldZ,
        seed,
        profile,
      });
    }
  }

  if (
    !state.texture ||
    state.texture.image.width !== resolution ||
    state.texture.image.height !== resolution
  ) {
    state.texture?.dispose();
    state.texture = new THREE.DataTexture(
      data,
      resolution,
      resolution,
      THREE.RedFormat,
      THREE.FloatType,
    );
    state.texture.colorSpace = THREE.NoColorSpace;
    state.texture.wrapS = THREE.ClampToEdgeWrapping;
    state.texture.wrapW = THREE.ClampToEdgeWrapping;
    state.texture.magFilter = THREE.LinearFilter;
    state.texture.minFilter = THREE.LinearFilter;
  } else {
    state.texture.image.data = data;
  }

  state.texture.needsUpdate = true;
  state.centerX = centerX;
  state.centerZ = centerZ;
  state.halfSize = halfSize;
}

export function shouldRebuildGrassTerrainHeightTexture(
  centerX: number,
  centerZ: number,
  lastCenterX: number | null,
  lastCenterZ: number | null,
  margin = TERRAIN_HEIGHT_TEXTURE_REBUILD_MARGIN,
) {
  if (lastCenterX === null || lastCenterZ === null) return true;
  return (
    Math.abs(centerX - lastCenterX) > margin ||
    Math.abs(centerZ - lastCenterZ) > margin
  );
}

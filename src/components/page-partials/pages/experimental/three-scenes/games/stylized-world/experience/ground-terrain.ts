import * as THREE from "three";
import type { HeightfieldArgs } from "@react-three/rapier";

export const GROUND_TERRAIN_SEGMENTS = 16;
export const GROUND_TERRAIN_HEIGHT = 0.58;
/** Overlap into neighboring tiles so wheel rays cannot slip through seams. */
export const GROUND_TILE_COLLIDER_OVERLAP = 0.18;

/** Розмір «комірки» для випадкових пагорбів у світових координатах. */
export const GROUND_TERRAIN_HILL_CELL_SIZE = 18;
export const GROUND_TERRAIN_NOISE_SCALE = 0.11;

export type TerrainProfile = {
  heightScale: number;
  noiseScale: number;
  hillCellSize: number;
};

export type TerrainStroke = {
  x: number;
  z: number;
  radius: number;
  strength: number;
};

export const DEFAULT_TERRAIN_PROFILE: TerrainProfile = {
  heightScale: GROUND_TERRAIN_HEIGHT,
  noiseScale: GROUND_TERRAIN_NOISE_SCALE,
  hillCellSize: GROUND_TERRAIN_HILL_CELL_SIZE,
};

const terrainStrokes: TerrainStroke[] = [];

export function addTerrainStroke(stroke: TerrainStroke) {
  terrainStrokes.push(stroke);
}

export function clearTerrainStrokes() {
  terrainStrokes.length = 0;
}

function sculptLayer(worldX: number, worldZ: number) {
  let sum = 0;
  for (const stroke of terrainStrokes) {
    const dx = worldX - stroke.x;
    const dz = worldZ - stroke.z;
    const distance = Math.hypot(dx, dz);
    if (distance > stroke.radius) continue;
    const t = 1 - distance / stroke.radius;
    sum += stroke.strength * t * t;
  }
  return sum;
}

type TerrainSample = {
  worldX: number;
  worldZ: number;
  seed?: number;
  profile?: TerrainProfile;
};

function fade(value: number) {
  return value * value * value * (value * (value * 6 - 15) + 10);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function hash2(x: number, z: number, seed: number) {
  let h = x * 374761393 + z * 668265263 + seed * 1442695041;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

function valueNoise(x: number, z: number, seed: number) {
  const ix = Math.floor(x);
  const iz = Math.floor(z);
  const fx = fade(x - ix);
  const fz = fade(z - iz);

  const a = hash2(ix, iz, seed);
  const b = hash2(ix + 1, iz, seed);
  const c = hash2(ix, iz + 1, seed);
  const d = hash2(ix + 1, iz + 1, seed);

  return lerp(lerp(a, b, fx), lerp(c, d, fx), fz);
}

function fbm(
  worldX: number,
  worldZ: number,
  seed: number,
  profile: TerrainProfile,
) {
  const nx = worldX * profile.noiseScale;
  const nz = worldZ * profile.noiseScale;

  const low = valueNoise(nx * 2.2 + 17.1, nz * 2.2 - 3.6, seed + 42) * 2 - 1;
  const mid = valueNoise(nx * 4.4 - 8.4, nz * 4.4 + 12.7, seed + 91) * 2 - 1;
  const high = valueNoise(nx * 8.0 + 4.2, nz * 8.0 - 7.8, seed + 137) * 2 - 1;

  return low * 0.62 + mid * 0.28 + high * 0.1;
}

/** Випадкові пагорби: зміщені центри та висота в кожній комірці (без швів між тайлами). */
function hillLayer(
  worldX: number,
  worldZ: number,
  seed: number,
  profile: TerrainProfile,
) {
  const cellSize = Math.max(1, profile.hillCellSize);
  const cellX = Math.floor(worldX / cellSize);
  const cellZ = Math.floor(worldZ / cellSize);
  let sum = 0;

  for (let dz = -1; dz <= 1; dz++) {
    for (let dx = -1; dx <= 1; dx++) {
      const cx = cellX + dx;
      const cz = cellZ + dz;
      const peakX = (cx + hash2(cx, cz, seed + 11)) * cellSize;
      const peakZ = (cz + hash2(cx, cz, seed + 17)) * cellSize;
      const amp =
        (0.45 + hash2(cx, cz, seed + 23) * 0.85) * profile.heightScale;
      const radius =
        cellSize * (0.32 + hash2(cx, cz, seed + 31) * 0.22);
      const dxw = worldX - peakX;
      const dzw = worldZ - peakZ;
      const t = Math.exp(-(dxw * dxw + dzw * dzw) / (2 * radius * radius));
      sum += amp * t;
    }
  }

  return sum;
}

/** Висота в світових XZ — однакова на стиках сусідніх тайлів. */
export function sampleGroundTerrainHeight({
  worldX,
  worldZ,
  seed = 42,
  profile = DEFAULT_TERRAIN_PROFILE,
}: TerrainSample) {
  const base = fbm(worldX, worldZ, seed, profile) * profile.heightScale;
  const hills = hillLayer(worldX, worldZ, seed, profile);
  const sculpt = sculptLayer(worldX, worldZ);
  return base + hills + sculpt;
}

export function getGroundTerrainWorldPosition(
  tileX: number,
  tileZ: number,
  tileSize: number,
  localX: number,
  localZ: number,
) {
  const half = tileSize / 2;
  return {
    worldX: tileX * tileSize + half + localX,
    worldZ: tileZ * tileSize + half + localZ,
  };
}

/** Шаблон сітки (XZ); Y оновлюється через `applyGroundTerrainToGeometry`. */
export function createGroundTerrainGeometryTemplate(
  tileSize: number,
  segments = GROUND_TERRAIN_SEGMENTS,
) {
  const points = segments + 1;
  const positions = new Float32Array(points * points * 3);
  const uvs = new Float32Array(points * points * 2);
  const indices: number[] = [];

  for (let zIndex = 0; zIndex < points; zIndex++) {
    for (let xIndex = 0; xIndex < points; xIndex++) {
      const vertexIndex = zIndex * points + xIndex;
      const u = xIndex / segments;
      const v = zIndex / segments;
      const x = (u - 0.5) * tileSize;
      const z = (v - 0.5) * tileSize;

      positions[vertexIndex * 3] = x;
      positions[vertexIndex * 3 + 1] = 0;
      positions[vertexIndex * 3 + 2] = z;
      uvs[vertexIndex * 2] = u;
      uvs[vertexIndex * 2 + 1] = v;
    }
  }

  for (let zIndex = 0; zIndex < segments; zIndex++) {
    for (let xIndex = 0; xIndex < segments; xIndex++) {
      const a = zIndex * points + xIndex;
      const b = a + 1;
      const c = a + points;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex(indices);

  return geometry;
}

export function applyGroundTerrainToGeometry(
  geometry: THREE.BufferGeometry,
  tileX: number,
  tileZ: number,
  tileSize: number,
  seed = 42,
  profile = DEFAULT_TERRAIN_PROFILE,
) {
  const position = geometry.getAttribute("position") as THREE.BufferAttribute;
  const half = tileSize / 2;
  const originX = tileX * tileSize + half;
  const originZ = tileZ * tileSize + half;

  for (let i = 0; i < position.count; i++) {
    const localX = position.getX(i);
    const localZ = position.getZ(i);
    position.setY(
      i,
      sampleGroundTerrainHeight({
        worldX: originX + localX,
        worldZ: originZ + localZ,
        seed,
        profile,
      }),
    );
  }

  position.needsUpdate = true;
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
}

export function createGroundTerrainGeometry(
  tileX: number,
  tileZ: number,
  tileSize: number,
  segments = GROUND_TERRAIN_SEGMENTS,
  seed = 42,
  profile = DEFAULT_TERRAIN_PROFILE,
) {
  const geometry = createGroundTerrainGeometryTemplate(tileSize, segments);
  applyGroundTerrainToGeometry(geometry, tileX, tileZ, tileSize, seed, profile);
  return geometry;
}

export function createGroundTerrainHeightfieldArgs(
  tileX: number,
  tileZ: number,
  tileSize: number,
  segments = GROUND_TERRAIN_SEGMENTS,
  seed = 42,
  profile = DEFAULT_TERRAIN_PROFILE,
): HeightfieldArgs {
  const points = segments + 1;
  const heights: number[] = [];
  const half = tileSize / 2;
  const overlap = GROUND_TILE_COLLIDER_OVERLAP;
  const colliderSize = tileSize + overlap * 2;
  const originX = tileX * tileSize + half;
  const originZ = tileZ * tileSize + half;

  for (let xIndex = 0; xIndex < points; xIndex++) {
    for (let zIndex = 0; zIndex < points; zIndex++) {
      const localX = (xIndex / segments - 0.5) * colliderSize;
      const localZ = (zIndex / segments - 0.5) * colliderSize;
      heights.push(
        sampleGroundTerrainHeight({
          worldX: originX + localX,
          worldZ: originZ + localZ,
          seed,
          profile,
        }),
      );
    }
  }

  return [segments, segments, heights, { x: colliderSize, y: 1, z: colliderSize }];
}

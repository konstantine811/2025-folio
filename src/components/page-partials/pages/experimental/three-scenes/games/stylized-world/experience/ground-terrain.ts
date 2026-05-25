import * as THREE from "three";
import type { HeightfieldArgs } from "@react-three/rapier";

export const GROUND_TERRAIN_SEGMENTS = 16;
export const GROUND_TERRAIN_HEIGHT = 0.28;

type TerrainSample = {
  x: number;
  z: number;
  tileSize: number;
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

export function sampleGroundTerrainHeight({ x, z, tileSize }: TerrainSample) {
  const nx = x / tileSize;
  const nz = z / tileSize;

  const low = valueNoise(nx * 2.2 + 17.1, nz * 2.2 - 3.6, 42) * 2 - 1;
  const mid = valueNoise(nx * 4.4 - 8.4, nz * 4.4 + 12.7, 91) * 2 - 1;
  const high = valueNoise(nx * 8.0 + 4.2, nz * 8.0 - 7.8, 137) * 2 - 1;

  return (low * 0.62 + mid * 0.28 + high * 0.1) * GROUND_TERRAIN_HEIGHT;
}

export function createGroundTerrainGeometry(
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
      const y = sampleGroundTerrainHeight({ x, z, tileSize });

      positions[vertexIndex * 3] = x;
      positions[vertexIndex * 3 + 1] = y;
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
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();

  return geometry;
}

export function createGroundTerrainHeightfieldArgs(
  tileSize: number,
  segments = GROUND_TERRAIN_SEGMENTS,
): HeightfieldArgs {
  const points = segments + 1;
  const heights: number[] = [];

  for (let xIndex = 0; xIndex < points; xIndex++) {
    for (let zIndex = 0; zIndex < points; zIndex++) {
      const x = (xIndex / segments - 0.5) * tileSize;
      const z = (zIndex / segments - 0.5) * tileSize;
      heights.push(sampleGroundTerrainHeight({ x, z, tileSize }));
    }
  }

  return [segments, segments, heights, { x: tileSize, y: 1, z: tileSize }];
}

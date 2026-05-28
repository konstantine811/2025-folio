import * as THREE from "three";
import { mulberry32, tileSeed } from "./bush-core";
import {
  sampleGroundTerrainHeight,
  type TerrainProfile,
} from "./ground-terrain";
import type { LandscapeTileCoord } from "./landscape-config";

export function computeGroundColor(tileX: number, tileZ: number, seed: number) {
  const rng = mulberry32(tileSeed(tileX, tileZ, seed));
  const shade = 0.11 + rng() * 0.025;
  return new THREE.Color(shade, shade, shade + 0.008);
}

export function collectBushMatricesForTiles({
  tiles,
  tileSize,
  bushesPerTile,
  worldSeed,
  terrainProfile,
  dummy,
}: {
  tiles: LandscapeTileCoord[];
  tileSize: number;
  bushesPerTile: number;
  worldSeed: number;
  terrainProfile: TerrainProfile;
  dummy: THREE.Object3D;
}) {
  const matrices: THREE.Matrix4[] = [];

  if (bushesPerTile <= 0) return matrices;

  for (const { tileX, tileZ } of tiles) {
    const rng = mulberry32(tileSeed(tileX, tileZ, worldSeed));

    for (let i = 0; i < bushesPerTile; i += 1) {
      if (rng() < 0.25) continue;

      const ox = rng() * tileSize;
      const oz = rng() * tileSize;
      const scale = THREE.MathUtils.lerp(0.75, 1.25, rng());
      const yaw = rng() * Math.PI * 2;
      const worldX = tileX * tileSize + ox;
      const worldZ = tileZ * tileSize + oz;

      dummy.position.set(
        worldX,
        sampleGroundTerrainHeight({
          worldX,
          worldZ,
          seed: worldSeed,
          profile: terrainProfile,
        }),
        worldZ,
      );
      dummy.rotation.set(0, yaw, 0);
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      matrices.push(dummy.matrix.clone());
    }
  }

  return matrices;
}

export function assignMatricesToInstancedChunks(
  chunks: (THREE.InstancedMesh | null)[],
  matrices: THREE.Matrix4[],
) {
  let matrixIndex = 0;

  for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex += 1) {
    const chunk = chunks[chunkIndex];
    if (!chunk) continue;

    const chunkEnd = Math.min(
      matrixIndex + 1024,
      matrices.length,
    );
    let localIndex = 0;

    for (let i = matrixIndex; i < chunkEnd; i += 1) {
      chunk.setMatrixAt(localIndex, matrices[i]);
      localIndex += 1;
    }

    chunk.count = localIndex;
    chunk.instanceMatrix.needsUpdate = true;
    chunk.computeBoundingSphere();
    matrixIndex = chunkEnd;
  }

  for (let i = matrixIndex; i < chunks.length; i += 1) {
    const chunk = chunks[i];
    if (!chunk) continue;
    chunk.count = 0;
    chunk.instanceMatrix.needsUpdate = true;
  }
}

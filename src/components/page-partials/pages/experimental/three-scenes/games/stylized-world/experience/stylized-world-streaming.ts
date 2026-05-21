import type { Vector3 } from "three";

export type TileCoord = {
  x: number;
  z: number;
};

/** Recenter physics tiles when the player gets this close to the pool edge. */
export const PHYSICS_STREAM_RECENTER_MARGIN = 3;

/** Visual tiles recenter earlier so new ground/bushes appear ahead of the player. */
export const VISUAL_STREAM_RECENTER_MARGIN = 6;

export function readPlayerTile(focus: Vector3, tileSize: number): TileCoord {
  return {
    x: Math.floor(focus.x / tileSize),
    z: Math.floor(focus.z / tileSize),
  };
}

export function shouldRecenterStream(
  playerTile: TileCoord,
  streamCenter: TileCoord,
  radius: number,
  margin = PHYSICS_STREAM_RECENTER_MARGIN,
) {
  const threshold = Math.max(1, radius - margin);
  return (
    Math.abs(playerTile.x - streamCenter.x) > threshold ||
    Math.abs(playerTile.z - streamCenter.z) > threshold
  );
}

export function getTilePoolOffsets(radius: number) {
  const offsets: { dx: number; dz: number }[] = [];

  for (let dz = -radius; dz <= radius; dz++) {
    for (let dx = -radius; dx <= radius; dx++) {
      offsets.push({ dx, dz });
    }
  }

  return offsets;
}

export function getTileWorldCenter(
  tileX: number,
  tileZ: number,
  tileSize: number,
) {
  const half = tileSize / 2;
  return {
    x: tileX * tileSize + half,
    z: tileZ * tileSize + half,
  };
}

import type { Vector3 } from "three";

export type TileCoord = {
  x: number;
  z: number;
};

/** Recenter the streamed tile ring when the player gets this close to its edge. */
export const STREAM_RECENTER_MARGIN = 3;

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
  margin = STREAM_RECENTER_MARGIN,
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

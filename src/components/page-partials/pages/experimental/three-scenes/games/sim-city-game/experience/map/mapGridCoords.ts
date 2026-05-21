/**
 * Grid UV convention (matches canvas / mapData indexing):
 * - u: 0 → left, 1 → right
 * - v: 0 → top row (canvas y = 0), 1 → bottom row
 */
export function worldToGridUv(
  worldX: number,
  worldZ: number,
  mapWidth: number,
  mapHeight: number,
): [number, number] {
  return [
    (worldX + mapWidth / 2) / mapWidth,
    (mapHeight / 2 - worldZ) / mapHeight,
  ];
}

/** Plane local coords before rotateX(-PI/2); Y becomes -worldZ after rotation. */
export function planeLocalToGridUv(
  localX: number,
  localY: number,
  mapWidth: number,
  mapHeight: number,
): [number, number] {
  return [
    (localX + mapWidth / 2) / mapWidth,
    (localY + mapHeight / 2) / mapHeight,
  ];
}

export function gridUvToTileIndex(
  u: number,
  v: number,
  mapWidth: number,
  mapHeight: number,
): { x: number; y: number } | null {
  if (u < 0 || u > 1 || v < 0 || v > 1) {
    return null;
  }

  return {
    x: Math.min(mapWidth - 1, Math.max(0, Math.floor(u * mapWidth))),
    y: Math.min(mapHeight - 1, Math.max(0, Math.floor(v * mapHeight))),
  };
}

export function worldToTileIndex(
  worldX: number,
  worldZ: number,
  mapWidth: number,
  mapHeight: number,
): { x: number; y: number } | null {
  const [u, v] = worldToGridUv(worldX, worldZ, mapWidth, mapHeight);
  return gridUvToTileIndex(u, v, mapWidth, mapHeight);
}

/** Position inside the map group (origin at corner 0,0). */
export function tileToMapGroupPosition(
  gridX: number,
  gridY: number,
  mapWidth: number,
  mapHeight: number,
): [number, number, number] {
  return [gridX + 0.5, 0, mapHeight - gridY - 0.5];
}

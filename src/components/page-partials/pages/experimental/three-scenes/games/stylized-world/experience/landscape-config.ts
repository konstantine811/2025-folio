/** Matches TerrainSketchSurface plane size in experience.tsx */
export const DEFAULT_LANDSCAPE_SIZE = 220;

/** Ground / physics tile size for fixed landscape (16 m → ~196 tiles on 220 m). */
export const LANDSCAPE_TILE_SIZE = 16;

export type LandscapeBounds = {
  centerX: number;
  centerZ: number;
  sizeX: number;
  sizeZ: number;
};

export function createLandscapeBounds(
  centerX: number,
  centerZ: number,
  size: number = DEFAULT_LANDSCAPE_SIZE,
): LandscapeBounds {
  return {
    centerX,
    centerZ,
    sizeX: size,
    sizeZ: size,
  };
}

export type LandscapeTileCoord = {
  tileX: number;
  tileZ: number;
};

export function getLandscapeTileRange(bounds: LandscapeBounds, tileSize: number) {
  const halfX = bounds.sizeX * 0.5;
  const halfZ = bounds.sizeZ * 0.5;
  const minWorldX = bounds.centerX - halfX;
  const maxWorldX = bounds.centerX + halfX;
  const minWorldZ = bounds.centerZ - halfZ;
  const maxWorldZ = bounds.centerZ + halfZ;

  const minTileX = Math.floor(minWorldX / tileSize);
  const maxTileX = Math.floor((maxWorldX - 1e-6) / tileSize);
  const minTileZ = Math.floor(minWorldZ / tileSize);
  const maxTileZ = Math.floor((maxWorldZ - 1e-6) / tileSize);

  return { minTileX, maxTileX, minTileZ, maxTileZ };
}

export function enumerateLandscapeTiles(
  bounds: LandscapeBounds,
  tileSize: number,
): LandscapeTileCoord[] {
  const { minTileX, maxTileX, minTileZ, maxTileZ } = getLandscapeTileRange(
    bounds,
    tileSize,
  );
  const tiles: LandscapeTileCoord[] = [];

  for (let tileZ = minTileZ; tileZ <= maxTileZ; tileZ += 1) {
    for (let tileX = minTileX; tileX <= maxTileX; tileX += 1) {
      tiles.push({ tileX, tileZ });
    }
  }

  return tiles;
}

export function getLandscapeGridDebugRadius(
  bounds: LandscapeBounds,
  tileSize: number,
) {
  const { minTileX, maxTileX, minTileZ, maxTileZ } = getLandscapeTileRange(
    bounds,
    tileSize,
  );
  const spanX = maxTileX - minTileX + 1;
  const spanZ = maxTileZ - minTileZ + 1;
  return Math.max(Math.ceil(spanX * 0.5), Math.ceil(spanZ * 0.5));
}

export function getTileWorldCenter(tileX: number, tileZ: number, tileSize: number) {
  return {
    x: tileX * tileSize + tileSize * 0.5,
    z: tileZ * tileSize + tileSize * 0.5,
  };
}

export function isTileWithinView(
  tileX: number,
  tileZ: number,
  tileSize: number,
  focusX: number,
  focusZ: number,
  viewRadiusTiles: number,
) {
  const center = getTileWorldCenter(tileX, tileZ, tileSize);
  const limit = viewRadiusTiles * tileSize + tileSize * 0.5;
  return (
    Math.abs(center.x - focusX) <= limit &&
    Math.abs(center.z - focusZ) <= limit
  );
}

export function clampWorldToLandscape(
  x: number,
  z: number,
  bounds: LandscapeBounds,
  margin = 4,
) {
  const halfX = bounds.sizeX * 0.5 - margin;
  const halfZ = bounds.sizeZ * 0.5 - margin;
  return {
    x: Math.min(bounds.centerX + halfX, Math.max(bounds.centerX - halfX, x)),
    z: Math.min(bounds.centerZ + halfZ, Math.max(bounds.centerZ - halfZ, z)),
  };
}


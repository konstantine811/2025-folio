import { MapTile } from "./generateMap";

export type BuildBlockReason =
  | "out_of_bounds"
  | "water"
  | "mountain"
  | "occupied";

export type BuildValidation =
  | { ok: true; tile: MapTile }
  | { ok: false; reason: BuildBlockReason };

export function tileKey(x: number, y: number) {
  return `${x},${y}`;
}

export function getTileAt(
  mapData: MapTile[][],
  x: number,
  y: number,
): MapTile | null {
  return mapData[x]?.[y] ?? null;
}

export function isBuildableTerrain(type: MapTile["type"]) {
  return type === "grass";
}

export function validateBuildingPlacement(
  mapData: MapTile[][],
  gridX: number,
  gridY: number,
  occupiedKeys: ReadonlySet<string>,
): BuildValidation {
  const width = mapData.length;
  const height = mapData[0]?.length ?? 0;

  if (gridX < 0 || gridY < 0 || gridX >= width || gridY >= height) {
    return { ok: false, reason: "out_of_bounds" };
  }

  const tile = mapData[gridX][gridY];

  if (tile.type === "water") {
    return { ok: false, reason: "water" };
  }

  if (tile.type === "mountain") {
    return { ok: false, reason: "mountain" };
  }

  if (occupiedKeys.has(tileKey(gridX, gridY))) {
    return { ok: false, reason: "occupied" };
  }

  return { ok: true, tile };
}

export const BUILD_BLOCK_LABELS: Record<BuildBlockReason, string> = {
  out_of_bounds: "Outside the map",
  water: "Cannot build on water",
  mountain: "Cannot build on mountains",
  occupied: "Tile already has a building",
};

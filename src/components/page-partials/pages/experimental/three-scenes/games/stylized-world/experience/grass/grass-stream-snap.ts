import { GRASS_GRID_CELL_SIZE } from "./config";

export type GrassStreamSnap = {
  centerX: number;
  centerZ: number;
  cellX: number;
  cellZ: number;
};

const SNAP_HYSTERESIS = GRASS_GRID_CELL_SIZE * 0.35;

export function createGrassStreamSnap(
  focusX = 0,
  focusZ = 0,
): GrassStreamSnap {
  const cellX = Math.floor(focusX / GRASS_GRID_CELL_SIZE);
  const cellZ = Math.floor(focusZ / GRASS_GRID_CELL_SIZE);
  return {
    cellX,
    cellZ,
    centerX: cellX * GRASS_GRID_CELL_SIZE,
    centerZ: cellZ * GRASS_GRID_CELL_SIZE,
  };
}

/** Shared grass / ground-data snap with hysteresis to avoid oscillation at cell borders. */
export function updateGrassStreamSnap(
  snap: GrassStreamSnap,
  focusX: number,
  focusZ: number,
) {
  const targetCellX = Math.floor(focusX / GRASS_GRID_CELL_SIZE);
  const targetCellZ = Math.floor(focusZ / GRASS_GRID_CELL_SIZE);
  let nextCellX = snap.cellX;
  let nextCellZ = snap.cellZ;

  if (targetCellX !== nextCellX) {
    const boundaryX =
      (Math.min(targetCellX, nextCellX) +
        (targetCellX > nextCellX ? 1 : 0)) *
      GRASS_GRID_CELL_SIZE;
    if (targetCellX > nextCellX) {
      if (focusX >= boundaryX + SNAP_HYSTERESIS) nextCellX = targetCellX;
    } else if (focusX <= boundaryX - SNAP_HYSTERESIS) {
      nextCellX = targetCellX;
    }
  }

  if (targetCellZ !== nextCellZ) {
    const boundaryZ =
      (Math.min(targetCellZ, nextCellZ) +
        (targetCellZ > nextCellZ ? 1 : 0)) *
      GRASS_GRID_CELL_SIZE;
    if (targetCellZ > nextCellZ) {
      if (focusZ >= boundaryZ + SNAP_HYSTERESIS) nextCellZ = targetCellZ;
    } else if (focusZ <= boundaryZ - SNAP_HYSTERESIS) {
      nextCellZ = targetCellZ;
    }
  }

  const centerX = nextCellX * GRASS_GRID_CELL_SIZE;
  const centerZ = nextCellZ * GRASS_GRID_CELL_SIZE;
  const changed = centerX !== snap.centerX || centerZ !== snap.centerZ;

  snap.cellX = nextCellX;
  snap.cellZ = nextCellZ;
  snap.centerX = centerX;
  snap.centerZ = centerZ;

  return changed;
}

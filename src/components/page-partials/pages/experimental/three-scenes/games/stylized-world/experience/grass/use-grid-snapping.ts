import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { MutableRefObject } from "react";
import type { Vector3 } from "three";
import {
  BLADE_STEPS_PER_CELL,
  GRASS_GRID_CELL_SIZE,
} from "./config";

export type GridSnapResult = {
  snappedX: number;
  snappedZ: number;
  currentCellX: number;
  currentCellZ: number;
};

export function useGridSnapping(
  focusRef: MutableRefObject<Vector3>,
  onSnap: (result: GridSnapResult) => void,
) {
  const currentCellX = useRef<number | null>(null);
  const currentCellZ = useRef<number | null>(null);

  useFrame(() => {
    const focus = focusRef.current;
    const cellX = Math.floor(focus.x / GRASS_GRID_CELL_SIZE);
    const cellZ = Math.floor(focus.z / GRASS_GRID_CELL_SIZE);

    if (
      currentCellX.current === cellX &&
      currentCellZ.current === cellZ
    ) {
      return;
    }

    currentCellX.current = cellX;
    currentCellZ.current = cellZ;

    onSnap({
      snappedX: cellX * GRASS_GRID_CELL_SIZE,
      snappedZ: cellZ * GRASS_GRID_CELL_SIZE,
      currentCellX: cellX,
      currentCellZ: cellZ,
    });
  });
}

export function gridIndexFromCell(cellX: number, cellZ: number) {
  return {
    x: cellX * BLADE_STEPS_PER_CELL,
    z: cellZ * BLADE_STEPS_PER_CELL,
  };
}

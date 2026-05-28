import { useFrame } from "@react-three/fiber";
import { useRef, type MutableRefObject } from "react";
import { BLADE_STEPS_PER_CELL } from "./config";
import type { GrassStreamSnap } from "./grass-stream-snap";

export type GridSnapResult = {
  snappedX: number;
  snappedZ: number;
  currentCellX: number;
  currentCellZ: number;
};

/** Reacts to shared stream snap (updated once per frame in Experience). */
export function useGridSnapping(
  streamSnapRef: MutableRefObject<GrassStreamSnap>,
  onSnap: (result: GridSnapResult) => void,
) {
  const lastCenterXRef = useRef(Number.NaN);
  const lastCenterZRef = useRef(Number.NaN);

  useFrame(() => {
    const snap = streamSnapRef.current;
    if (
      snap.centerX === lastCenterXRef.current &&
      snap.centerZ === lastCenterZRef.current
    ) {
      return;
    }

    lastCenterXRef.current = snap.centerX;
    lastCenterZRef.current = snap.centerZ;

    onSnap({
      snappedX: snap.centerX,
      snappedZ: snap.centerZ,
      currentCellX: snap.cellX,
      currentCellZ: snap.cellZ,
    });
  });
}

export function gridIndexFromCell(cellX: number, cellZ: number) {
  return {
    x: cellX * BLADE_STEPS_PER_CELL,
    z: cellZ * BLADE_STEPS_PER_CELL,
  };
}

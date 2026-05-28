import { createPortal, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import type { MutableRefObject, RefObject } from "react";
import type { Vector3 } from "three";
import { GRASS_GRID_CELL_SIZE } from "./grass/config";
import {
  GroundData,
  type GrassGroundDataBinding,
} from "./ground-data";
import type { WheelContactHistoryEntry } from "./wheel-contact-history";
import { WheelTrackTrail } from "./wheel-track-trail";

type GroundDataSystemProps = {
  focusRef: MutableRefObject<Vector3>;
  contactHistoriesRef: RefObject<WheelContactHistoryEntry[]>;
  grassGroundDataRef: MutableRefObject<GrassGroundDataBinding>;
};

export function GroundDataSystem({
  focusRef,
  contactHistoriesRef,
  grassGroundDataRef,
}: GroundDataSystemProps) {
  const { gl } = useThree();
  const groundData = useMemo(() => new GroundData(), []);

  useEffect(() => {
    return () => {
      groundData.dispose();
    };
  }, [groundData]);

  useFrame(() => {
    const focus = focusRef.current;
    const cellX = Math.floor(focus.x / GRASS_GRID_CELL_SIZE);
    const cellZ = Math.floor(focus.z / GRASS_GRID_CELL_SIZE);
    const centerX = cellX * GRASS_GRID_CELL_SIZE;
    const centerZ = cellZ * GRASS_GRID_CELL_SIZE;

    groundData.update(gl, centerX, centerZ);

    grassGroundDataRef.current.texture = groundData.texture;
    grassGroundDataRef.current.centerX = centerX;
    grassGroundDataRef.current.centerZ = centerZ;
    grassGroundDataRef.current.halfSize = groundData.halfSize;
  });

  const trails = contactHistoriesRef.current ?? [];

  return createPortal(
    <>
      {trails.map((entry, index) => (
        <WheelTrackTrail
          key={index}
          entry={entry}
          index={index}
          variant="groundData"
        />
      ))}
    </>,
    groundData.scene,
  );
}

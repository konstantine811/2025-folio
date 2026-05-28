import { createPortal, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import type { MutableRefObject, RefObject } from "react";
import type { GrassStreamSnap } from "./grass/grass-stream-snap";
import {
  GroundData,
  type GrassGroundDataBinding,
} from "./ground-data";
import type { WheelContactHistoryEntry } from "./wheel-contact-history";
import { WheelTrackTrail } from "./wheel-track-trail";

type GroundDataSystemProps = {
  streamSnapRef: MutableRefObject<GrassStreamSnap>;
  contactHistoriesRef: RefObject<WheelContactHistoryEntry[]>;
  grassGroundDataRef: MutableRefObject<GrassGroundDataBinding>;
};

export function GroundDataSystem({
  streamSnapRef,
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
    const { centerX, centerZ } = streamSnapRef.current;

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

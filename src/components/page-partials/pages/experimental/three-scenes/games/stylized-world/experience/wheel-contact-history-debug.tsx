import { WheelTrackTrail } from "./wheel-track-trail";
import type { RefObject } from "react";
import type { WheelContactHistoryEntry } from "./wheel-contact-history";
import { areWheelTracksEnabled, TRACK_SIMPLE_MODE } from "./track-simple-mode";

type WheelContactHistoryDebugRackProps = {
  historiesRef: RefObject<WheelContactHistoryEntry[]>;
};

export function WheelContactHistoryDebugRack({
  historiesRef,
}: WheelContactHistoryDebugRackProps) {
  if (!areWheelTracksEnabled() || !TRACK_SIMPLE_MODE.debugRibbonTrails) {
    return null;
  }

  return (
    <>
      {historiesRef.current.map((entry, index) => (
        <WheelTrackTrail
          key={index}
          entry={entry}
          index={index}
          variant="debug"
        />
      ))}
    </>
  );
}

import { WheelTrackTrail } from "./wheel-track-trail";
import type { RefObject } from "react";
import type { WheelContactHistoryEntry } from "./wheel-contact-history";

type WheelContactHistoryDebugRackProps = {
  historiesRef: RefObject<WheelContactHistoryEntry[]>;
};

export function WheelContactHistoryDebugRack({
  historiesRef,
}: WheelContactHistoryDebugRackProps) {
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

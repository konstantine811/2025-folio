import { useRef } from "react";
import {
  createWheelContactHistoryTexture,
  type WheelContactHistoryEntry,
} from "./wheel-contact-history";

/** Creates per-wheel float histories; recording runs inside useVehicleController. */
export function useWheelContactHistory(wheelCount: number) {
  const historiesRef = useRef<WheelContactHistoryEntry[]>([]);

  while (historiesRef.current.length < wheelCount) {
    historiesRef.current.push(createWheelContactHistoryTexture());
  }

  if (historiesRef.current.length > wheelCount) {
    historiesRef.current.length = wheelCount;
  }

  return { historiesRef };
}

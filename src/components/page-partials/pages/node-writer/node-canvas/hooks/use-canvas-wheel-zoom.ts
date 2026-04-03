import type { Dispatch, RefObject, SetStateAction } from "react";
import { useLayoutEffect } from "react";
import { CANVAS_ZOOM_MAX, CANVAS_ZOOM_MIN } from "../constants";

export function useCanvasWheelZoom(
  scrollRef: RefObject<HTMLDivElement | null>,
  setScale: Dispatch<SetStateAction<number>>,
) {
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      const factor = Math.exp(-e.deltaY * 0.002);
      setScale((s) =>
        Math.min(CANVAS_ZOOM_MAX, Math.max(CANVAS_ZOOM_MIN, s * factor)),
      );
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [scrollRef, setScale]);
}

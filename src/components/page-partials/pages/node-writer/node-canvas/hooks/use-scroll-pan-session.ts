import type { Dispatch, RefObject, SetStateAction } from "react";
import { useEffect } from "react";

export type ScrollPanSession = {
  pointerId: number;
  startX: number;
  startY: number;
  scrollLeft0: number;
  scrollTop0: number;
};

export function useScrollPanSession(
  panSession: ScrollPanSession | null,
  scrollRef: RefObject<HTMLDivElement | null>,
  panCaptureElRef: RefObject<HTMLElement | null>,
  setPanSession: Dispatch<SetStateAction<ScrollPanSession | null>>,
) {
  useEffect(() => {
    if (!panSession) return;
    const el = scrollRef.current;
    if (!el) return;

    const onMove = (e: PointerEvent) => {
      if (e.pointerId !== panSession.pointerId) return;
      const dx = e.clientX - panSession.startX;
      const dy = e.clientY - panSession.startY;
      const maxL = Math.max(0, el.scrollWidth - el.clientWidth);
      const maxT = Math.max(0, el.scrollHeight - el.clientHeight);
      el.scrollLeft = Math.max(0, Math.min(maxL, panSession.scrollLeft0 - dx));
      el.scrollTop = Math.max(0, Math.min(maxT, panSession.scrollTop0 - dy));
    };

    const onUp = (e: PointerEvent) => {
      if (e.pointerId !== panSession.pointerId) return;
      try {
        panCaptureElRef.current?.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      panCaptureElRef.current = null;
      setPanSession(null);
    };

    const cap = { capture: true } as const;
    window.addEventListener("pointermove", onMove, cap);
    window.addEventListener("pointerup", onUp, cap);
    window.addEventListener("pointercancel", onUp, cap);
    return () => {
      window.removeEventListener("pointermove", onMove, cap);
      window.removeEventListener("pointerup", onUp, cap);
      window.removeEventListener("pointercancel", onUp, cap);
    };
  }, [panSession, scrollRef, panCaptureElRef, setPanSession]);
}

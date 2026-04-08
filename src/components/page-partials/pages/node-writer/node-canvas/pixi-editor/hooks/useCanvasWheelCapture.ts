import { useEffect } from "react";
import type { RefObject } from "react";
import type { Viewport } from "pixi-viewport";
import { CANVAS_ZOOM_MAX, CANVAS_ZOOM_MIN } from "../../constants";

type UseCanvasWheelCaptureParams = {
  frameRef: RefObject<HTMLDivElement | null>;
  viewport: Viewport | null;
  bumpViewportVersion: () => void;
};

function findScrollableAncestor(
  from: HTMLElement | null,
  root: HTMLElement | null,
): HTMLElement | null {
  let el: HTMLElement | null = from;
  while (el && el !== root && el !== document.body) {
    const style = window.getComputedStyle(el);
    const overflowY = style.overflowY;
    const overflowX = style.overflowX;
    const canScrollY =
      (overflowY === "auto" || overflowY === "scroll") &&
      el.scrollHeight > el.clientHeight + 1;
    const canScrollX =
      (overflowX === "auto" || overflowX === "scroll") &&
      el.scrollWidth > el.clientWidth + 1;
    if (canScrollY || canScrollX) return el;
    el = el.parentElement;
  }
  return null;
}

export function useCanvasWheelCapture({
  frameRef,
  viewport,
  bumpViewportVersion,
}: UseCanvasWheelCaptureParams) {
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const handleWheelCapture = (event: WheelEvent) => {
      if (!viewport) return;

      const target = event.target instanceof HTMLElement ? event.target : null;
      const scrollEl = findScrollableAncestor(target, frame);
      if (scrollEl && !event.metaKey && !event.ctrlKey) {
        const hasLocalScroll =
          scrollEl.scrollHeight > scrollEl.clientHeight + 1 ||
          scrollEl.scrollWidth > scrollEl.clientWidth + 1;
        if (hasLocalScroll) {
          event.stopPropagation();
          return;
        }
      }

      event.preventDefault();
      event.stopPropagation();

      if (event.metaKey || event.ctrlKey) {
        const currentZoom = viewport.scale.x || 1;
        const zoomFactor = Math.exp(-event.deltaY * 0.002);
        const nextZoom = Math.min(
          CANVAS_ZOOM_MAX,
          Math.max(CANVAS_ZOOM_MIN, currentZoom * zoomFactor),
        );
        viewport.setZoom(nextZoom, true);
        bumpViewportVersion();
        return;
      }

      const worldDx = event.deltaX / Math.max(viewport.scale.x, 0.01);
      const worldDy = event.deltaY / Math.max(viewport.scale.y, 0.01);
      viewport.moveCenter(
        viewport.center.x + worldDx,
        viewport.center.y + worldDy,
      );
      bumpViewportVersion();
    };

    frame.addEventListener("wheel", handleWheelCapture, {
      capture: true,
      passive: false,
    });
    return () => {
      frame.removeEventListener("wheel", handleWheelCapture, true);
    };
  }, [bumpViewportVersion, frameRef, viewport]);
}

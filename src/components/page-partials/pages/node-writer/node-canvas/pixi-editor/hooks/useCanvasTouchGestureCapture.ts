import { useEffect } from "react";
import type { RefObject } from "react";

type UseCanvasTouchGestureCaptureParams = {
  frameRef: RefObject<HTMLDivElement | null>;
  enabled: boolean;
};

export function useCanvasTouchGestureCapture({
  frameRef,
  enabled,
}: UseCanvasTouchGestureCaptureParams) {
  useEffect(() => {
    const frame = frameRef.current;
    if (!enabled || !frame) return;

    const isInsideFrame = (target: EventTarget | null) =>
      target instanceof Node && frame.contains(target);

    const preventBrowserPinchZoom = (event: TouchEvent) => {
      if (!isInsideFrame(event.target)) return;
      if (event.touches.length < 2) return;

      if (event.cancelable) event.preventDefault();
    };

    const preventSafariGestureZoom = (event: Event) => {
      if (!isInsideFrame(event.target)) return;
      if (event.cancelable) event.preventDefault();
    };

    frame.addEventListener("touchstart", preventBrowserPinchZoom, {
      capture: true,
      passive: false,
    });
    frame.addEventListener("touchmove", preventBrowserPinchZoom, {
      capture: true,
      passive: false,
    });
    frame.addEventListener("gesturestart", preventSafariGestureZoom, {
      capture: true,
      passive: false,
    });
    frame.addEventListener("gesturechange", preventSafariGestureZoom, {
      capture: true,
      passive: false,
    });
    frame.addEventListener("gestureend", preventSafariGestureZoom, {
      capture: true,
      passive: false,
    });

    return () => {
      frame.removeEventListener("touchstart", preventBrowserPinchZoom, true);
      frame.removeEventListener("touchmove", preventBrowserPinchZoom, true);
      frame.removeEventListener("gesturestart", preventSafariGestureZoom, true);
      frame.removeEventListener("gesturechange", preventSafariGestureZoom, true);
      frame.removeEventListener("gestureend", preventSafariGestureZoom, true);
    };
  }, [enabled, frameRef]);
}

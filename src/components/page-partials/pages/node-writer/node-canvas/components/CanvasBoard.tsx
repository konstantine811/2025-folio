import type { RefObject } from "react";
import { useLayoutEffect, useState } from "react";
import {
  CANVAS_DOT_GRID_STEP,
  CANVAS_MIN_H,
  CANVAS_MIN_W,
  CANVAS_VIEW_SCROLL_SLACK,
} from "../constants";

/** Розміри спейсера та масштаб для шару звʼязків у координатах прокрутки. */
export type CanvasBoardGraphContext = {
  spacerW: number;
  spacerH: number;
  scale: number;
};

interface CanvasBoardProps {
  scrollRef: RefObject<HTMLDivElement | null>;
  scale: number;
  canvasOverlayCursorClass: string;
  onCanvasPointerDown: (e: React.PointerEvent) => void;
  /** Прев’ю прямокутника в px координатах контенту скролу (уся площа спейсера). */
  drawPreviewRect: { left: number; top: number; w: number; h: number } | null;
  /** Контур ножа (freehand) у px скролу; малюється поверх полотна. */
  knifePolygonPreviewPoints: Array<{ x: number; y: number }> | null;
  /** Червоне прев’ю — режим «ніж» по звʼязках (K + малювання). */
  linkKnifeDrawPreview?: boolean;
  /** Блакитне прев’ю — Shift+рамка виділення нод. */
  marqueeSelectPreview?: boolean;
  /** Лінії звʼязків у px спейсера (під нодами; pointer-events-none — кліки до карток). */
  graphLayer?: (ctx: CanvasBoardGraphContext) => React.ReactNode;
  children: React.ReactNode;
}

export function CanvasBoard({
  scrollRef,
  scale,
  canvasOverlayCursorClass,
  onCanvasPointerDown,
  drawPreviewRect,
  knifePolygonPreviewPoints,
  linkKnifeDrawPreview = false,
  marqueeSelectPreview = false,
  graphLayer,
  children,
}: CanvasBoardProps) {
  const s = scale > 0 ? scale : 1;
  const [viewport, setViewport] = useState({ w: 0, h: 0 });
  const [windowPx, setWindowPx] = useState(() => ({
    iw:
      typeof window !== "undefined" ? window.innerWidth : CANVAS_MIN_W,
    ih:
      typeof window !== "undefined" ? window.innerHeight : CANVAS_MIN_H,
  }));

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const measure = () =>
      setViewport({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(() => {
      measure();
      requestAnimationFrame(measure);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [scale, scrollRef]);

  useLayoutEffect(() => {
    const onWin = () =>
      setWindowPx({ iw: window.innerWidth, ih: window.innerHeight });
    onWin();
    window.addEventListener("resize", onWin);
    return () => window.removeEventListener("resize", onWin);
  }, []);

  const vw = viewport.w;
  const vh = viewport.h;
  const baseW = CANVAS_MIN_W * s;
  const baseH = CANVAS_MIN_H * s;
  const minByViewport =
    vw > 0 && vh > 0
      ? {
          w: vw + CANVAS_VIEW_SCROLL_SLACK,
          h: vh + CANVAS_VIEW_SCROLL_SLACK,
        }
      : null;
  const minByWindow = {
    w: windowPx.iw * 1.5 + CANVAS_VIEW_SCROLL_SLACK,
    h: windowPx.ih * 1.5 + CANVAS_VIEW_SCROLL_SLACK,
  };
  const spacerW = Math.max(
    baseW,
    minByViewport?.w ?? 0,
    minByWindow.w,
  );
  const spacerH = Math.max(
    baseH,
    minByViewport?.h ?? 0,
    minByWindow.h,
  );

  return (
    <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden">
      <div
        ref={scrollRef}
        data-lenis-prevent
        data-lenis-prevent-wheel
        data-lenis-prevent-touch
        className="node-canvas-scroll absolute inset-0 overflow-auto overscroll-contain bg-background"
        style={{
          /* Крапки на фоні самого scroll: тоді прозорий SVG графа просвічує до них; окремий div під SVG у WebKit часто не видно крізь композитний шар. */
          backgroundImage:
            "radial-gradient(circle, color-mix(in srgb, var(--foreground) 14%, transparent) 1.25px, transparent 1.25px)",
          backgroundSize: `${CANVAS_DOT_GRID_STEP * s}px ${CANVAS_DOT_GRID_STEP * s}px`,
        }}
      >
        <div
          className="relative shrink-0"
          style={{ width: spacerW, height: spacerH }}
        >
          {/* Увесь спейсер (у т.ч. порожні поля для скролу) — малювання / Tab-панорама */}
          <div
            role="presentation"
            aria-hidden
            className={`absolute inset-0 z-0 touch-none ${canvasOverlayCursorClass}`}
            onPointerDown={onCanvasPointerDown}
          />
          {/* Граф z-[1], ноди z-[2]: картки над лініями; лінії видно в проміжках між нодами. */}
          {graphLayer && (
            <div
              className="pointer-events-none absolute left-0 top-0 z-[1] overflow-visible bg-transparent"
              style={{ width: spacerW, height: spacerH }}
            >
              {graphLayer({ spacerW, spacerH, scale: s })}
            </div>
          )}
          <div
            className="pointer-events-none relative z-[2]"
            style={{
              width: CANVAS_MIN_W,
              height: CANVAS_MIN_H,
              transform: `scale(${s})`,
              transformOrigin: "0 0",
            }}
          >
            {children}
          </div>
          {knifePolygonPreviewPoints && knifePolygonPreviewPoints.length > 0 ? (
            <svg
              className="pointer-events-none absolute left-0 top-0 z-[3] overflow-visible bg-transparent"
              width={spacerW}
              height={spacerH}
              aria-hidden
            >
              <polyline
                points={knifePolygonPreviewPoints
                  .map((p) => `${p.x},${p.y}`)
                  .join(" ")}
                fill="none"
                stroke="rgb(248 113 113)"
                strokeOpacity={0.88}
                strokeWidth={1.35}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="4 3"
              />
              {knifePolygonPreviewPoints.length >= 3 ? (
                <line
                  x1={
                    knifePolygonPreviewPoints[
                      knifePolygonPreviewPoints.length - 1
                    ]!.x
                  }
                  y1={
                    knifePolygonPreviewPoints[
                      knifePolygonPreviewPoints.length - 1
                    ]!.y
                  }
                  x2={knifePolygonPreviewPoints[0]!.x}
                  y2={knifePolygonPreviewPoints[0]!.y}
                  stroke="rgb(248 113 113)"
                  strokeOpacity={0.35}
                  strokeWidth={1}
                  strokeDasharray="2 5"
                />
              ) : null}
            </svg>
          ) : drawPreviewRect ? (
            <svg
              className="pointer-events-none absolute left-0 top-0 z-[3] overflow-visible bg-transparent"
              width={spacerW}
              height={spacerH}
              aria-hidden
            >
              <rect
                x={drawPreviewRect.left}
                y={drawPreviewRect.top}
                width={drawPreviewRect.w}
                height={drawPreviewRect.h}
                fill={
                  linkKnifeDrawPreview
                    ? "rgb(248 113 113)"
                    : marqueeSelectPreview
                      ? "rgb(56 189 248)"
                      : "var(--primary)"
                }
                fillOpacity={
                  linkKnifeDrawPreview ? 0.14 : marqueeSelectPreview ? 0.12 : 0.1
                }
                stroke={
                  linkKnifeDrawPreview
                    ? "rgb(248 113 113)"
                    : marqueeSelectPreview
                      ? "rgb(56 189 248)"
                      : "var(--primary)"
                }
                strokeOpacity={
                  linkKnifeDrawPreview ? 0.72 : marqueeSelectPreview ? 0.65 : 0.45
                }
                strokeWidth={linkKnifeDrawPreview ? 1.25 : 1}
                strokeDasharray="4 3"
              />
            </svg>
          ) : null}
        </div>
      </div>
    </div>
  );
}

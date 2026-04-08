import { Viewport } from "pixi-viewport";
import type { FederatedPointerEvent } from "pixi.js";
import { useRef } from "react";

type Props = {
  viewport: Viewport;
  onPointerDown?: (e: FederatedPointerEvent) => void;
  drawPreviewRect?: { x: number; y: number; width: number; height: number } | null;
  knifePolygonPreviewPoints?: Array<{ x: number; y: number }> | null;
  isDark?: boolean;
};

const GRID_STEP = 80;
const GRID_HALF_SPAN = 120000;
const GRID_COLOR = 0xffffff;
const GRID_MINOR_ALPHA = 0.07;
const GRID_MAJOR_ALPHA = 0.1;
const GRID_MAJOR_EVERY = 5;

const EditorGrid = ({
  viewport,
  onPointerDown,
  drawPreviewRect,
  knifePolygonPreviewPoints,
  isDark = true,
}: Props) => {
  const didDrawRef = useRef(false);
  const prevThemeRef = useRef(isDark);
  if (prevThemeRef.current !== isDark) {
    didDrawRef.current = false;
    prevThemeRef.current = isDark;
  }

  return (
    <pixiContainer
      ref={(instance) => {
        if (instance && !viewport.children.includes(instance)) {
          viewport.addChildAt(instance, 0);
        }
      }}
      eventMode="static"
      onPointerDown={(e: FederatedPointerEvent) => {
        onPointerDown?.(e);
      }}
    >
      <pixiGraphics
        draw={(g) => {
          if (didDrawRef.current) return;

          const start = -GRID_HALF_SPAN;
          const end = GRID_HALF_SPAN;
          const span = end - start;

          g.clear();

          g.rect(start, start, span, span);
          g.fill({ color: isDark ? 0x000000 : 0xf8fafc, alpha: 1 });

          g.setStrokeStyle({
            width: 1,
            color: isDark ? GRID_COLOR : 0x0f172a,
            alpha: isDark ? GRID_MINOR_ALPHA : 0.055,
          });
          for (let x = start; x <= end; x += GRID_STEP) {
            if ((x / GRID_STEP) % GRID_MAJOR_EVERY === 0) continue;
            g.moveTo(x, start);
            g.lineTo(x, end);
          }
          for (let y = start; y <= end; y += GRID_STEP) {
            if ((y / GRID_STEP) % GRID_MAJOR_EVERY === 0) continue;
            g.moveTo(start, y);
            g.lineTo(end, y);
          }
          g.stroke();

          g.setStrokeStyle({
            width: 1,
            color: isDark ? GRID_COLOR : 0x0f172a,
            alpha: isDark ? GRID_MAJOR_ALPHA : 0.09,
          });
          for (let x = start; x <= end; x += GRID_STEP * GRID_MAJOR_EVERY) {
            g.moveTo(x, start);
            g.lineTo(x, end);
          }
          for (let y = start; y <= end; y += GRID_STEP * GRID_MAJOR_EVERY) {
            g.moveTo(start, y);
            g.lineTo(end, y);
          }
          g.stroke();

          didDrawRef.current = true;
        }}
      />
      <pixiGraphics
        draw={(g) => {
          g.clear();
          if (!drawPreviewRect) return;

          g.roundRect(
            drawPreviewRect.x,
            drawPreviewRect.y,
            drawPreviewRect.width,
            drawPreviewRect.height,
            14,
          );
          g.fill({ color: 0x60a5fa, alpha: 0.12 });
          g.roundRect(
            drawPreviewRect.x,
            drawPreviewRect.y,
            drawPreviewRect.width,
            drawPreviewRect.height,
            14,
          );
          g.stroke({ width: 1.5, color: 0x93c5fd, alpha: 0.75 });
        }}
      />
      <pixiGraphics
        draw={(g) => {
          g.clear();
          const points = knifePolygonPreviewPoints ?? [];
          if (points.length < 2) return;

          const [first, ...rest] = points;
          g.moveTo(first.x, first.y);
          for (const point of rest) {
            g.lineTo(point.x, point.y);
          }
          g.stroke({ width: 2, color: 0xfb7185, alpha: 0.8 });

          g.moveTo(first.x, first.y);
          for (const point of rest) {
            g.lineTo(point.x, point.y);
          }
          g.closePath();
          g.fill({ color: 0xfb7185, alpha: 0.12 });
        }}
      />
    </pixiContainer>
  );
};

export default EditorGrid;

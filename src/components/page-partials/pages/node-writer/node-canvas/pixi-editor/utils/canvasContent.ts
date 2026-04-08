import type { Viewport } from "pixi-viewport";
import type { Project } from "../../../types/types";
import { CANVAS_ZOOM_MAX, CANVAS_ZOOM_MIN } from "../../constants";
import {
  normalizeCanvasImageGeometry,
  normalizeNodeGeometry,
} from "../shared/types";

export type CanvasContentItem = {
  id: string;
  kind: "node" | "image";
  x: number;
  y: number;
  width: number;
  height: number;
};

export type CanvasContentBounds = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
};

export function collectCanvasContentItems(
  project: Project,
): CanvasContentItem[] {
  const nodeItems: CanvasContentItem[] = project.nodes.map((node) => {
    const g = normalizeNodeGeometry(node);
    return {
      id: node.id,
      kind: "node",
      x: g.x,
      y: g.y,
      width: g.width,
      height: g.height,
    };
  });
  const imageItems: CanvasContentItem[] = (project.canvasImages ?? []).map(
    (image) => {
      const g = normalizeCanvasImageGeometry(image);
      return {
        id: image.id,
        kind: "image",
        x: g.x,
        y: g.y,
        width: g.width,
        height: g.height,
      };
    },
  );
  return [...nodeItems, ...imageItems];
}

export function contentBoundsFromItems(
  items: Array<Pick<CanvasContentItem, "x" | "y" | "width" | "height">>,
): CanvasContentBounds | null {
  if (items.length === 0) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const item of items) {
    minX = Math.min(minX, item.x);
    minY = Math.min(minY, item.y);
    maxX = Math.max(maxX, item.x + item.width);
    maxY = Math.max(maxY, item.y + item.height);
  }

  const width = Math.max(1, maxX - minX);
  const height = Math.max(1, maxY - minY);

  return {
    minX,
    minY,
    maxX,
    maxY,
    width,
    height,
    centerX: minX + width / 2,
    centerY: minY + height / 2,
  };
}

export function fitViewportToBounds(
  viewport: Viewport,
  bounds: Pick<CanvasContentBounds, "width" | "height" | "centerX" | "centerY">,
  padding = 180,
): boolean {
  const screenWidth = viewport.screenWidth || window.innerWidth;
  const screenHeight = viewport.screenHeight || window.innerHeight;
  if (screenWidth <= 0 || screenHeight <= 0) return false;

  const zoomX = screenWidth / (bounds.width + padding * 2);
  const zoomY = screenHeight / (bounds.height + padding * 2);
  const zoom = Math.max(
    CANVAS_ZOOM_MIN,
    Math.min(CANVAS_ZOOM_MAX, Math.min(zoomX, zoomY)),
  );

  viewport.setZoom(zoom, true);
  viewport.moveCenter(bounds.centerX, bounds.centerY);
  return true;
}

export type MinimapData = {
  items: CanvasContentItem[];
  mapW: number;
  mapH: number;
  scale: number;
  toMap: (x: number, y: number) => { x: number; y: number };
  viewRect: { left: number; top: number; width: number; height: number };
};

export function buildMinimapData(
  items: CanvasContentItem[],
  viewport: Viewport,
): MinimapData | null {
  if (items.length === 0) return null;

  const screenW = viewport.screenWidth || window.innerWidth;
  const screenH = viewport.screenHeight || window.innerHeight;
  const a = viewport.toWorld({ x: 0, y: 0 });
  const b = viewport.toWorld({ x: screenW, y: screenH });
  const viewMinX = Math.min(a.x, b.x);
  const viewMaxX = Math.max(a.x, b.x);
  const viewMinY = Math.min(a.y, b.y);
  const viewMaxY = Math.max(a.y, b.y);

  const worldBounds = contentBoundsFromItems(items);
  if (!worldBounds) return null;

  let minX = Math.min(worldBounds.minX, viewMinX);
  let minY = Math.min(worldBounds.minY, viewMinY);
  let maxX = Math.max(worldBounds.maxX, viewMaxX);
  let maxY = Math.max(worldBounds.maxY, viewMaxY);

  const pad = 260;
  minX -= pad;
  minY -= pad;
  maxX += pad;
  maxY += pad;

  const worldW = Math.max(1, maxX - minX);
  const worldH = Math.max(1, maxY - minY);
  const maxMapW = 220;
  const maxMapH = 150;
  const scale = Math.min(maxMapW / worldW, maxMapH / worldH);
  const mapW = Math.max(120, Math.round(worldW * scale));
  const mapH = Math.max(84, Math.round(worldH * scale));

  const toMap = (x: number, y: number) => ({
    x: (x - minX) * scale,
    y: (y - minY) * scale,
  });

  const viewTopLeft = toMap(viewMinX, viewMinY);
  const viewBottomRight = toMap(viewMaxX, viewMaxY);
  const viewRect = {
    left: Math.max(0, Math.min(viewTopLeft.x, viewBottomRight.x)),
    top: Math.max(0, Math.min(viewTopLeft.y, viewBottomRight.y)),
    width: Math.max(10, Math.abs(viewBottomRight.x - viewTopLeft.x)),
    height: Math.max(10, Math.abs(viewBottomRight.y - viewTopLeft.y)),
  };

  return { items, mapW, mapH, scale, toMap, viewRect };
}

import type { CanvasImageItem, LinkData, NodeData } from "../../types/types";
import {
  getLinkEndpoints,
  linkBezierGeometry,
  resolveLinkSourcePortForBezier,
  type LayoutGetter,
} from "./geometry";

/** Стабільний ключ рядка звʼязку (збігається з ключем у `NodeGraphSvg`). */
export function linkStableKey(l: LinkData): string {
  return `${l.source}-${l.target}-${String(l.sourceIsCanvasImage)}-${String(l.targetIsCanvasImage)}-${l.sourcePort ?? ""}-${l.targetPort ?? ""}-${l.sourceChildSlot ?? ""}`;
}

const BEZIER_KNIFE_STEPS = 44;

export type LogicalRect = { left: number; top: number; w: number; h: number };

export type LogicalPoint = { x: number; y: number };

/** Чи всередині простого полігону (не самоперетину); ray casting. */
export function pointInLogicalPolygon(px: number, py: number, poly: LogicalPoint[]): boolean {
  const n = poly.length;
  if (n < 3) return false;
  let inside = false;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = poly[i]!.x;
    const yi = poly[i]!.y;
    const xj = poly[j]!.x;
    const yj = poly[j]!.y;
    const intersect =
      yi > py !== yj > py &&
      px < ((xj - xi) * (py - yi)) / (yj - yi + 1e-20) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function segmentsIntersect(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
  x4: number,
  y4: number,
): boolean {
  const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (Math.abs(den) < 1e-14) return false;
  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
  const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;
  return t >= 0 && t <= 1 && u >= 0 && u <= 1;
}

function bezierIntersectsLogicalPolygon(
  ax: number,
  ay: number,
  cx1: number,
  cy1: number,
  cx2: number,
  cy2: number,
  bx: number,
  by: number,
  poly: LogicalPoint[],
): boolean {
  const n = poly.length;
  if (n < 3) return false;

  if (pointInLogicalPolygon(ax, ay, poly) || pointInLogicalPolygon(bx, by, poly)) {
    return true;
  }

  const at = (t: number) => {
    const u = 1 - t;
    return {
      x:
        u * u * u * ax +
        3 * u * u * t * cx1 +
        3 * u * t * t * cx2 +
        t * t * t * bx,
      y:
        u * u * u * ay +
        3 * u * u * t * cy1 +
        3 * u * t * t * cy2 +
        t * t * t * by,
    };
  };

  let prev = at(0);
  for (let i = 1; i <= BEZIER_KNIFE_STEPS; i++) {
    const t = i / BEZIER_KNIFE_STEPS;
    const cur = at(t);
    if (pointInLogicalPolygon(cur.x, cur.y, poly)) return true;
    for (let e = 0; e < n; e++) {
      const p0 = poly[e]!;
      const p1 = poly[(e + 1) % n]!;
      if (
        segmentsIntersect(
          prev.x,
          prev.y,
          cur.x,
          cur.y,
          p0.x,
          p0.y,
          p1.x,
          p1.y,
        )
      ) {
        return true;
      }
    }
    prev = cur;
  }
  return false;
}

/** Ключі звʼязків, чия крива перетинає замкнений полігон (межа або внутрішність). */
export function collectLinkKeysIntersectingLogicalPolygon(
  links: LinkData[],
  nodes: NodeData[],
  canvasImages: CanvasImageItem[],
  layoutOf: LayoutGetter,
  polyLogical: LogicalPoint[],
): Set<string> {
  const out = new Set<string>();
  if (polyLogical.length < 3) return out;

  for (const l of links) {
    const ends = getLinkEndpoints(l, nodes, canvasImages, layoutOf, links);
    if (!ends) continue;
    const g = linkBezierGeometry(
      ends.a.x,
      ends.a.y,
      ends.b.x,
      ends.b.y,
      resolveLinkSourcePortForBezier(l),
      l.targetPort,
    );
    if (
      bezierIntersectsLogicalPolygon(
        g.ax,
        g.ay,
        g.cx1,
        g.cy1,
        g.cx2,
        g.cy2,
        g.bx,
        g.by,
        polyLogical,
      )
    ) {
      out.add(linkStableKey(l));
    }
  }
  return out;
}

/** Ключі звʼязків, чия крива перетинає заданий прямокутник у логічних координатах полотна. */
export function collectLinkKeysIntersectingLogicalRect(
  links: LinkData[],
  nodes: NodeData[],
  canvasImages: CanvasImageItem[],
  layoutOf: LayoutGetter,
  rect: LogicalRect,
): Set<string> {
  const poly: LogicalPoint[] = [
    { x: rect.left, y: rect.top },
    { x: rect.left + rect.w, y: rect.top },
    { x: rect.left + rect.w, y: rect.top + rect.h },
    { x: rect.left, y: rect.top + rect.h },
  ];
  return collectLinkKeysIntersectingLogicalPolygon(
    links,
    nodes,
    canvasImages,
    layoutOf,
    poly,
  );
}

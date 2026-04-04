import type {
  CanvasImageItem,
  LinkData,
  NodeData,
  NodePort,
} from "../../types/types";
import {
  NODE_PORT_EDGE_INSET,
  NODE_PORT_HANDLE_PX,
  NODE_PORT_SLOT_GAP,
} from "../constants";

/** Відстань від краю bbox до центру кружка-порту (inset + півдіаметра). */
function portAnchorDepthFromEdge(): number {
  return NODE_PORT_EDGE_INSET + NODE_PORT_HANDLE_PX / 2;
}

/** Чи привʼязаний звʼязок до цього порту (legacy, без sourceChildSlot). */
export function linkUsesPort(
  l: LinkData,
  nodeId: string,
  port: NodePort,
): boolean {
  if (l.sourceChildSlot != null) return false;
  const atSource =
    l.source === nodeId &&
    (l.sourcePort === undefined || l.sourcePort === port);
  const atTarget =
    l.target === nodeId &&
    (l.targetPort === undefined || l.targetPort === port);
  return atSource || atTarget;
}

export function oppositePort(port: NodePort): NodePort {
  switch (port) {
    case "n":
      return "s";
    case "s":
      return "n";
    case "e":
      return "w";
    case "w":
      return "e";
  }
}

export function bboxPortPoint(
  x: number,
  y: number,
  w: number,
  h: number,
  port: NodePort | undefined,
): { x: number; y: number } {
  if (!port) {
    return { x: x + w / 2, y: y + h / 2 };
  }
  const d = portAnchorDepthFromEdge();
  switch (port) {
    case "n":
      return { x: x + w / 2, y: y + d };
    case "s":
      return { x: x + w / 2, y: y + h - d };
    case "w":
      return { x: x + d, y: y + h / 2 };
    case "e":
      return { x: x + w - d, y: y + h / 2 };
  }
}

export function portPoint(
  node: NodeData,
  port: NodePort | undefined,
  w: number,
  h: number,
): { x: number; y: number } {
  return bboxPortPoint(node.x ?? 0, node.y ?? 0, w, h, port);
}

export function inferPortAtPoint(
  px: number,
  py: number,
  nx: number,
  ny: number,
  nw: number,
  nh: number,
): NodePort {
  const cx = nx + nw / 2;
  const cy = ny + nh / 2;
  const dx = (px - cx) / (nw / 2);
  const dy = (py - cy) / (nh / 2);
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx < 0 ? "w" : "e";
  }
  return dy < 0 ? "n" : "s";
}

export type LayoutGetter = (nodeId: string) => { w: number; h: number };

function linkChildOnEdge(
  l: LinkData,
  nodeId: string,
  edge: NodePort,
): boolean {
  if (l.source !== nodeId || l.sourceChildSlot == null) return false;
  const e = (l.sourcePort ?? "e") as NodePort;
  return e === edge;
}

/** Скільки слотів показати на конкретному боці ноди. */
export function visibleChildSlotCount(
  allLinks: LinkData[],
  nodeId: string,
  edge: NodePort,
): number {
  let maxS = 0;
  for (const l of allLinks) {
    if (linkChildOnEdge(l, nodeId, edge)) {
      maxS = Math.max(maxS, l.sourceChildSlot!);
    }
  }
  return Math.max(1, maxS + 1);
}

/** Точка виходу для n-го слота на заданому боці (1-based). */
export function edgeChildSlotPoint(
  node: NodeData,
  edge: NodePort,
  slot: number,
  visibleSlotCount: number,
  w: number,
  h: number,
): { x: number; y: number } {
  const x = node.x ?? 0;
  const y = node.y ?? 0;
  const d = portAnchorDepthFromEdge();
  const gap = NODE_PORT_SLOT_GAP;
  const n = Math.max(1, visibleSlotCount);
  const si = slot - 1;
  const off = (si - (n - 1) / 2) * gap;
  switch (edge) {
    case "e":
      return { x: x + w - d, y: y + h / 2 + off };
    case "w":
      return { x: x + d, y: y + h / 2 + off };
    case "n":
      return { x: x + w / 2 + off, y: y + d };
    case "s":
      return { x: x + w / 2 + off, y: y + h - d };
  }
}

export function linkUsesChildSlot(
  l: LinkData,
  nodeId: string,
  edge: NodePort,
  slot: number,
): boolean {
  return (
    l.source === nodeId &&
    l.sourceChildSlot === slot &&
    (l.sourcePort ?? "e") === edge
  );
}

function inferSourcePortFromVector(
  ax: number,
  ay: number,
  bx: number,
  by: number,
): NodePort {
  const dx = bx - ax;
  const dy = by - ay;
  if (Math.abs(dx) >= Math.abs(dy)) return dx >= 0 ? "e" : "w";
  return dy >= 0 ? "s" : "n";
}

function inferTargetPortFromVector(
  ax: number,
  ay: number,
  bx: number,
  by: number,
): NodePort {
  const dx = bx - ax;
  const dy = by - ay;
  if (Math.abs(dx) >= Math.abs(dy)) return dx >= 0 ? "w" : "e";
  return dy >= 0 ? "n" : "s";
}

function sourceControlOffset(port: NodePort, m: number): { x: number; y: number } {
  switch (port) {
    case "e":
      return { x: m, y: 0 };
    case "w":
      return { x: -m, y: 0 };
    case "n":
      return { x: 0, y: -m };
    case "s":
      return { x: 0, y: m };
  }
}

/** Друга контрольна точка: з боку цільової ноди, уздовж напрямку входу в порт. */
function targetControlOffset(port: NodePort, m: number): { x: number; y: number } {
  switch (port) {
    case "w":
      return { x: -m, y: 0 };
    case "e":
      return { x: m, y: 0 };
    case "n":
      return { x: 0, y: -m };
    case "s":
      return { x: 0, y: m };
  }
}

/** Порт джерела для кривої звʼязку (як у візуалізації SVG). */
export function resolveLinkSourcePortForBezier(link: LinkData): NodePort | undefined {
  if (link.sourceChildSlot != null) return link.sourcePort ?? "e";
  return link.sourcePort;
}

export type LinkBezierGeometry = {
  ax: number;
  ay: number;
  cx1: number;
  cy1: number;
  cx2: number;
  cy2: number;
  bx: number;
  by: number;
};

/**
 * Кубічна Безьє між кінцями звʼязку (ті самі координати, що й у `linkBezierPathD`).
 */
export function linkBezierGeometry(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  sourcePort: NodePort | undefined,
  targetPort: NodePort | undefined,
): LinkBezierGeometry {
  const sp = sourcePort ?? inferSourcePortFromVector(ax, ay, bx, by);
  const tp = targetPort ?? inferTargetPortFromVector(ax, ay, bx, by);
  const dist = Math.hypot(bx - ax, by - ay);
  const m = Math.min(220, Math.max(56, dist * 0.38));
  const o1 = sourceControlOffset(sp, m);
  const o2 = targetControlOffset(tp, m);
  const cx1 = ax + o1.x;
  const cy1 = ay + o1.y;
  const cx2 = bx + o2.x;
  const cy2 = by + o2.y;
  return { ax, ay, cx1, cy1, cx2, cy2, bx, by };
}

/**
 * SVG path `d` для гнучкого звʼязку (кубічна крива Безьє) у координатах полотна (px).
 */
export function linkBezierPathD(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  sourcePort: NodePort | undefined,
  targetPort: NodePort | undefined,
): string {
  const g = linkBezierGeometry(ax, ay, bx, by, sourcePort, targetPort);
  return `M ${g.ax} ${g.ay} C ${g.cx1} ${g.cy1} ${g.cx2} ${g.cy2} ${g.bx} ${g.by}`;
}

export function getLinkEndpoints(
  link: LinkData,
  nodes: NodeData[],
  canvasImages: CanvasImageItem[],
  layoutOf: LayoutGetter,
  allLinks: LinkData[],
): { a: { x: number; y: number }; b: { x: number; y: number } } | null {
  const srcIsImg = link.sourceIsCanvasImage === true;
  const tgtIsImg = link.targetIsCanvasImage === true;

  let a: { x: number; y: number };
  if (srcIsImg) {
    const img = canvasImages.find((i) => i.id === link.source);
    if (!img) return null;
    a = bboxPortPoint(
      img.x,
      img.y,
      img.width,
      img.height,
      link.sourcePort,
    );
  } else {
    const sa = nodes.find((n) => n.id === link.source);
    if (!sa) return null;
    const sw = layoutOf(link.source);
    a =
      link.sourceChildSlot != null
        ? edgeChildSlotPoint(
            sa,
            link.sourcePort ?? "e",
            link.sourceChildSlot,
            visibleChildSlotCount(
              allLinks,
              link.source,
              link.sourcePort ?? "e",
            ),
            sw.w,
            sw.h,
          )
        : portPoint(sa, link.sourcePort, sw.w, sw.h);
  }

  let b: { x: number; y: number };
  if (tgtIsImg) {
    const img = canvasImages.find((i) => i.id === link.target);
    if (!img) return null;
    b = bboxPortPoint(
      img.x,
      img.y,
      img.width,
      img.height,
      link.targetPort,
    );
  } else {
    const ta = nodes.find((n) => n.id === link.target);
    if (!ta) return null;
    const tw = layoutOf(link.target);
    b = portPoint(ta, link.targetPort, tw.w, tw.h);
  }

  return { a, b };
}

export function normalizeDrawRect(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
) {
  const left = Math.min(x0, x1);
  const top = Math.min(y0, y1);
  const w = Math.abs(x1 - x0);
  const h = Math.abs(y1 - y0);
  return { left, top, w, h };
}

/** Перетин двох вісево-вирівняних прямокутників у логічних координатах полотна. */
export function rectsIntersectLogical(
  a: { left: number; top: number; w: number; h: number },
  b: { left: number; top: number; w: number; h: number },
): boolean {
  return (
    a.left < b.left + b.w &&
    a.left + a.w > b.left &&
    a.top < b.top + b.h &&
    a.top + a.h > b.top
  );
}

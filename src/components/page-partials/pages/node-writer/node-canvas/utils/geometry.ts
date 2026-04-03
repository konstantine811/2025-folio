import type {
  CanvasImageItem,
  LinkData,
  NodeData,
  NodePort,
} from "../../types/types";

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
  switch (port) {
    case "n":
      return { x: x + w / 2, y };
    case "s":
      return { x: x + w / 2, y: y + h };
    case "w":
      return { x, y: y + h / 2 };
    case "e":
      return { x: x + w, y: y + h / 2 };
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
  const t = slot / (visibleSlotCount + 1);
  switch (edge) {
    case "e":
      return { x: x + w, y: y + t * h };
    case "w":
      return { x, y: y + t * h };
    case "n":
      return { x: x + t * w, y };
    case "s":
      return { x: x + t * w, y: y + h };
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

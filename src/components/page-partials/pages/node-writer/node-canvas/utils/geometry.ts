import type { LinkData, NodeData, NodePort } from "../../types/types";

/** Чи привʼязаний звʼязок до цього порту (для відʼєднання при перетягуванні дроту). */
export function linkUsesPort(
  l: LinkData,
  nodeId: string,
  port: NodePort,
): boolean {
  const atSource =
    l.source === nodeId &&
    (l.sourcePort === undefined || l.sourcePort === port);
  const atTarget =
    l.target === nodeId &&
    (l.targetPort === undefined || l.targetPort === port);
  return atSource || atTarget;
}

export function portPoint(
  node: NodeData,
  port: NodePort | undefined,
  w: number,
  h: number,
): { x: number; y: number } {
  const x = node.x ?? 0;
  const y = node.y ?? 0;
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

export function getLinkEndpoints(
  link: LinkData,
  nodes: NodeData[],
  layoutOf: LayoutGetter,
): { a: { x: number; y: number }; b: { x: number; y: number } } | null {
  const sa = nodes.find((n) => n.id === link.source);
  const ta = nodes.find((n) => n.id === link.target);
  if (!sa || !ta) return null;
  const sw = layoutOf(link.source);
  const tw = layoutOf(link.target);
  const a = portPoint(sa, link.sourcePort, sw.w, sw.h);
  const b = portPoint(ta, link.targetPort, tw.w, tw.h);
  return { a, b };
}

export function normalizeDrawRect(x0: number, y0: number, x1: number, y1: number) {
  const left = Math.min(x0, x1);
  const top = Math.min(y0, y1);
  const w = Math.abs(x1 - x0);
  const h = Math.abs(y1 - y0);
  return { left, top, w, h };
}

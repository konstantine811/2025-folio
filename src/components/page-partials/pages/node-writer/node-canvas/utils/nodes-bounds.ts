import type { CanvasImageItem, NodeData } from "../../types/types";
import { resolveNodeLayout } from "./layout";

/** AABB у логічних координатах полотна (як у `node.x` / виміряні розміри). */
export function getNodesBoundingLogical(
  nodes: NodeData[],
  layouts: Map<string, { w: number; h: number }>,
): { L: number; T: number; R: number; B: number } | null {
  if (nodes.length === 0) return null;
  let L = Infinity;
  let T = Infinity;
  let R = -Infinity;
  let B = -Infinity;
  for (const n of nodes) {
    const x = n.x ?? 0;
    const y = n.y ?? 0;
    const { w, h } = resolveNodeLayout(n, layouts.get(n.id));
    L = Math.min(L, x);
    T = Math.min(T, y);
    R = Math.max(R, x + w);
    B = Math.max(B, y + h);
  }
  return { L, T, R, B };
}

export function getImagesBoundingLogical(
  images: CanvasImageItem[],
): { L: number; T: number; R: number; B: number } | null {
  if (images.length === 0) return null;
  let L = Infinity;
  let T = Infinity;
  let R = -Infinity;
  let B = -Infinity;
  for (const img of images) {
    L = Math.min(L, img.x);
    T = Math.min(T, img.y);
    R = Math.max(R, img.x + img.width);
    B = Math.max(B, img.y + img.height);
  }
  return { L, T, R, B };
}

export function mergeLogicalBounds(
  a: { L: number; T: number; R: number; B: number } | null,
  b: { L: number; T: number; R: number; B: number } | null,
): { L: number; T: number; R: number; B: number } | null {
  if (!a && !b) return null;
  if (!a) return b;
  if (!b) return a;
  return {
    L: Math.min(a.L, b.L),
    T: Math.min(a.T, b.T),
    R: Math.max(a.R, b.R),
    B: Math.max(a.B, b.B),
  };
}

export function getCanvasContentBoundsLogical(
  nodes: NodeData[],
  layouts: Map<string, { w: number; h: number }>,
  images: CanvasImageItem[],
): { L: number; T: number; R: number; B: number } | null {
  return mergeLogicalBounds(
    getNodesBoundingLogical(nodes, layouts),
    getImagesBoundingLogical(images),
  );
}

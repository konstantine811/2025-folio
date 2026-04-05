import type { CanvasImageItem, LinkData } from "../types/types";

/** Орієнтовані ребра між зображеннями на полотні (ланцюжки). */
export function buildCanvasCanvasAdjacency(
  links: LinkData[],
  canvasById: Map<string, CanvasImageItem>,
): Map<string, string[]> {
  const m = new Map<string, string[]>();
  for (const l of links) {
    if (
      l.sourceIsCanvasImage &&
      l.targetIsCanvasImage &&
      canvasById.has(l.source) &&
      canvasById.has(l.target)
    ) {
      const arr = m.get(l.source) ?? [];
      arr.push(l.target);
      m.set(l.source, arr);
    }
  }
  return m;
}

function expandCanvasChainFromRoot(
  rootId: string,
  adj: Map<string, string[]>,
  canvasById: Map<string, CanvasImageItem>,
): CanvasImageItem[] {
  const out: CanvasImageItem[] = [];
  const visited = new Set<string>();
  function dfs(id: string) {
    if (visited.has(id)) return;
    visited.add(id);
    const img = canvasById.get(id);
    if (img) out.push(img);
    for (const next of adj.get(id) ?? []) dfs(next);
  }
  dfs(rootId);
  return out;
}

/**
 * Зображення на полотні, пов’язані з нодою: canvas→node, node→canvas (з урахуванням ланцюжка canvas→canvas).
 */
export function canvasImagesForArticleNode(
  nodeId: string,
  links: LinkData[],
  canvasById: Map<string, CanvasImageItem>,
  canvasAdj: Map<string, string[]>,
): CanvasImageItem[] {
  const seen = new Set<string>();
  const out: CanvasImageItem[] = [];

  // canvas → node
  for (const l of links) {
    if (
      l.sourceIsCanvasImage &&
      !l.targetIsCanvasImage &&
      l.target === nodeId &&
      canvasById.has(l.source)
    ) {
      const chain = expandCanvasChainFromRoot(
        l.source,
        canvasAdj,
        canvasById,
      );
      for (const img of chain) {
        if (!seen.has(img.id)) {
          seen.add(img.id);
          out.push(img);
        }
      }
    }
  }

  // node → canvas
  for (const l of links) {
    if (
      l.targetIsCanvasImage &&
      !l.sourceIsCanvasImage &&
      l.source === nodeId &&
      canvasById.has(l.target)
    ) {
      const chain = expandCanvasChainFromRoot(
        l.target,
        canvasAdj,
        canvasById,
      );
      for (const img of chain) {
        if (!seen.has(img.id)) {
          seen.add(img.id);
          out.push(img);
        }
      }
    }
  }

  return out;
}

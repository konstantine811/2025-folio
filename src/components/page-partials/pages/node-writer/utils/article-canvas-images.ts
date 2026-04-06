import type { CanvasImageItem, LinkData } from "../types/types";
import type { ArticleSection } from "./article-node-tree";

function sortIdsByCanvasPosition(
  ids: string[],
  canvasById: Map<string, CanvasImageItem>,
): string[] {
  return [...ids].sort((a, b) => {
    const ia = canvasById.get(a);
    const ib = canvasById.get(b);
    const ya = ia?.y ?? 0;
    const yb = ib?.y ?? 0;
    if (ya !== yb) return ya - yb;
    const xa = ia?.x ?? 0;
    const xb = ib?.x ?? 0;
    if (xa !== xb) return xa - xb;
    return a.localeCompare(b);
  });
}

/**
 * Сусіди між зображеннями на полотні: ребро в обидва боки, щоб ланцюжок знаходився
 * незалежно від напрямку стрілки (раніше лише source→target і DFS пропускали «зворотні» звʼязки).
 */
export function buildCanvasCanvasAdjacency(
  links: LinkData[],
  canvasById: Map<string, CanvasImageItem>,
): Map<string, string[]> {
  const m = new Map<string, string[]>();
  const push = (from: string, to: string) => {
    if (!canvasById.has(from) || !canvasById.has(to)) return;
    const arr = m.get(from) ?? [];
    arr.push(to);
    m.set(from, arr);
  };
  for (const l of links) {
    if (
      l.sourceIsCanvasImage &&
      l.targetIsCanvasImage &&
      canvasById.has(l.source) &&
      canvasById.has(l.target)
    ) {
      push(l.source, l.target);
      push(l.target, l.source);
    }
  }
  for (const [k, arr] of m) {
    const uniq = [...new Set(arr)];
    m.set(k, sortIdsByCanvasPosition(uniq, canvasById));
  }
  return m;
}

/** Уся компонента звʼязності від кореня (BFS — передбачуваний порядок «зверху вниз» на полотні). */
function expandCanvasChainFromRoot(
  rootId: string,
  adj: Map<string, string[]>,
  canvasById: Map<string, CanvasImageItem>,
): CanvasImageItem[] {
  const out: CanvasImageItem[] = [];
  if (!canvasById.has(rootId)) return out;

  const visited = new Set<string>();
  const queue: string[] = [rootId];
  visited.add(rootId);

  while (queue.length > 0) {
    const id = queue.shift()!;
    const img = canvasById.get(id);
    if (img) out.push(img);
    for (const next of adj.get(id) ?? []) {
      if (!visited.has(next)) {
        visited.add(next);
        queue.push(next);
      }
    }
  }
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

/**
 * Для кожної ноди — зображення полотна для статті з **глобальним** дедупом по `id` у порядку DFS статті
 * (батько перед дітьми, корені послідовно). Та сама картка не повторюється в нащадках.
 */
export function buildCanvasImagesByNodeIdDfs(
  sections: ArticleSection[],
  links: LinkData[],
  canvasById: Map<string, CanvasImageItem>,
  canvasAdj: Map<string, string[]>,
): Map<string, CanvasImageItem[]> {
  const used = new Set<string>();
  const byNode = new Map<string, CanvasImageItem[]>();

  function walk(s: ArticleSection) {
    const raw = canvasImagesForArticleNode(
      s.node.id,
      links,
      canvasById,
      canvasAdj,
    );
    const filtered: CanvasImageItem[] = [];
    for (const img of raw) {
      if (!used.has(img.id)) {
        used.add(img.id);
        filtered.push(img);
      }
    }
    byNode.set(s.node.id, filtered);
    for (const c of s.children) walk(c);
  }

  for (const r of sections) walk(r);
  return byNode;
}

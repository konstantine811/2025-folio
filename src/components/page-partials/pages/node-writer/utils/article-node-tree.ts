import type { IArticleHeading } from "@/types/blog-storage";
import { resolveNodeHeadingLevel } from "../node-canvas/constants";
import type { LinkData, NodeData } from "../types/types";

export interface ArticleSection {
  node: NodeData;
  depth: number;
  children: ArticleSection[];
}

function nodeToNodeLinks(links: LinkData[], nodeIds: Set<string>): LinkData[] {
  return links.filter(
    (l) =>
      !l.sourceIsCanvasImage &&
      !l.targetIsCanvasImage &&
      nodeIds.has(l.source) &&
      nodeIds.has(l.target),
  );
}

/**
 * Дерево секцій для статті: ребра лише між нодами; порядок дітей — `sourceChildSlot`, далі `target`.
 * Корені — ноди без вхідного ребра від іншої ноди. Якщо всі ноди в циклі — плоский список у порядку масиву.
 */
export function buildArticleSectionsFromNodes(
  nodes: NodeData[],
  links: LinkData[],
): ArticleSection[] {
  if (nodes.length === 0) return [];

  const nodeIds = new Set(nodes.map((n) => n.id));
  const nn = nodeToNodeLinks(links, nodeIds);
  const targets = new Set(nn.map((l) => l.target));
  const childrenByParent = new Map<string, LinkData[]>();
  for (const l of nn) {
    const arr = childrenByParent.get(l.source) ?? [];
    arr.push(l);
    childrenByParent.set(l.source, arr);
  }
  for (const [k, arr] of childrenByParent) {
    arr.sort(
      (a, b) =>
        (a.sourceChildSlot ?? 0) - (b.sourceChildSlot ?? 0) ||
        a.target.localeCompare(b.target),
    );
    childrenByParent.set(k, arr);
  }
  const nodeById = new Map(nodes.map((n) => [n.id, n]));

  function buildSection(nodeId: string, depth: number): ArticleSection | null {
    const node = nodeById.get(nodeId);
    if (!node) return null;
    const childLinks = childrenByParent.get(nodeId) ?? [];
    const children: ArticleSection[] = [];
    for (const l of childLinks) {
      const s = buildSection(l.target, depth + 1);
      if (s) children.push(s);
    }
    return { node, depth, children };
  }

  const orderIndex = new Map(nodes.map((n, i) => [n.id, i]));

  function nodeCanvasOrderKey(n: NodeData): [number, number] {
    return [n.y ?? 0, n.x ?? 0];
  }

  const roots = nodes.filter((n) => !targets.has(n.id));
  /** Головна нода першою: менший рівень заголовка (h1 перед h2), далі порядок на полотні (y, x), потім порядок у масиві. */
  roots.sort((a, b) => {
    const ha = resolveNodeHeadingLevel(a.headingLevel);
    const hb = resolveNodeHeadingLevel(b.headingLevel);
    if (ha !== hb) return ha - hb;
    const [ya, xa] = nodeCanvasOrderKey(a);
    const [yb, xb] = nodeCanvasOrderKey(b);
    if (ya !== yb) return ya - yb;
    if (xa !== xb) return xa - xb;
    return (orderIndex.get(a.id) ?? 0) - (orderIndex.get(b.id) ?? 0);
  });

  if (roots.length === 0) {
    return nodes.map((n) => ({ node: n, depth: 0, children: [] }));
  }

  return roots.map((r) => buildSection(r.id, 0)!).filter(Boolean);
}

/** Навігація по заголовках секцій (ноди), як у блозі — id збігаються з `nw-sec-*` на заголовках. */
export function buildTocFromSections(sections: ArticleSection[]): IArticleHeading[] {
  const out: IArticleHeading[] = [];
  function walk(s: ArticleSection) {
    out.push({
      id: `nw-sec-${s.node.id}`,
      text: s.node.label,
      depth: resolveNodeHeadingLevel(s.node.headingLevel),
    });
    for (const c of s.children) walk(c);
  }
  for (const s of sections) walk(s);
  return out;
}

export function flattenArticleSectionsDeepFirst(
  sections: ArticleSection[],
): ArticleSection[] {
  const out: ArticleSection[] = [];
  function walk(s: ArticleSection) {
    out.push(s);
    for (const c of s.children) walk(c);
  }
  for (const s of sections) walk(s);
  return out;
}

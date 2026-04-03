import type { Project } from "../../types/types";
import { resolveNodeHeadingLevel } from "../constants";

/** Знімок для порівняння: ігнорує лише позицію/розмір нод (x, y, width, height, fx, fy). */
export function semanticNodesSnapshot(project: Project): string {
  const images = project.canvasImages ?? [];
  return JSON.stringify({
    title: project.title,
    nodes: project.nodes.map((n) => ({
      id: n.id,
      label: n.label,
      headingLevel: resolveNodeHeadingLevel(n.headingLevel),
      description: n.description ?? "",
      type: n.type,
      accentColor: n.accentColor ?? "",
    })),
    canvasImages: images.map((i) => ({
      id: i.id,
      title: i.title ?? "",
    })),
    links: project.links,
  });
}

export function logDocumentNodesSummary(_project: Project): void {
  /* дебаг-лог прибрано з production */
}

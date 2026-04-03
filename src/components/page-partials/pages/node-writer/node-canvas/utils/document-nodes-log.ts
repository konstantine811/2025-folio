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

export function logDocumentNodesSummary(project: Project): void {
  const nodeById = new Map(project.nodes.map((n) => [n.id, n]));
  const payload = {
    документ: project.title,
    ноди: project.nodes.map((n) => {
      const дочірні = project.links
        .filter((l) => l.source === n.id)
        .map((l) => {
          const t = nodeById.get(l.target);
          return {
            заголовок: t?.label ?? l.target,
            текст: t?.description ?? "",
            слот: l.sourceChildSlot,
            бік: l.sourcePort,
            ціль_id: l.target,
          };
        });
      return {
        id: n.id,
        заголовок: n.label,
        текст: n.description ?? "",
        дочірні,
      };
    }),
  };
  console.log("%c[Документ · ноди]", "color:#00FF9C;font-weight:bold", payload);
}

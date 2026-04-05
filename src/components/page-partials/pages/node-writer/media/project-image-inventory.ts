import type { Project } from "../types/types";
import { descriptionFromBlocks } from "../node-canvas/utils/node-markdown-blocks";
import { normalizeSlide } from "../presentation/presentation-model";
import {
  extractImageUrlsFromMarkdown,
  nodeWriterRefFromPath,
  urlToNodeWriterStoragePath,
} from "@/services/firebase/node-writer-workspace";

export interface ProjectImageReference {
  /** `orphan` — файл є в Storage, але не згадується в документі (Firestore). */
  kind: "asset" | "canvas" | "node-card" | "node-text" | "slide" | "orphan";
  label: string;
}

export interface ProjectImageInventoryEntry {
  /** Нормалізований шлях у bucket (`node-writer/...`). */
  storagePath: string;
  /** URL для прев’ю (як у документі). */
  previewUrl: string;
  references: ProjectImageReference[];
}

function addRef(
  map: Map<
    string,
    { previewUrl: string; refs: ProjectImageReference[] }
  >,
  url: string,
  ref: ProjectImageReference,
) {
  const path = urlToNodeWriterStoragePath(url);
  if (!path) return;
  const cur = map.get(path);
  if (cur) {
    if (!cur.refs.some((r) => r.label === ref.label && r.kind === ref.kind)) {
      cur.refs.push(ref);
    }
  } else {
    map.set(path, { previewUrl: url, refs: [ref] });
  }
}

/**
 * Унікальні зображення з Firebase Storage у проєкті та звідки на них посилання.
 */
export interface WorkspaceImageSource {
  projectId: string;
  projectTitle: string;
  references: ProjectImageReference[];
}

/** Один файл у Storage може згадуватись у кількох документах — джерела згруповані. */
export interface WorkspaceImageEntry {
  storagePath: string;
  previewUrl: string;
  sources: WorkspaceImageSource[];
}

export function buildWorkspaceImageInventory(
  projects: Project[],
): WorkspaceImageEntry[] {
  const map = new Map<
    string,
    { previewUrl: string; sources: WorkspaceImageSource[] }
  >();

  for (const project of projects) {
    const inv = buildProjectImageInventory(project);
    for (const e of inv) {
      const src: WorkspaceImageSource = {
        projectId: project.id,
        projectTitle: project.title?.trim() || "Без назви",
        references: e.references,
      };
      const cur = map.get(e.storagePath);
      if (cur) {
        cur.sources.push(src);
      } else {
        map.set(e.storagePath, {
          previewUrl: e.previewUrl,
          sources: [src],
        });
      }
    }
  }

  const out: WorkspaceImageEntry[] = [];
  for (const [storagePath, { previewUrl, sources }] of map) {
    out.push({ storagePath, previewUrl, sources });
  }
  out.sort((a, b) => a.storagePath.localeCompare(b.storagePath));
  return out;
}

/** Доповнює інвентар за документами шляхами з реального вмісту Storage (у т.ч. «сироти»). */
export function mergeWorkspaceInventoryWithStoragePaths(
  docEntries: WorkspaceImageEntry[],
  storagePaths: string[],
  projects: Project[],
  workspaceScope: string,
): WorkspaceImageEntry[] {
  const byPath = new Map<string, WorkspaceImageEntry>(
    docEntries.map((e) => [e.storagePath, e]),
  );
  const projectById = new Map(projects.map((p) => [p.id, p]));
  const esc = workspaceScope.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const prefixRe = new RegExp(
    `^node-writer/${esc}/projects/([^/]+)/`,
  );

  for (const path of storagePaths) {
    if (byPath.has(path)) continue;
    const m = path.match(prefixRe);
    if (!m) continue;
    const projectId = m[1];
    const project = projectById.get(projectId);
    const previewUrl = nodeWriterRefFromPath(path);
    byPath.set(path, {
      storagePath: path,
      previewUrl,
      sources: [
        {
          projectId,
          projectTitle: project?.title?.trim() || "Без назви",
          references: [
            {
              kind: "orphan",
              label: "Файл у Storage без посилання в документі",
            },
          ],
        },
      ],
    });
  }

  return Array.from(byPath.values()).sort((a, b) =>
    a.storagePath.localeCompare(b.storagePath),
  );
}

export function mergeProjectInventoryWithStoragePaths(
  docEntries: ProjectImageInventoryEntry[],
  storagePaths: string[],
  project: Project,
  workspaceScope: string,
): ProjectImageInventoryEntry[] {
  const byPath = new Map(docEntries.map((e) => [e.storagePath, e]));
  const projectPrefix = `node-writer/${workspaceScope}/projects/${project.id}/`;

  for (const path of storagePaths) {
    if (byPath.has(path)) continue;
    if (!path.startsWith(projectPrefix)) continue;
    byPath.set(path, {
      storagePath: path,
      previewUrl: nodeWriterRefFromPath(path),
      references: [
        {
          kind: "orphan",
          label: "Файл у Storage без посилання в документі",
        },
      ],
    });
  }

  return Array.from(byPath.values()).sort((a, b) =>
    a.storagePath.localeCompare(b.storagePath),
  );
}

export function buildProjectImageInventory(
  project: Project,
): ProjectImageInventoryEntry[] {
  const map = new Map<
    string,
    { previewUrl: string; refs: ProjectImageReference[] }
  >();

  for (const a of project.images ?? []) {
    addRef(map, a.url, {
      kind: "asset",
      label: `Бібліотека: ${(a.prompt ?? "").trim() || a.id}`,
    });
  }

  for (const im of project.canvasImages ?? []) {
    addRef(map, im.url, {
      kind: "canvas",
      label: `Полотно: ${(im.title?.trim() || "зображення").slice(0, 48)}`,
    });
  }

  for (const n of project.nodes) {
    const nodeTitle = n.label?.trim() || "Без назви";
    if (n.imageUrl) {
      addRef(map, n.imageUrl, {
        kind: "node-card",
        label: `Нода «${nodeTitle}»: зображення картки`,
      });
    }
    const texts =
      n.markdownBlocks && n.markdownBlocks.length > 0
        ? n.markdownBlocks.map((b) => b.text ?? "")
        : [n.description ?? ""];
    for (const text of texts) {
      for (const u of extractImageUrlsFromMarkdown(text)) {
        addRef(map, u, {
          kind: "node-text",
          label: `Нода «${nodeTitle}»: у тексті (markdown)`,
        });
      }
    }
  }

  const slideList = project.slides ?? [];
  for (let si = 0; si < slideList.length; si++) {
    const slide = slideList[si];
    const slideLabel = slide.title?.trim() || `Слайд ${si + 1}`;
    for (const b of slide.blocks ?? []) {
      if (b.kind === "image") {
        addRef(map, b.url, {
          kind: "slide",
          label: `Презентація — «${slideLabel}»`,
        });
      }
    }
  }

  const out: ProjectImageInventoryEntry[] = [];
  for (const [storagePath, { previewUrl, refs }] of map) {
    out.push({ storagePath, previewUrl, references: refs });
  }
  out.sort((a, b) => a.storagePath.localeCompare(b.storagePath));
  return out;
}

function stripMarkdownImageRefs(text: string, storagePath: string): string {
  if (!text) return text;
  let out = text;
  out = out.replace(/!\[[^\]]*\]\([^)]+\)/g, (full) => {
    const m = full.match(/\]\(([^)]+)\)/);
    if (m && urlToNodeWriterStoragePath(m[1].trim()) === storagePath) {
      return "";
    }
    return full;
  });
  out = out.replace(/<img[^>]+>/gi, (full) => {
    const m = full.match(/src\s*=\s*["']([^"']+)["']/i);
    if (m && urlToNodeWriterStoragePath(m[1]) === storagePath) {
      return "";
    }
    return full;
  });
  return out;
}

function urlMatchesPath(
  url: string | undefined,
  storagePath: string,
): boolean {
  if (!url) return false;
  return urlToNodeWriterStoragePath(url) === storagePath;
}

/**
 * Прибирає всі посилання на файл у документі (ноди, полотно, слайди, бібліотека).
 * Після застосування патчу `collectRemovedNodeWriterStoragePaths` видалить об’єкт у Storage.
 */
export function removeProjectReferencesToStoragePath(
  project: Project,
  storagePath: string,
): Project {
  if (!storagePath) return project;

  let changed = false;

  const images = (project.images ?? []).filter((a) => {
    if (urlMatchesPath(a.url, storagePath)) {
      changed = true;
      return false;
    }
    return true;
  });

  const canvasImages = (project.canvasImages ?? []).filter((c) => {
    if (urlMatchesPath(c.url, storagePath)) {
      changed = true;
      return false;
    }
    return true;
  });

  const nodes = project.nodes.map((node) => {
    const n = { ...node };
    if (urlMatchesPath(n.imageUrl, storagePath)) {
      n.imageUrl = undefined;
      changed = true;
    }
    if (n.markdownBlocks && n.markdownBlocks.length > 0) {
      const newBlocks = n.markdownBlocks.map((b) => {
        const t = stripMarkdownImageRefs(b.text ?? "", storagePath);
        if (t !== (b.text ?? "")) changed = true;
        return { ...b, text: t };
      });
      n.markdownBlocks = newBlocks;
      n.description = descriptionFromBlocks(newBlocks);
    } else if (n.description) {
      const d = stripMarkdownImageRefs(n.description, storagePath);
      if (d !== n.description) {
        n.description = d;
        changed = true;
      }
    }
    return n;
  });

  const slides = (project.slides ?? []).map((slide) => {
    const before = slide.blocks?.length ?? 0;
    const blocks = (slide.blocks ?? []).filter((b) => {
      if (b.kind === "image" && urlMatchesPath(b.url, storagePath)) {
        changed = true;
        return false;
      }
      return true;
    });
    if (blocks.length === before) return slide;
    return normalizeSlide({ ...slide, blocks });
  });

  if (!changed) return project;

  return {
    ...project,
    images,
    canvasImages,
    nodes,
    slides,
  };
}

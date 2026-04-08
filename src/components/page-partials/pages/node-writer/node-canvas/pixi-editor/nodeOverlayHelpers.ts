import type { CSSProperties } from "react";
import {
  NODE_HEADING_LABEL_CLASSES,
  NODE_PORT_EDGE_INSET,
  NODE_PORT_HANDLE_PX,
  NODE_PORT_SLOT_GAP,
} from "../constants";
import { descriptionFromBlocks } from "../utils/node-markdown-blocks";
import type {
  NodeHeadingLevel,
  NodeMarkdownBlock,
  NodePort,
  ProjectPatchFn,
} from "../../types/types";

export const EDGES: NodePort[] = ["n", "e", "s", "w"];
export const SLOT_FLEX_GAP_PX = NODE_PORT_SLOT_GAP - NODE_PORT_HANDLE_PX;

export const EDGE_PORT_RING: Record<NodePort, string> = {
  e: "border-sky-400/80 bg-sky-400 text-sky-950 shadow-[0_0_10px_rgba(56,189,248,0.45)]",
  w: "border-emerald-400/80 bg-emerald-400 text-emerald-950 shadow-[0_0_10px_rgba(52,211,153,0.4)]",
  n: "border-amber-400/80 bg-amber-400 text-amber-950 shadow-[0_0_10px_rgba(251,191,36,0.45)]",
  s: "border-rose-400/80 bg-rose-400 text-rose-950 shadow-[0_0_10px_rgba(251,113,133,0.4)]",
};

export function edgeGroupPositionStyle(edge: NodePort): CSSProperties {
  const inset = NODE_PORT_EDGE_INSET;
  switch (edge) {
    case "n":
      return { left: "50%", top: inset, transform: "translateX(-50%)" };
    case "s":
      return { left: "50%", bottom: inset, transform: "translateX(-50%)" };
    case "e":
      return { right: inset, top: "50%", transform: "translateY(-50%)" };
    case "w":
      return { left: inset, top: "50%", transform: "translateY(-50%)" };
  }
}

export function edgeGroupLayoutClass(edge: NodePort): string {
  return edge === "n" || edge === "s"
    ? "flex flex-row items-center justify-center"
    : "flex flex-col items-center justify-center";
}

export function inferPortFromClientPoint(
  rect: DOMRect,
  clientX: number,
  clientY: number,
): NodePort {
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dx = (clientX - cx) / Math.max(rect.width / 2, 1);
  const dy = (clientY - cy) / Math.max(rect.height / 2, 1);
  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx < 0 ? "w" : "e";
  }
  return dy < 0 ? "n" : "s";
}

export function updateNodeLabel(
  onProjectPatch: (fn: ProjectPatchFn) => void,
  nodeId: string,
  nextLabel: string,
) {
  onProjectPatch((prev) => ({
    ...prev,
    nodes: prev.nodes.map((node) =>
      node.id === nodeId ? { ...node, label: nextLabel } : node,
    ),
  }));
}

export function normalizeHeadingLevel(
  level: NodeHeadingLevel | undefined,
): NodeHeadingLevel {
  if (
    level === 1 ||
    level === 2 ||
    level === 3 ||
    level === 4 ||
    level === 5 ||
    level === 6
  ) {
    return level;
  }
  return 2;
}

export function headingLabelClass(level: NodeHeadingLevel): string {
  const weight = level <= 2 ? "font-semibold" : "font-medium";
  return `font-sans antialiased normal-case text-foreground ${NODE_HEADING_LABEL_CLASSES[level]} ${weight}`;
}

export function updateNodeHeadingLevel(
  onProjectPatch: (fn: ProjectPatchFn) => void,
  nodeId: string,
  nextLevel: NodeHeadingLevel,
) {
  onProjectPatch((prev) => ({
    ...prev,
    nodes: prev.nodes.map((node) =>
      node.id === nodeId ? { ...node, headingLevel: nextLevel } : node,
    ),
  }));
}

export function updateNodeAccentColor(
  onProjectPatch: (fn: ProjectPatchFn) => void,
  nodeId: string,
  color: string,
) {
  onProjectPatch((prev) => ({
    ...prev,
    nodes: prev.nodes.map((node) =>
      node.id === nodeId ? { ...node, accentColor: color } : node,
    ),
  }));
}

export function removeNode(
  onProjectPatch: (fn: ProjectPatchFn) => void,
  nodeId: string,
) {
  onProjectPatch((prev) => ({
    ...prev,
    nodes: prev.nodes.filter((node) => node.id !== nodeId),
    links: prev.links.filter(
      (link) => link.source !== nodeId && link.target !== nodeId,
    ),
  }));
}

export function removeCanvasImage(
  onProjectPatch: (fn: ProjectPatchFn) => void,
  imageId: string,
) {
  onProjectPatch((prev) => ({
    ...prev,
    canvasImages: (prev.canvasImages ?? []).filter(
      (image) => image.id !== imageId,
    ),
    links: prev.links.filter(
      (link) => link.source !== imageId && link.target !== imageId,
    ),
  }));
}

export function updateNodeBlocks(
  onProjectPatch: (fn: ProjectPatchFn) => void,
  nodeId: string,
  nextBlocks: NodeMarkdownBlock[],
) {
  onProjectPatch((prev) => ({
    ...prev,
    nodes: prev.nodes.map((candidate) => {
      if (candidate.id !== nodeId) return candidate;
      return {
        ...candidate,
        markdownBlocks: nextBlocks,
        description: descriptionFromBlocks(nextBlocks),
      };
    }),
  }));
}

export function rearGlowStyle(isConnected: boolean): CSSProperties {
  if (isConnected) {
    return {
      background:
        "radial-gradient(ellipse 80% 70% at 24% 46%, rgba(34,197,94,0.36) 0%, transparent 58%), radial-gradient(ellipse 72% 62% at 80% 52%, rgba(34,211,238,0.24) 0%, transparent 52%)",
    };
  }
  return {
    background:
      "radial-gradient(ellipse 80% 70% at 24% 46%, rgba(239,68,68,0.36) 0%, transparent 58%), radial-gradient(ellipse 72% 62% at 80% 52%, rgba(34,211,238,0.24) 0%, transparent 52%)",
  };
}

export function unwrapMarkdownImageCandidate(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const mdImageMatch = trimmed.match(/^!\[[^\]]*]\((.+)\)$/);
  const raw = mdImageMatch ? mdImageMatch[1]!.trim() : trimmed;
  if (raw.startsWith("<") && raw.endsWith(">")) {
    return raw.slice(1, -1).trim();
  }
  return raw;
}

export function toDisplayImageUrlCandidate(value: string): string {
  const raw = unwrapMarkdownImageCandidate(value);
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  if (/^data:image\//i.test(raw)) return raw;
  if (raw.startsWith("/")) return raw;
  if (raw.startsWith("nw-storage:")) {
    const path = raw.slice("nw-storage:".length).trim();
    return path ? `/api/storage-url?path=${encodeURIComponent(path)}` : "";
  }
  if (raw.includes("node-writer%2f") || raw.includes("node-writer/")) {
    return `/api/storage-url?path=${encodeURIComponent(raw)}`;
  }
  return raw;
}

export function looksLikeImageUrl(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return false;
  return (
    normalized.startsWith("http://") ||
    normalized.startsWith("https://") ||
    normalized.startsWith("data:image/") ||
    normalized.startsWith("/") ||
    normalized.startsWith("nw-storage:") ||
    normalized.startsWith("node-writer/") ||
    normalized.includes("node-writer%2f") ||
    normalized.includes(".png") ||
    normalized.includes(".jpg") ||
    normalized.includes(".jpeg") ||
    normalized.includes(".webp") ||
    normalized.includes(".gif") ||
    normalized.includes(".avif")
  );
}

export function extractStandaloneImageUrlFromBlocks(
  blocks: NodeMarkdownBlock[],
): string {
  const nonEmpty = blocks
    .map((b) => (b.text ?? "").trim())
    .filter((text) => text.length > 0);
  if (nonEmpty.length !== 1) return "";

  const only = nonEmpty[0]!;
  const tokens = only
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);
  if (tokens.length !== 1) return "";

  const token = tokens[0]!;
  const candidate = toDisplayImageUrlCandidate(token);
  if (looksLikeImageUrl(candidate)) return candidate;
  const lc = token.toLowerCase();
  if (lc.includes("node-writer%2f") || lc.includes("node-writer/")) {
    return candidate;
  }
  return "";
}

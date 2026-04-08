import type { CanvasImageItem, NodeData } from "../../../types/types";
import {
  DEFAULT_NODE_H,
  DEFAULT_NODE_W,
  PASTED_IMAGE_MIN_SIDE,
  MIN_NODE_H,
  MIN_NODE_W,
} from "../../constants";

export type NodeId = string;

export type EditorNode = {
  id: NodeId;
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  bodyText: string;
  accentColor?: string;
  selected: boolean;
};

export function extractNodeMarkdown(node: NodeData): string {
  if (node.markdownBlocks && node.markdownBlocks.length > 0) {
    return node.markdownBlocks.map((block) => block.text ?? "").join("\n");
  }
  return node.description ?? "";
}

function toNodePreviewText(markdown: string): string {
  const trimmed = markdown.trim();
  if (!trimmed) {
    return "";
  }
  return trimmed.replace(/\s+/g, " ");
}

export function toFiniteNumber(value: unknown, fallback: number): number {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : Number.NaN;

  return Number.isFinite(parsed) ? parsed : fallback;
}

export function normalizeNodeGeometry(node: NodeData) {
  const x = toFiniteNumber(node.x, 0);
  const y = toFiniteNumber(node.y, 0);
  const width = Math.max(
    MIN_NODE_W,
    toFiniteNumber(node.width, DEFAULT_NODE_W),
  );
  const height = Math.max(
    MIN_NODE_H,
    toFiniteNumber(node.height, DEFAULT_NODE_H),
  );

  return { x, y, width, height };
}

export function normalizeCanvasImageGeometry(image: CanvasImageItem) {
  const x = toFiniteNumber(image.x, 0);
  const y = toFiniteNumber(image.y, 0);
  const width = Math.max(
    PASTED_IMAGE_MIN_SIDE,
    toFiniteNumber(image.width, PASTED_IMAGE_MIN_SIDE),
  );
  const height = Math.max(
    PASTED_IMAGE_MIN_SIDE,
    toFiniteNumber(image.height, PASTED_IMAGE_MIN_SIDE),
  );

  return { x, y, width, height };
}

export function toEditorNode(
  node: NodeData,
  selectedNodeId: NodeId | null,
): EditorNode {
  const geometry = normalizeNodeGeometry(node);
  const markdown = extractNodeMarkdown(node);

  return {
    id: node.id,
    x: geometry.x,
    y: geometry.y,
    width: geometry.width,
    height: geometry.height,
    title: node.label,
    bodyText: toNodePreviewText(markdown),
    accentColor: node.accentColor,
    selected: node.id === selectedNodeId,
  };
}

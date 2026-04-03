import type { NodeData, NodeMarkdownBlock } from "../../types/types";

/** Один елемент масиву = один логічний блок; усередині можуть бути \\n (наприклад fenced code). */
export function descriptionFromBlocks(blocks: NodeMarkdownBlock[]): string {
  return blocks.map((b) => b.text ?? "").join("\n");
}

/**
 * Блоки для UI: з `markdownBlocks` як є, або з `description` (розбиття по \\n) для легасі.
 */
export function deriveMarkdownBlocks(node: NodeData): NodeMarkdownBlock[] {
  if (node.markdownBlocks && node.markdownBlocks.length > 0) {
    return node.markdownBlocks.map((b) => ({
      id: b.id,
      text: b.text ?? "",
    }));
  }
  const raw = node.description ?? "";
  if (!raw) {
    return [{ id: `ln-${node.id}-0`, text: "" }];
  }
  return raw.split("\n").map((text, i) => ({
    id: `ln-${node.id}-${i}`,
    text,
  }));
}

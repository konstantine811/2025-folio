import type { NodeMarkdownBlock } from "../../types/types";
import { newMarkdownBlockId } from "./node-ids";

export type ImportedTextNodeDraft = {
  label: string;
  markdownBlocks: NodeMarkdownBlock[];
  width: number;
  height: number;
};

const NODE_HEADING_RE = /^#\s+(Node\s+\d+\s+[—-]\s+.+)$/gim;
const DEFAULT_LABEL = "Нода з тексту";
const NODE_WIDTH_MIN = 300;
const NODE_WIDTH_MAX = 620;
const NODE_HEIGHT_MIN = 180;
const NODE_HEIGHT_MAX = 760;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function stripFenceLanguage(line: string) {
  return line.replace(/^```[a-z0-9_-]*\s*$/i, "```");
}

function makeMarkdownBlocks(markdown: string): NodeMarkdownBlock[] {
  const normalized = markdown.replace(/\r\n?/g, "\n").trim();
  if (!normalized) {
    return [{ id: newMarkdownBlockId(), text: "" }];
  }

  const blocks: string[] = [];
  let fence: string[] | null = null;

  for (const rawLine of normalized.split("\n")) {
    const line = stripFenceLanguage(rawLine);
    if (line.trim().startsWith("```")) {
      if (fence) {
        fence.push(line);
        blocks.push(fence.join("\n"));
        fence = null;
      } else {
        fence = [line];
      }
      continue;
    }

    if (fence) {
      fence.push(rawLine);
      continue;
    }

    blocks.push(rawLine);
  }

  if (fence) {
    blocks.push(fence.join("\n"));
  }

  const compacted = blocks.filter((block, index, list) => {
    if (block.trim()) return true;
    return list[index - 1]?.trim() && list[index + 1]?.trim();
  });

  return (compacted.length ? compacted : [""]).map((text) => ({
    id: newMarkdownBlockId(),
    text,
  }));
}

function estimateNodeSize(markdown: string) {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const longestLine = lines.reduce(
    (max, line) => Math.max(max, line.trimEnd().length),
    0,
  );
  const codeLineCount = lines.filter((line) => /^\s{2,}|\t|```/.test(line))
    .length;
  const width = clamp(260 + longestLine * 5.2, NODE_WIDTH_MIN, NODE_WIDTH_MAX);
  const height = clamp(
    118 + lines.length * 20 + codeLineCount * 4,
    NODE_HEIGHT_MIN,
    NODE_HEIGHT_MAX,
  );

  return { width, height };
}

function labelFromChunk(chunk: string, fallbackIndex: number) {
  const firstHeading = chunk.match(/^#{1,6}\s+(.+)$/m)?.[1]?.trim();
  if (firstHeading) return firstHeading;

  const firstLine = chunk
    .split("\n")
    .map((line) => line.trim())
    .find(Boolean);

  return firstLine?.slice(0, 72) || `${DEFAULT_LABEL} ${fallbackIndex}`;
}

function splitByNodeHeadings(input: string) {
  const matches = [...input.matchAll(NODE_HEADING_RE)];
  if (matches.length === 0) return null;

  return matches.map((match, index) => {
    const start = match.index ?? 0;
    const nextStart = matches[index + 1]?.index ?? input.length;
    const title = match[1]?.trim() || `${DEFAULT_LABEL} ${index + 1}`;
    const chunk = input.slice(start, nextStart).trim();
    const markdown = chunk.replace(match[0] ?? "", "").trim();
    return { title, markdown };
  });
}

function splitFallback(input: string) {
  return input
    .split(/\n\s*---+\s*\n/g)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk, index) => {
      const title = labelFromChunk(chunk, index + 1);
      const markdown = chunk.replace(/^#{1,6}\s+.+\n?/, "").trim();
      return { title, markdown };
    });
}

export function parseImportedTextNodes(input: string): ImportedTextNodeDraft[] {
  const normalized = input.replace(/\r\n?/g, "\n").trim();
  if (!normalized) return [];

  const chunks = splitByNodeHeadings(normalized) ?? splitFallback(normalized);

  return chunks.map((chunk) => {
    const markdown = chunk.markdown.trim();
    const { width, height } = estimateNodeSize(markdown || chunk.title);

    return {
      label: chunk.title,
      markdownBlocks: makeMarkdownBlocks(markdown),
      width,
      height,
    };
  });
}

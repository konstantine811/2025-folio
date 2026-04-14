import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  quotePlugin,
  thematicBreakPlugin,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import { startTransition, useEffect, useMemo } from "react";
import { descriptionFromBlocks } from "../utils/node-markdown-blocks";
import { newMarkdownBlockId } from "../utils/node-ids";
import { normalizeMultiLineListItems } from "../utils/normalize-list-lines";
import type {
  NodeMarkdownBlock,
  Project,
  ProjectPatchFn,
} from "../../types/types";
import {
  extractNodeMarkdown,
  normalizeCanvasImageGeometry,
  normalizeNodeGeometry,
} from "./shared/types";
import { useEditorStore } from "./store/editorStore";

type SelectionMdxPanelProps = {
  project: Project;
  onProjectPatch: (fn: ProjectPatchFn) => void;
  readOnly?: boolean;
};

const INLINE_MDX_PLUGINS = [
  headingsPlugin(),
  listsPlugin(),
  quotePlugin(),
  thematicBreakPlugin(),
  markdownShortcutPlugin(),
];

function markdownToBlocks(
  markdown: string,
  prevBlocks: NodeMarkdownBlock[] | undefined,
): NodeMarkdownBlock[] {
  const lines = markdown.split("\n");
  const safeLines = lines.length > 0 ? lines : [""];
  return safeLines.map((text, index) => ({
    id: prevBlocks?.[index]?.id ?? newMarkdownBlockId(),
    text,
  }));
}

type ScreenRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

const SelectionMdxPanel = ({
  project,
  onProjectPatch,
  readOnly = false,
}: SelectionMdxPanelProps) => {
  const editingNodeId = useEditorStore((s) => s.editingNodeId);
  const editingCanvasImageId = useEditorStore((s) => s.editingCanvasImageId);
  const viewport = useEditorStore((s) => s.viewport);
  const viewportVersion = useEditorStore((s) => s.viewportVersion);
  const stopEditing = useEditorStore((s) => s.stopEditing);

  const editingNode = useMemo(
    () => project.nodes.find((node) => node.id === editingNodeId) ?? null,
    [project.nodes, editingNodeId],
  );
  const editingCanvasImage = useMemo(
    () =>
      (project.canvasImages ?? []).find(
        (image) => image.id === editingCanvasImageId,
      ) ?? null,
    [project.canvasImages, editingCanvasImageId],
  );

  const editorMarkdown = editingNode
    ? extractNodeMarkdown(editingNode)
    : (editingCanvasImage?.title ?? "");

  const editorKey = editingNode
    ? `node:${editingNode.id}`
    : editingCanvasImage
      ? `image:${editingCanvasImage.id}`
      : null;

  const editorRect = useMemo<ScreenRect | null>(() => {
    if (!viewport) return null;
    if (!editingNode && !editingCanvasImage) return null;

    if (editingNode) {
      const geometry = normalizeNodeGeometry(editingNode);
      const worldLeft = geometry.x + 12;
      const worldTop = geometry.y + 50;
      const worldWidth = Math.max(120, geometry.width - 24);
      const worldHeight = Math.max(56, geometry.height - 62);

      const topLeft = viewport.toScreen(worldLeft, worldTop);
      const bottomRight = viewport.toScreen(
        worldLeft + worldWidth,
        worldTop + worldHeight,
      );

      const width = Math.abs(bottomRight.x - topLeft.x);
      const height = Math.abs(bottomRight.y - topLeft.y);

      if (width < 30 || height < 24) return null;

      return {
        left: Math.min(topLeft.x, bottomRight.x),
        top: Math.min(topLeft.y, bottomRight.y),
        width,
        height,
      };
    }

    const geometry = normalizeCanvasImageGeometry(editingCanvasImage!);
    const worldLeft = geometry.x + 12;
    const worldTop = geometry.y + 50;
    const worldWidth = Math.max(120, geometry.width - 24);
    const worldHeight = Math.min(140, Math.max(56, geometry.height - 62));

    const topLeft = viewport.toScreen(worldLeft, worldTop);
    const bottomRight = viewport.toScreen(
      worldLeft + worldWidth,
      worldTop + worldHeight,
    );

    const width = Math.abs(bottomRight.x - topLeft.x);
    const height = Math.abs(bottomRight.y - topLeft.y);

    if (width < 30 || height < 24) return null;

    return {
      left: Math.min(topLeft.x, bottomRight.x),
      top: Math.min(topLeft.y, bottomRight.y),
      width,
      height,
    };
  }, [viewport, viewportVersion, editingNode, editingCanvasImage]);

  useEffect(() => {
    if (!editorKey || !editorRect) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        stopEditing();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [editorKey, editorRect, stopEditing]);

  if (!editorKey || !editorRect) {
    return null;
  }

  return (
    <div
      className="pointer-events-auto absolute z-[96] overflow-hidden rounded-xl border border-sky-300/35 bg-zinc-950/88 shadow-[0_10px_32px_-12px_rgba(0,0,0,0.7)] backdrop-blur-[1px]"
      style={{
        left: editorRect.left,
        top: editorRect.top,
        width: editorRect.width,
        height: editorRect.height,
      }}
      onPointerDown={(e) => {
        e.stopPropagation();
      }}
    >
      <button
        type="button"
        className="absolute top-1.5 right-1.5 z-[3] rounded bg-zinc-900/80 px-1.5 py-0.5 text-[10px] text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
        onClick={stopEditing}
      >
        x
      </button>
      <div className="h-full overflow-auto bg-zinc-900/85">
        <MDXEditor
          key={editorKey}
          markdown={editorMarkdown}
          readOnly={readOnly}
          spellCheck
          plugins={INLINE_MDX_PLUGINS}
          contentEditableClassName="min-h-full px-2 py-1 text-[12px] leading-[1.45] text-zinc-100 focus:outline-none"
          onChange={(nextMarkdown) => {
            if (readOnly) return;
            const normalized = normalizeMultiLineListItems(nextMarkdown);

            if (editingNode) {
              startTransition(() => {
                onProjectPatch((prev) => ({
                  ...prev,
                  nodes: prev.nodes.map((candidate) => {
                    if (candidate.id !== editingNode.id) return candidate;
                    const nextBlocks = markdownToBlocks(
                      normalized,
                      candidate.markdownBlocks,
                    );
                    return {
                      ...candidate,
                      markdownBlocks: nextBlocks,
                      description: descriptionFromBlocks(nextBlocks),
                    };
                  }),
                }));
              });
              return;
            }

            if (editingCanvasImage) {
              const nextTitle = normalized.trim();
              startTransition(() => {
                onProjectPatch((prev) => ({
                  ...prev,
                  canvasImages: (prev.canvasImages ?? []).map((candidate) =>
                    candidate.id === editingCanvasImage.id
                      ? {
                          ...candidate,
                          title: nextTitle ? normalized : undefined,
                        }
                      : candidate,
                  ),
                }));
              });
            }
          }}
        />
      </div>
    </div>
  );
};

export default SelectionMdxPanel;

import { useEffect } from "react";
import type { Project, ProjectPatchFn } from "../../../types/types";
import { isKeyboardTypingTarget } from "../../utils/canvas-keyboard";

type UseCanvasEditorHotkeysParams = {
  readOnly: boolean;
  selectedNodeId: string | null;
  selectedCanvasImageId: string | null;
  patchWithHistory: (fn: ProjectPatchFn) => void;
  performUndo: () => boolean;
  performRedo: () => boolean;
  fitAllContentInView: () => boolean;
};

type LayerItem = {
  kind: "node" | "canvasImage";
  id: string;
  z: number;
};

function reorderAcrossKinds(
  prev: Project,
  activeNodeId: string | null,
  activeCanvasImageId: string | null,
  delta: -1 | 1,
): Project {
  const nodes = prev.nodes;
  const images = prev.canvasImages ?? [];
  const imageCount = images.length;
  const defaultNodeBase = imageCount;
  const all: LayerItem[] = [
    ...images.map((image, index) => ({
      kind: "canvasImage" as const,
      id: image.id,
      z: image.zIndex ?? index,
    })),
    ...nodes.map((node, index) => ({
      kind: "node" as const,
      id: node.id,
      z: node.zIndex ?? defaultNodeBase + index,
    })),
  ].sort((a, b) => a.z - b.z);

  const activeKind = activeNodeId ? "node" : activeCanvasImageId ? "canvasImage" : null;
  const activeId = activeNodeId ?? activeCanvasImageId;
  if (!activeKind || !activeId || all.length < 2) return prev;

  const from = all.findIndex((item) => item.kind === activeKind && item.id === activeId);
  if (from < 0) return prev;
  const to = Math.max(0, Math.min(all.length - 1, from + delta));
  if (to === from) return prev;

  const reordered = [...all];
  const [moved] = reordered.splice(from, 1);
  reordered.splice(to, 0, moved);

  const zByNodeId = new Map<string, number>();
  const zByImageId = new Map<string, number>();
  for (let i = 0; i < reordered.length; i++) {
    const item = reordered[i]!;
    if (item.kind === "node") zByNodeId.set(item.id, i);
    else zByImageId.set(item.id, i);
  }

  return {
    ...prev,
    nodes: nodes.map((node) => ({
      ...node,
      zIndex: zByNodeId.get(node.id) ?? node.zIndex ?? defaultNodeBase,
    })),
    canvasImages: images.map((image) => ({
      ...image,
      zIndex: zByImageId.get(image.id) ?? image.zIndex ?? 0,
    })),
  };
}

export function useCanvasEditorHotkeys({
  readOnly,
  selectedNodeId,
  selectedCanvasImageId,
  patchWithHistory,
  performUndo,
  performRedo,
  fitAllContentInView,
}: UseCanvasEditorHotkeysParams) {
  useEffect(() => {
    const handleFitHotkey = (event: KeyboardEvent): boolean => {
      if (event.metaKey || event.ctrlKey || event.altKey) return false;
      if (isKeyboardTypingTarget(event.target)) return false;

      const isSlash = event.key === "/" || event.code === "Slash";
      const isBackslash = event.key === "\\" || event.code === "Backslash";
      if (!isSlash && !isBackslash) return false;

      if (!fitAllContentInView()) return false;
      event.preventDefault();
      event.stopPropagation();
      return true;
    };

    const handleHistoryAndReorderHotkeys = (event: KeyboardEvent): boolean => {
      if (readOnly) return false;

      const mod = event.metaKey || event.ctrlKey;
      if (event.altKey) return false;
      if (mod) {
        if (isKeyboardTypingTarget(event.target)) return false;
        if (
          (event.code === "KeyZ" && !event.shiftKey && performUndo()) ||
          (event.code === "KeyZ" && event.shiftKey && performRedo()) ||
          (event.code === "KeyY" && performRedo())
        ) {
          event.preventDefault();
          event.stopPropagation();
          return true;
        }
      }

      if (isKeyboardTypingTarget(event.target)) return false;

      const isBackward = event.key === "[" || event.code === "BracketLeft";
      const isForward = event.key === "]" || event.code === "BracketRight";
      if (!isBackward && !isForward) return false;

      const delta: -1 | 1 = isBackward ? -1 : 1;
      const activeNodeId = selectedNodeId;
      const activeCanvasImageId = selectedCanvasImageId;
      if (!activeNodeId && !activeCanvasImageId) return false;

      event.preventDefault();
      event.stopPropagation();

      patchWithHistory((prev: Project) => {
        return reorderAcrossKinds(
          prev,
          activeNodeId,
          activeCanvasImageId,
          delta,
        );
      });
      return true;
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (handleFitHotkey(event)) return;
      handleHistoryAndReorderHotkeys(event);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    fitAllContentInView,
    patchWithHistory,
    performRedo,
    performUndo,
    readOnly,
    selectedCanvasImageId,
    selectedNodeId,
  ]);
}

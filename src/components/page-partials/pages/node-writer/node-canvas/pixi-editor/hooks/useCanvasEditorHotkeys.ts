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

function moveInArray<T extends { id: string }>(
  list: T[],
  id: string,
  delta: -1 | 1,
): T[] {
  const from = list.findIndex((item) => item.id === id);
  if (from < 0) return list;
  const to = Math.max(0, Math.min(list.length - 1, from + delta));
  if (to === from) return list;
  const next = [...list];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
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
        if (activeNodeId) {
          return {
            ...prev,
            nodes: moveInArray(prev.nodes, activeNodeId, delta),
          };
        }
        if (activeCanvasImageId) {
          return {
            ...prev,
            canvasImages: moveInArray(
              prev.canvasImages ?? [],
              activeCanvasImageId,
              delta,
            ),
          };
        }
        return prev;
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

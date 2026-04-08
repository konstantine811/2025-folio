import type { RefObject } from "react";
import { useEffect, useMemo } from "react";
import { useApplication } from "@pixi/react";
import type { Project, ProjectPatchFn } from "../../types/types";
import { useEditorViewport } from "./hooks/useEditorViewport";
import { useCanvasImagePaste } from "./hooks/useCanvasImagePaste";
import { useDrawCreateSession } from "./hooks/useDrawCreateSession";
import { useInitialProjectFit } from "./hooks/useInitialProjectFit";
import { useLinkKnifeArming } from "./hooks/useLinkKnifeArming";
import { useEditorStore } from "./store/editorStore";
import {
  normalizeCanvasImageGeometry,
  toEditorNode,
} from "./shared/types";
// components
import CanvasImageLayer from "./CanvasImageLayer";
import EditorGrid from "./EditorGrid";
import LinkLayer from "./LinkLayer";
import NodeLayer from "./NodeLayer";

type EditorWorldProps = {
  project: Project;
  onProjectPatch: (fn: ProjectPatchFn) => void;
  readOnly?: boolean;
  shortcutShellRef?: RefObject<HTMLElement | null>;
  isDark?: boolean;
};

export function EditorWorld({
  project,
  onProjectPatch,
  readOnly = false,
  shortcutShellRef,
  isDark = true,
}: EditorWorldProps) {
  const { app } = useApplication();
  const viewport = useEditorViewport();
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId);
  const selectNode = useEditorStore((s) => s.selectNode);
  const selectCanvasImage = useEditorStore((s) => s.selectCanvasImage);
  const clearSelection = useEditorStore((s) => s.clearSelection);
  const nodes = useMemo(
    () => project.nodes.map((node) => toEditorNode(node, selectedNodeId)),
    [project.nodes, selectedNodeId],
  );
  const normalizedCanvasImages = useMemo(
    () =>
      (project.canvasImages ?? []).map((image) => ({
        ...image,
        ...normalizeCanvasImageGeometry(image),
      })),
    [project.canvasImages],
  );

  useEffect(() => {
    clearSelection();
  }, [project.id, clearSelection]);

  const linkKnifeArmedRef = useLinkKnifeArming({ readOnly });
  useInitialProjectFit({ project, viewport });
  useCanvasImagePaste({
    projectId: project.id,
    readOnly,
    viewport,
    shortcutShellRef,
    onProjectPatch,
  });
  const { drawPreviewRect, knifePolygonPreviewPoints, handleGridPointerDown } =
    useDrawCreateSession({
      app,
      viewport,
      readOnly,
      onProjectPatch,
      onSelectNode: selectNode,
      onSelectCanvasImage: selectCanvasImage,
      onClearSelection: clearSelection,
      linkKnifeArmedRef,
    });

  if (!viewport) {
    return null;
  }

  return (
    <>
      <EditorGrid
        key={isDark ? "grid-dark" : "grid-light"}
        viewport={viewport}
        onPointerDown={handleGridPointerDown}
        drawPreviewRect={drawPreviewRect}
        knifePolygonPreviewPoints={knifePolygonPreviewPoints}
        isDark={isDark}
      />
      <LinkLayer
        viewport={viewport}
        nodes={project.nodes}
        links={project.links}
        canvasImages={normalizedCanvasImages}
      />
      <NodeLayer
        viewport={viewport}
        nodes={nodes}
        onProjectPatch={onProjectPatch}
        readOnly={readOnly}
      />
      <CanvasImageLayer
        viewport={viewport}
        canvasImages={normalizedCanvasImages}
        onProjectPatch={onProjectPatch}
        readOnly={readOnly}
      />
    </>
  );
}

export default EditorWorld;

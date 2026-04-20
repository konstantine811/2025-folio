import { Application } from "@pixi/react";
import { useCallback, useRef, type RefObject } from "react";
import type { Project, ProjectPatchFn } from "../../types/types";
import EditorWorld from "./EditorWorld";
import NodeHtmlOverlayLayer from "./NodeHtmlOverlayLayer";
import MinimapOverlay from "./MinimapOverlay";
import { useCanvasEditorHotkeys } from "./hooks/useCanvasEditorHotkeys";
import { useCanvasTouchGestureCapture } from "./hooks/useCanvasTouchGestureCapture";
import { useCanvasWheelCapture } from "./hooks/useCanvasWheelCapture";
import { useMinimapData } from "./hooks/useMinimapData";
import { useProjectHistory } from "./hooks/useProjectHistory";
import { useEditorStore } from "./store/editorStore";
import { collectCanvasContentItems, contentBoundsFromItems, fitViewportToBounds } from "./utils/canvasContent";
import { useThemeStore } from "@/storage/themeStore";
import { ThemeType } from "@/config/theme-colors.config";
import { BreakPoints } from "@/config/adaptive.config";
import { useIsAdoptive } from "@/hooks/useIsAdoptive";
import { isTouchDevice } from "@/utils/touch-inspect";
import "./pixi-extensions";

interface EditorCanvasProps {
  project: Project;
  onProjectPatch: (fn: ProjectPatchFn) => void;
  readOnly?: boolean;
  shortcutShellRef?: RefObject<HTMLElement | null>;
}

const EditorCanvas = ({
  project,
  onProjectPatch,
  readOnly = false,
  shortcutShellRef,
}: EditorCanvasProps) => {
  const touchReadOnlyMode = isTouchDevice;
  const effectiveReadOnly = readOnly || touchReadOnlyMode;
  const selectedTheme = useThemeStore((state) => state.selectedTheme);
  const { isAdoptiveSize: isMobileDevice } = useIsAdoptive(BreakPoints.md);
  const isDark = selectedTheme !== ThemeType.LIGHT;
  const frameRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewport = useEditorStore((s) => s.viewport);
  const bumpViewportVersion = useEditorStore((s) => s.bumpViewportVersion);
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId);
  const selectedCanvasImageId = useEditorStore((s) => s.selectedCanvasImageId);
  const viewportVersion = useEditorStore((s) => s.viewportVersion);
  const { patchWithHistory, performUndo, performRedo } = useProjectHistory({
    project,
    onProjectPatch,
  });

  useCanvasWheelCapture({
    frameRef,
    viewport,
    bumpViewportVersion,
  });
  useCanvasTouchGestureCapture({
    frameRef,
    enabled: touchReadOnlyMode,
  });

  const fitAllContentInView = useCallback(() => {
    if (!viewport) return false;
    const items = collectCanvasContentItems(project);
    const bounds = contentBoundsFromItems(items);
    if (!bounds) return false;

    const didFit = fitViewportToBounds(viewport, bounds, 180);
    if (didFit) bumpViewportVersion();
    return didFit;
  }, [bumpViewportVersion, project.canvasImages, project.nodes, viewport]);

  useCanvasEditorHotkeys({
    readOnly: effectiveReadOnly,
    selectedNodeId,
    selectedCanvasImageId,
    patchWithHistory,
    performUndo,
    performRedo,
    fitAllContentInView,
  });

  const minimap = useMinimapData(project, viewport, viewportVersion);

  return (
    <div
      ref={frameRef}
      className="relative flex min-h-0 min-w-0 flex-1 overflow-hidden bg-background"
      style={{
        maxHeight: `calc(100vh - ${115}px)`,
        overscrollBehavior: touchReadOnlyMode ? "contain" : undefined,
      }}
    >
      <div
        ref={containerRef}
        className="min-h-0 min-w-0 flex-1 overflow-hidden bg-background"
        style={{
          touchAction: touchReadOnlyMode ? "none" : undefined,
          overscrollBehavior: touchReadOnlyMode ? "contain" : undefined,
        }}
      >
        <Application
          resizeTo={containerRef}
          backgroundColor={isDark ? 0x000000 : 0xf8fafc}
          backgroundAlpha={1}
          antialias
          className="block size-full align-top"
        >
          <EditorWorld
            project={project}
            onProjectPatch={patchWithHistory}
            readOnly={effectiveReadOnly}
            shortcutShellRef={shortcutShellRef}
            isDark={isDark}
          />
        </Application>
      </div>
      <NodeHtmlOverlayLayer
        project={project}
        onProjectPatch={patchWithHistory}
        readOnly={effectiveReadOnly}
        touchNavigationMode={touchReadOnlyMode}
        isDark={isDark}
      />
      {minimap ? <MinimapOverlay minimap={minimap} isMobile={isMobileDevice} /> : null}
    </div>
  );
};

export default EditorCanvas;

import { useCallback, useRef } from "react";
import { Crosshair, Info, Minus, Plus } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CANVAS_ZOOM_MAX,
  CANVAS_ZOOM_MIN,
  NODE_CANVAS_HELP_TEXT,
  NODE_CANVAS_HELP_TEXT_VIEW_ONLY,
} from "../node-canvas/constants";
import { useEditableProjectTitle } from "../hooks/use-editable-project-title";
import type { Project, ProjectPatchFn } from "../types/types";
import EditorCanvas from "../node-canvas/pixi-editor/EditorCanvas";
import { isTouchDevice } from "@/utils/touch-inspect";
import { useEditorStore } from "../node-canvas/pixi-editor/store/editorStore";
import {
  collectCanvasContentItems,
  contentBoundsFromItems,
  fitViewportToBounds,
} from "../node-canvas/pixi-editor/utils/canvasContent";

const TOUCH_ZOOM_STEP = 1.25;

interface NodesViewProps {
  project: Project;
  onProjectPatch: (fn: ProjectPatchFn) => void;
  readOnly?: boolean;
}

const NodesView = ({
  project,
  onProjectPatch,
  readOnly = false,
}: NodesViewProps) => {
  const effectiveReadOnly = readOnly || isTouchDevice;
  const shortcutShellRef = useRef<HTMLDivElement>(null);
  const viewport = useEditorStore((s) => s.viewport);
  const bumpViewportVersion = useEditorStore((s) => s.bumpViewportVersion);
  const {
    editingTitle,
    setEditingTitle,
    draftTitle,
    setDraftTitle,
    titleInputRef,
    commitTitle,
  } = useEditableProjectTitle(project.title, onProjectPatch);
  const centerCanvasInView = useCallback(() => {
    if (!viewport) return;

    const items = collectCanvasContentItems(project);
    const bounds = contentBoundsFromItems(items);
    if (bounds) {
      fitViewportToBounds(viewport, bounds, isTouchDevice ? 96 : 180);
    } else {
      viewport.setZoom(1, true);
      viewport.moveCenter(0, 0);
    }
    bumpViewportVersion();
  }, [bumpViewportVersion, project, viewport]);

  const stepZoom = useCallback(
    (direction: 1 | -1) => {
      if (!viewport) return;
      const currentZoom = viewport.scale.x || 1;
      const factor = direction > 0 ? TOUCH_ZOOM_STEP : 1 / TOUCH_ZOOM_STEP;
      const nextZoom = Math.min(
        CANVAS_ZOOM_MAX,
        Math.max(CANVAS_ZOOM_MIN, currentZoom * factor),
      );
      if (nextZoom === currentZoom) return;
      viewport.setZoom(nextZoom, true);
      bumpViewportVersion();
    },
    [bumpViewportVersion, viewport],
  );

  return (
    <div
      ref={shortcutShellRef}
      className="flex min-h-0 w-full flex-1 flex-col overflow-hidden"
    >
      <div className="z-10 flex h-14 shrink-0 items-center justify-between border-b border-border/20 bg-card px-8">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="mono shrink-0 text-[10px] tracking-wide text-primary">
            Документ
          </span>
          {!isTouchDevice ? (
            <Tooltip delayDuration={250}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground -m-1 shrink-0 rounded p-1 transition-colors"
                  aria-label="Інформація про полотно нод"
                >
                  <Info className="size-4" strokeWidth={1.75} />
                </button>
              </TooltipTrigger>
              <TooltipContent
                variant="dark"
                side="bottom"
                align="start"
                sideOffset={6}
                className="mono max-w-md px-3 py-2.5 text-left text-[10px] leading-relaxed font-normal tracking-normal text-balance normal-case"
              >
                {effectiveReadOnly
                  ? NODE_CANVAS_HELP_TEXT_VIEW_ONLY
                  : NODE_CANVAS_HELP_TEXT}
              </TooltipContent>
            </Tooltip>
          ) : null}
          {isTouchDevice ? (
            <button
              type="button"
              onClick={centerCanvasInView}
              disabled={!viewport}
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-border/20 bg-background/40 text-muted-foreground transition-colors active:bg-muted disabled:pointer-events-none disabled:opacity-35"
              aria-label="Центрувати ноди в області перегляду"
              title="Центрувати ноди"
            >
              <Crosshair className="size-4" strokeWidth={1.75} />
            </button>
          ) : null}
          <div className="min-w-0 flex-1">
            {effectiveReadOnly ? (
              <h2 className="truncate text-sm font-medium tracking-normal text-foreground/90">
                {project.title}
              </h2>
            ) : editingTitle ? (
              <input
                ref={titleInputRef}
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                onBlur={commitTitle}
                onKeyDown={(e) => {
                  if (e.code === "Enter" || e.code === "NumpadEnter") {
                    e.preventDefault();
                    commitTitle();
                  }
                }}
                className="w-full min-w-0 border-b border-border/40 bg-transparent py-0.5 text-sm font-medium tracking-normal text-foreground outline-none"
              />
            ) : (
              <h2
                className="cursor-text truncate text-sm font-medium tracking-normal text-foreground/90"
                title="Подвійний клік — перейменувати"
                onDoubleClick={() => setEditingTitle(true)}
              >
                {project.title}
              </h2>
            )}
          </div>
        </div>
        <div className="mono ml-4 shrink-0 text-[8px] tracking-wide text-muted-foreground">
          {effectiveReadOnly ? "Лише перегляд" : "Ноди · звʼязки · текст"}
        </div>
      </div>
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <EditorCanvas
          project={project}
          onProjectPatch={onProjectPatch}
          readOnly={effectiveReadOnly}
          shortcutShellRef={shortcutShellRef}
        />
        {isTouchDevice ? (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-[150] flex justify-center pb-[calc(env(safe-area-inset-bottom)+0.75rem)]"
            aria-hidden={!viewport}
          >
            <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-border/50 bg-card px-1.5 py-1 shadow-[0_8px_24px_rgba(0,0,0,0.45)]">
              <button
                type="button"
                onClick={() => stepZoom(-1)}
                disabled={!viewport}
                className="inline-flex size-9 items-center justify-center rounded-full text-foreground/90 transition-colors active:bg-muted disabled:pointer-events-none disabled:opacity-35"
                aria-label="Зменшити масштаб"
                title="Зменшити"
              >
                <Minus className="size-4" strokeWidth={2} />
              </button>
              <div className="h-5 w-px bg-border/60" aria-hidden />
              <button
                type="button"
                onClick={() => stepZoom(1)}
                disabled={!viewport}
                className="inline-flex size-9 items-center justify-center rounded-full text-foreground/90 transition-colors active:bg-muted disabled:pointer-events-none disabled:opacity-35"
                aria-label="Збільшити масштаб"
                title="Збільшити"
              >
                <Plus className="size-4" strokeWidth={2} />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default NodesView;

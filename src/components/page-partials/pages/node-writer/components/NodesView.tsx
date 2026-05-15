import { useCallback, useMemo, useRef, useState } from "react";
import { Crosshair, FilePlus2, Info, Minus, Plus, X } from "lucide-react";
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
import { parseImportedTextNodes } from "../node-canvas/utils/import-text-nodes";
import { descriptionFromBlocks } from "../node-canvas/utils/node-markdown-blocks";
import { newNodeId } from "../node-canvas/utils/node-ids";

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
  const [isTextImportOpen, setIsTextImportOpen] = useState(false);
  const [textImportDraft, setTextImportDraft] = useState("");
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
  const importedNodeDrafts = useMemo(
    () => parseImportedTextNodes(textImportDraft),
    [textImportDraft],
  );
  const createNodesFromImportedText = useCallback(() => {
    if (effectiveReadOnly || importedNodeDrafts.length === 0) return;

    const gap = 32;
    const totalHeight =
      importedNodeDrafts.reduce((sum, draft) => sum + draft.height, 0) +
      Math.max(0, importedNodeDrafts.length - 1) * gap;
    const center = viewport?.center ?? { x: 120, y: 120 };

    onProjectPatch((prev) => {
      let cursorY = center.y - totalHeight / 2;
      const maxZ = prev.nodes.reduce(
        (max, node, index) => Math.max(max, node.zIndex ?? index),
        0,
      );

      const createdNodes = importedNodeDrafts.map((draft, index) => {
        const node = {
          id: newNodeId(),
          label: draft.label,
          headingLevel:
            prev.nodes.length === 0 && index === 0 ? (1 as const) : (2 as const),
          description: descriptionFromBlocks(draft.markdownBlocks),
          markdownBlocks: draft.markdownBlocks,
          type: "concept" as const,
          x: center.x - draft.width / 2,
          y: cursorY,
          width: draft.width,
          height: draft.height,
          zIndex: maxZ + index + 1,
        };
        cursorY += draft.height + gap;
        return node;
      });

      return {
        ...prev,
        nodes: [...prev.nodes, ...createdNodes],
      };
    });

    setTextImportDraft("");
    setIsTextImportOpen(false);
  }, [effectiveReadOnly, importedNodeDrafts, onProjectPatch, viewport]);

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
        {!effectiveReadOnly ? (
          <button
            type="button"
            onClick={() => setIsTextImportOpen(true)}
            className="ml-3 inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-border/25 bg-background/50 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            aria-label="Створити ноди з тексту"
            title="Створити ноди з тексту"
          >
            <FilePlus2 className="size-4" strokeWidth={1.85} />
          </button>
        ) : null}
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
      {isTextImportOpen ? (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="flex max-h-[86vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-border/30 bg-card shadow-2xl">
            <div className="flex h-12 shrink-0 items-center justify-between border-b border-border/20 px-4">
              <div className="min-w-0">
                <h3 className="truncate text-sm font-medium text-foreground">
                  Створити ноди з тексту
                </h3>
                <p className="mono mt-0.5 text-[9px] text-muted-foreground">
                  Місце старту — центр поточного вигляду canvas
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsTextImportOpen(false)}
                className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Закрити"
              >
                <X className="size-4" strokeWidth={1.85} />
              </button>
            </div>
            <div className="flex min-h-0 flex-1 flex-col gap-3 p-4">
              <textarea
                value={textImportDraft}
                onChange={(event) => setTextImportDraft(event.target.value)}
                autoFocus
                spellCheck={false}
                className="min-h-[340px] flex-1 resize-none rounded-md border border-border/30 bg-background/70 p-3 font-mono text-xs leading-relaxed text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary/45"
                placeholder="Встав текст з блоками # Node 01 — ..."
              />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="mono text-[10px] text-muted-foreground">
                  Буде створено: {importedNodeDrafts.length} нод
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsTextImportOpen(false)}
                    className="inline-flex h-9 items-center rounded-md border border-border/30 px-3 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    Скасувати
                  </button>
                  <button
                    type="button"
                    onClick={createNodesFromImportedText}
                    disabled={importedNodeDrafts.length === 0}
                    className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition-opacity disabled:pointer-events-none disabled:opacity-40"
                  >
                    <FilePlus2 className="size-4" strokeWidth={1.85} />
                    Створити
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default NodesView;

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { NODE_WRITER_WORKSPACE_SCOPE } from "@/config/node-writer-access.config";
import { uploadNodeWriterCanvasPastedFile } from "@/services/firebase/node-writer-workspace";
import type { Project, ProjectPatchFn, Slide, SlideBlock } from "../types/types";
import { PresentationSourcePanel } from "./PresentationSourcePanel";
import { PresentationInspector } from "./PresentationInspector";
import { PresentationSlideTabs } from "./PresentationSlideTabs";
import { SlideBlocksCanvas } from "./SlideBlocksCanvas";
import {
  applyCanvasPlacementToNewBlock,
  collectUsedSourceKeys,
  newEmptySlide,
  normalizeSlide,
  normalizeSlides,
  parseDropPayload,
  payloadToBlock,
  PRESENTATION_DND_MIME,
} from "./presentation-model";

interface PresentationEditorProps {
  project: Project;
  onProjectPatch: (fn: ProjectPatchFn) => void;
  readOnly: boolean;
}

export function PresentationEditor({
  project,
  onProjectPatch,
  readOnly,
}: PresentationEditorProps) {
  const slidesNorm = useMemo(
    () => normalizeSlides(project.slides ?? []),
    [project.slides],
  );

  const usedKeys = useMemo(
    () => collectUsedSourceKeys(project.slides ?? []),
    [project.slides],
  );

  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    if (slidesNorm.length === 0) return;
    setActiveIdx((i) => Math.min(i, slidesNorm.length - 1));
  }, [slidesNorm.length]);

  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  const activeSlide = slidesNorm[activeIdx] ?? slidesNorm[0];
  const activeSlideId = activeSlide?.id;

  useEffect(() => {
    setSelectedBlockId(null);
  }, [activeSlideId]);

  const patchSlide = useCallback(
    (slideId: string, next: Slide) => {
      onProjectPatch((p) => ({
        ...p,
        lastModified: Date.now(),
        slides: (p.slides ?? []).map((s) =>
          s.id === slideId ? normalizeSlide(next) : s,
        ),
      }));
    },
    [onProjectPatch],
  );

  const patchBlock = useCallback(
    (slideId: string, blockId: string, patch: Partial<SlideBlock>) => {
      onProjectPatch((p) => ({
        ...p,
        lastModified: Date.now(),
        slides: (p.slides ?? []).map((s) => {
          if (s.id !== slideId) return s;
          const ns = normalizeSlide(s);
          return {
            ...ns,
            blocks: ns.blocks?.map((b) =>
              b.id === blockId ? ({ ...b, ...patch } as SlideBlock) : b,
            ),
          };
        }),
      }));
    },
    [onProjectPatch],
  );

  const reorderBlock = useCallback(
    (slideId: string, blockId: string, delta: -1 | 1) => {
      onProjectPatch((p) => {
        const si = p.slides?.findIndex((s) => s.id === slideId);
        if (si === undefined || si < 0) return p;
        const s = p.slides![si];
        const ns = normalizeSlide(s);
        const blocks = [...(ns.blocks ?? [])].sort((a, b) => a.order - b.order);
        const i = blocks.findIndex((b) => b.id === blockId);
        if (i < 0) return p;
        const j = i + delta;
        if (j < 0 || j >= blocks.length) return p;
        const swapped = [...blocks];
        [swapped[i], swapped[j]] = [swapped[j], swapped[i]];
        const nextBlocks = swapped.map((b, order) => ({ ...b, order }));
        const nextSlide = { ...ns, blocks: nextBlocks };
        return {
          ...p,
          lastModified: Date.now(),
          slides: p.slides!.map((sl, k) => (k === si ? nextSlide : sl)),
        };
      });
    },
    [onProjectPatch],
  );

  /** Для гостей лише перегляд; для адміна — перемикач «Редагування / Перегляд». */
  const [previewUi, setPreviewUi] = useState(false);
  const effectiveReadOnly = readOnly || previewUi;
  const pasteBusyRef = useRef(false);

  const reorderSlidesByIds = useCallback(
    (orderedIds: string[]) => {
      const curId = slidesNorm[activeIdx]?.id;
      onProjectPatch((p) => {
        const byId = new Map((p.slides ?? []).map((s) => [s.id, s]));
        const next = orderedIds
          .map((id) => byId.get(id))
          .filter(Boolean) as Slide[];
        if (next.length !== orderedIds.length) return p;
        return { ...p, lastModified: Date.now(), slides: next };
      });
      if (curId) {
        const ni = orderedIds.indexOf(curId);
        if (ni >= 0) setActiveIdx(ni);
      }
    },
    [onProjectPatch, slidesNorm, activeIdx],
  );

  const deleteSlideById = useCallback(
    (slideId: string) => {
      const wasIdx = slidesNorm.findIndex((s) => s.id === slideId);
      onProjectPatch((p) => ({
        ...p,
        lastModified: Date.now(),
        slides: (p.slides ?? []).filter((s) => s.id !== slideId),
      }));
      setActiveIdx((idx) => {
        const nextLen = slidesNorm.length - 1;
        if (nextLen <= 0) return 0;
        const deletedActive = wasIdx === idx;
        const deletedBefore = wasIdx >= 0 && wasIdx < idx;
        if (deletedActive) return Math.min(wasIdx, nextLen - 1);
        if (deletedBefore) return Math.max(0, idx - 1);
        return Math.min(idx, nextLen - 1);
      });
      setSelectedBlockId(null);
    },
    [onProjectPatch, slidesNorm],
  );

  useEffect(() => {
    if (effectiveReadOnly || !activeSlideId) return;

    const onPaste = (e: ClipboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el?.closest("textarea, input, [contenteditable=true]")) return;

      let file: File | null = null;
      const files = e.clipboardData?.files;
      if (files?.length) {
        file = Array.from(files).find((f) => f.type.startsWith("image/")) ?? null;
      }
      if (!file && e.clipboardData?.items) {
        for (const item of e.clipboardData.items) {
          if (item.type.startsWith("image/")) {
            const f = item.getAsFile();
            if (f) {
              file = f;
              break;
            }
          }
        }
      }
      if (!file) return;
      e.preventDefault();
      if (pasteBusyRef.current) return;
      pasteBusyRef.current = true;

      const slideId = activeSlideId;

      void (async () => {
        try {
          const storageId = `paste-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
          const url = await uploadNodeWriterCanvasPastedFile(
            NODE_WRITER_WORKSPACE_SCOPE,
            project.id,
            storageId,
            file!,
          );
          onProjectPatch((p) => {
            const slide = p.slides?.find((s) => s.id === slideId);
            if (!slide) return p;
            const ns = normalizeSlide(slide);
            const blocks = [...(ns.blocks ?? [])].sort((a, b) => a.order - b.order);
            const raw = payloadToBlock(
              {
                type: "image-canvas",
                canvasImageId: storageId,
                url,
              },
              blocks.length,
            );
            const block = applyCanvasPlacementToNewBlock(
              ns,
              raw,
              blocks.length,
            );
            const nextSlide = normalizeSlide({
              ...ns,
              blocks: [...blocks, block],
            });
            return {
              ...p,
              lastModified: Date.now(),
              slides: (p.slides ?? []).map((s) =>
                s.id === slideId ? nextSlide : s,
              ),
            };
          });
        } catch (err) {
          console.error("Node Writer: вставка зображення на слайд", err);
        } finally {
          pasteBusyRef.current = false;
        }
      })();
    };

    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [effectiveReadOnly, activeSlideId, project.id, onProjectPatch]);

  useEffect(() => {
    if (!effectiveReadOnly || slidesNorm.length === 0) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest("textarea, input, [contenteditable=true]")) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setActiveIdx((i) => Math.max(0, i - 1));
        setSelectedBlockId(null);
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setActiveIdx((i) => Math.min(slidesNorm.length - 1, i + 1));
        setSelectedBlockId(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [effectiveReadOnly, slidesNorm.length]);

  const addSlide = () => {
    const slide = newEmptySlide();
    onProjectPatch((p) => ({
      ...p,
      lastModified: Date.now(),
      slides: [...(p.slides ?? []), slide],
    }));
    setActiveIdx(slidesNorm.length);
    setSelectedBlockId(null);
  };

  const createFirstSlideFromDrop = (e: React.DragEvent) => {
    if (effectiveReadOnly) return;
    e.preventDefault();
    const raw = e.dataTransfer.getData(PRESENTATION_DND_MIME);
    if (!raw) return;
    const payload = parseDropPayload(raw);
    if (!payload) return;
    const block = payloadToBlock(payload, 0);
    const slide = newEmptySlide();
    onProjectPatch((p) => ({
      ...p,
      lastModified: Date.now(),
      slides: [normalizeSlide({ ...slide, blocks: [block] })],
    }));
    setActiveIdx(0);
    setSelectedBlockId(block.id);
  };

  const onBootstrapDragOver = (e: React.DragEvent) => {
    if (effectiveReadOnly) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const selectedBlock = useMemo(() => {
    if (!activeSlide || !selectedBlockId) return null;
    return (
      activeSlide.blocks?.find((b) => b.id === selectedBlockId) ?? null
    );
  }, [activeSlide, selectedBlockId]);

  if (readOnly && slidesNorm.length === 0) {
    return (
      <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center gap-4 bg-background p-8">
        <p className="mono max-w-md text-center text-[11px] text-muted-foreground">
          Ще немає слайдів у цьому документі.
        </p>
      </div>
    );
  }

  if (!readOnly && slidesNorm.length === 0) {
    return (
      <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-background xl:flex-row xl:items-stretch">
        <PresentationSourcePanel
          nodes={project.nodes}
          canvasImages={project.canvasImages ?? []}
          readOnly={false}
          usedKeys={usedKeys}
        />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center gap-4 p-6">
          <div
            className="flex w-full max-w-xl flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border/30 bg-muted/40 px-6 py-14 text-center"
            onDrop={createFirstSlideFromDrop}
            onDragOver={onBootstrapDragOver}
          >
            <p className="mono max-w-md text-[11px] leading-relaxed text-muted-foreground">
              Перетягніть сюди елемент з лівої панелі — буде створено перший
              слайд. Або натисніть кнопку й додайте блоки пізніше.
            </p>
            <button
              type="button"
              onClick={addSlide}
              className="mono flex items-center gap-2 rounded border border-border/25 bg-muted/60 px-4 py-2 text-[10px] uppercase tracking-widest text-foreground transition-colors hover:bg-muted/80"
            >
              <Plus className="size-3.5" />
              Порожній слайд
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-background xl:flex-row xl:items-stretch">
      <PresentationSourcePanel
        nodes={project.nodes}
        canvasImages={project.canvasImages ?? []}
        readOnly={effectiveReadOnly}
        usedKeys={usedKeys}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border/25 px-3 py-2">
          <PresentationSlideTabs
            slides={slidesNorm}
            activeIdx={activeIdx}
            onActiveIdx={(i) => {
              setActiveIdx(i);
              setSelectedBlockId(null);
            }}
            onReorderSlides={reorderSlidesByIds}
            onAddSlide={addSlide}
            onDeleteSlide={deleteSlideById}
            canEditChrome={!readOnly && !previewUi}
          />
          {!readOnly ? (
            <div className="flex items-center gap-0.5 rounded-md border border-border/20 bg-muted/35 p-0.5">
              <button
                type="button"
                onClick={() => setPreviewUi(false)}
                className={cn(
                  "mono rounded px-2 py-1 text-[9px] uppercase tracking-wide",
                  !previewUi
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                Редагування
              </button>
              <button
                type="button"
                onClick={() => {
                  setPreviewUi(true);
                  setSelectedBlockId(null);
                }}
                className={cn(
                  "mono rounded px-2 py-1 text-[9px] uppercase tracking-wide",
                  previewUi
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                Перегляд
              </button>
            </div>
          ) : null}
          {!effectiveReadOnly ? (
            <div className="flex gap-1">
              <button
                type="button"
                disabled={activeIdx <= 0}
                onClick={() => setActiveIdx((i) => Math.max(0, i - 1))}
                className="mono rounded border border-border/25 px-2 py-1 text-[9px] uppercase text-muted-foreground disabled:opacity-20"
              >
                ←
              </button>
              <button
                type="button"
                disabled={activeIdx >= slidesNorm.length - 1}
                onClick={() =>
                  setActiveIdx((i) => Math.min(slidesNorm.length - 1, i + 1))
                }
                className="mono rounded border border-border/25 px-2 py-1 text-[9px] uppercase text-muted-foreground disabled:opacity-20"
              >
                →
              </button>
            </div>
          ) : null}
        </header>

        {!readOnly && !previewUi ? (
          <div className="shrink-0 border-b border-border/20 px-3 py-2">
            <label className="flex items-center gap-2 text-[10px] text-muted-foreground">
              Назва слайда (у списку)
              <input
                type="text"
                value={activeSlide?.title ?? ""}
                onChange={(e) => {
                  if (!activeSlide) return;
                  patchSlide(activeSlide.id, {
                    ...activeSlide,
                    title: e.target.value,
                  });
                }}
                className="min-w-0 flex-1 rounded border border-input bg-background px-2 py-1 font-sans text-[11px] text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
          </div>
        ) : null}

        {effectiveReadOnly ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center overflow-y-auto overflow-x-hidden px-2 py-2 sm:px-4">
              {activeSlide ? (
                <SlideBlocksCanvas
                  slide={activeSlide}
                  readOnly
                  previewFocus
                  selectedBlockId={selectedBlockId}
                  onSelectBlock={setSelectedBlockId}
                  onChangeSlide={(next) => patchSlide(activeSlide.id, next)}
                />
              ) : null}
            </div>
            {slidesNorm.length > 0 ? (
              <footer className="flex shrink-0 items-center justify-center gap-6 border-t border-border/25 bg-card/80 px-4 py-4 backdrop-blur-sm sm:gap-10 sm:py-5">
                <button
                  type="button"
                  aria-label="Попередній слайд"
                  disabled={activeIdx <= 0}
                  onClick={() => {
                    setActiveIdx((i) => Math.max(0, i - 1));
                    setSelectedBlockId(null);
                  }}
                  className="flex size-12 items-center justify-center rounded-full border border-border/25 bg-muted/70 text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-25 sm:size-14"
                >
                  <ChevronLeft className="size-7 sm:size-8" strokeWidth={1.5} />
                </button>
                <span className="mono min-w-[4.5rem] text-center text-[11px] tabular-nums text-muted-foreground sm:text-xs">
                  {activeIdx + 1} / {slidesNorm.length}
                </span>
                <button
                  type="button"
                  aria-label="Наступний слайд"
                  disabled={activeIdx >= slidesNorm.length - 1}
                  onClick={() => {
                    setActiveIdx((i) =>
                      Math.min(slidesNorm.length - 1, i + 1),
                    );
                    setSelectedBlockId(null);
                  }}
                  className="flex size-12 items-center justify-center rounded-full border border-border/25 bg-muted/70 text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-25 sm:size-14"
                >
                  <ChevronRight className="size-7 sm:size-8" strokeWidth={1.5} />
                </button>
              </footer>
            ) : null}
          </div>
        ) : (
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden px-2 py-2 sm:px-3">
            {activeSlide ? (
              <SlideBlocksCanvas
                slide={activeSlide}
                readOnly={false}
                selectedBlockId={selectedBlockId}
                onSelectBlock={setSelectedBlockId}
                onChangeSlide={(next) => patchSlide(activeSlide.id, next)}
              />
            ) : null}
          </div>
        )}
      </div>

      {activeSlide ? (
        <PresentationInspector
          slide={activeSlide}
          selectedBlock={selectedBlock}
          readOnly={effectiveReadOnly}
          onChangeSlide={(next) => patchSlide(activeSlide.id, next)}
          onChangeBlock={(blockId, patch) =>
            patchBlock(activeSlide.id, blockId, patch)
          }
          onReorderBlock={(blockId, delta) =>
            reorderBlock(activeSlide.id, blockId, delta)
          }
        />
      ) : null}
    </div>
  );
}

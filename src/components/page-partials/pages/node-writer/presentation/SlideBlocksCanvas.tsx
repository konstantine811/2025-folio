import { useMemo, type MouseEvent, type ReactNode } from "react";
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  Slide,
  SlideBlock,
  SlideBlockAnimationTiming,
  SlideFontPreset,
  SlideLayoutMode,
  SlideTextAlign,
} from "../types/types";
import {
  applyCanvasPlacementToNewBlock,
  DEFAULT_BODY_TEXT_SCALE,
  DEFAULT_HEADING_SCALE,
  entranceClass,
  parseDropPayload,
  payloadToBlock,
  PRESENTATION_DND_MIME,
} from "./presentation-model";

function headingBaseRem(slide: Slide): number {
  const h = slide.blocks?.find((b) => b.kind === "heading");
  if (h && h.kind === "heading") {
    return 2.5 * (h.scale ?? DEFAULT_HEADING_SCALE);
  }
  return 2.5;
}

function headingPresetClass(preset?: SlideFontPreset): string {
  switch (preset) {
    case "sans":
      return "font-sans font-bold tracking-tight text-foreground";
    case "serif":
      return "font-serif font-bold text-foreground";
    case "mono":
      return "font-mono font-bold uppercase tracking-tight text-foreground";
    case "theme":
    default:
      return "font-black uppercase italic leading-tight tracking-tighter text-foreground";
  }
}

function textPresetClass(preset?: SlideFontPreset): string {
  switch (preset) {
    case "sans":
      return "font-sans text-foreground/90";
    case "serif":
      return "font-serif text-foreground/90";
    case "mono":
      return "font-mono text-foreground/90";
    case "theme":
    default:
      return "font-sans text-foreground/85";
  }
}

function textAlignClass(a?: SlideTextAlign): string {
  if (a === "right") return "text-right";
  if (a === "center") return "text-center";
  return "text-left";
}

function SlideBlockBody({
  block,
  slide,
}: {
  block: SlideBlock;
  slide: Slide;
}) {
  const baseRem = headingBaseRem(slide);
  const ta = textAlignClass(
    block.kind === "heading" || block.kind === "text"
      ? block.textAlign
      : undefined,
  );

  if (block.kind === "heading") {
    const fs = baseRem * (block.scale ?? DEFAULT_HEADING_SCALE);
    return (
      <h2
        className={cn(headingPresetClass(block.fontPreset), ta)}
        style={{ fontSize: `${fs}rem` }}
      >
        {block.text}
      </h2>
    );
  }
  if (block.kind === "text") {
    const rel = block.scale ?? DEFAULT_BODY_TEXT_SCALE;
    const fs = baseRem * rel;
    return (
      <p
        className={cn(
          "whitespace-pre-wrap",
          textPresetClass(block.fontPreset),
          ta,
        )}
        style={{ fontSize: `${fs}rem`, lineHeight: 1.45 }}
      >
        {block.text}
      </p>
    );
  }
  const w = block.widthPct;
  return (
    <figure
      className="space-y-2"
      style={
        w != null
          ? { width: `${w}%`, maxWidth: "100%", marginLeft: "auto", marginRight: "auto" }
          : undefined
      }
    >
      <img
        src={block.url}
        alt=""
        className="max-h-[min(50vh,420px)] w-full max-w-full rounded-lg object-contain"
        draggable={false}
      />
      {block.caption ? (
        <figcaption className="text-center text-[10px] text-muted-foreground">
          {block.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

function animWrap(
  block: SlideBlock,
  timing: SlideBlockAnimationTiming,
  index: number,
  children: ReactNode,
) {
  const delayMs = timing === "sequential" ? index * 130 : 0;
  const anim = entranceClass(block.entrance);
  const animCls =
    block.entrance === "none" || !anim
      ? ""
      : cn("animate-in duration-500 fill-mode-both", anim);
  return (
    <div className={animCls} style={{ animationDelay: `${delayMs}ms` }}>
      {children}
    </div>
  );
}

function SlideBlockPreview({
  block,
  slide,
  timing,
  index,
  layout,
}: {
  block: SlideBlock;
  slide: Slide;
  timing: SlideBlockAnimationTiming;
  index: number;
  layout: SlideLayoutMode;
}) {
  const inner = animWrap(block, timing, index, (
    <SlideBlockBody block={block} slide={slide} />
  ));
  if (layout === "canvas") {
    const left = block.leftPct ?? 50;
    const top = block.topPct ?? 50;
    const w = block.widthPct;
    return (
      <div
        data-nw-slide-block
        className="pointer-events-none"
        style={{
          position: "absolute",
          left: `${left}%`,
          top: `${top}%`,
          transform: "translate(-50%, -50%)",
          width: w != null ? `${w}%` : undefined,
          maxWidth: w == null ? "min(92%, 42rem)" : "100%",
          zIndex: index + 1,
        }}
      >
        {inner}
      </div>
    );
  }
  return <div data-nw-slide-block>{inner}</div>;
}

function CanvasSlideBlock({
  block,
  slide,
  timing,
  index,
  selected,
  onSelect,
  onDelete,
}: {
  block: SlideBlock;
  slide: Slide;
  timing: SlideBlockAnimationTiming;
  index: number;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const left = block.leftPct ?? 50;
  const top = block.topPct ?? 50;
  const w = block.widthPct;
  const inner = animWrap(
    block,
    timing,
    index,
    <>
      <div className="mb-2 flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          className="rounded p-1 text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
          aria-label="Видалити блок"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="size-4" />
        </button>
      </div>
      <button
        type="button"
        className="w-full cursor-pointer text-left"
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        <SlideBlockBody block={block} slide={slide} />
      </button>
    </>,
  );

  return (
    <div
      data-nw-slide-block
      style={{
        position: "absolute",
        left: `${left}%`,
        top: `${top}%`,
        transform: "translate(-50%, -50%)",
        width: w != null ? `${w}%` : undefined,
        maxWidth: w == null ? "min(92%, 42rem)" : "100%",
        zIndex: index + 1,
      }}
      className={cn(
        "group pointer-events-auto rounded-lg border border-transparent p-2 transition-colors",
        selected && "border-border/25 bg-primary/5 ring-1 ring-primary/15",
        "hover:border-border/20",
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {inner}
    </div>
  );
}

function SortableSlideBlock({
  block,
  slide,
  timing,
  index,
  selected,
  onSelect,
  onDelete,
}: {
  block: SlideBlock;
  slide: Slide;
  timing: SlideBlockAnimationTiming;
  index: number;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const sortStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.55 : 1,
  };

  const inner = animWrap(
    block,
    timing,
    index,
    <>
      <div className="mb-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          className="cursor-grab touch-none rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground active:cursor-grabbing"
          aria-label="Перемістити"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>
        <button
          type="button"
          className="rounded p-1 text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
          aria-label="Видалити блок"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="size-4" />
        </button>
      </div>
      <button
        type="button"
        className="w-full cursor-pointer text-left"
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        <SlideBlockBody block={block} slide={slide} />
      </button>
    </>,
  );

  return (
    <div
      ref={setNodeRef}
      data-nw-slide-block
      style={sortStyle}
      className={cn(
        "group relative rounded-lg border border-transparent p-2 transition-colors",
        selected && "border-border/25 bg-primary/5 ring-1 ring-primary/15",
        "hover:border-border/20",
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {inner}
    </div>
  );
}

interface SlideBlocksCanvasProps {
  slide: Slide;
  readOnly: boolean;
  /** Режим перегляду: слайд на всю доступну висоту по центру. */
  previewFocus?: boolean;
  selectedBlockId: string | null;
  onSelectBlock: (id: string | null) => void;
  onChangeSlide: (next: Slide) => void;
}

export function SlideBlocksCanvas({
  slide,
  readOnly,
  previewFocus = false,
  selectedBlockId,
  onSelectBlock,
  onChangeSlide,
}: SlideBlocksCanvasProps) {
  const layout: SlideLayoutMode = slide.slideLayout ?? "stack";
  const blocks = useMemo(
    () => [...(slide.blocks ?? [])].sort((a, b) => a.order - b.order),
    [slide.blocks],
  );
  const timing = slide.blockAnimationTiming ?? "sequential";
  const previewReadOnly = readOnly && previewFocus;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = blocks.map((b) => b.id);
    const oldIndex = ids.indexOf(active.id as string);
    const newIndex = ids.indexOf(over.id as string);
    if (oldIndex < 0 || newIndex < 0) return;
    const nextIds = arrayMove(ids, oldIndex, newIndex);
    const nextBlocks = nextIds.map((id, i) => {
      const b = blocks.find((x) => x.id === id)!;
      return { ...b, order: i };
    });
    onChangeSlide({ ...slide, blocks: nextBlocks });
  };

  const removeBlock = (id: string) => {
    const next = blocks
      .filter((b) => b.id !== id)
      .map((b, i) => ({ ...b, order: i }));
    onChangeSlide({ ...slide, blocks: next });
    if (selectedBlockId === id) onSelectBlock(null);
  };

  const onNativeDrop = (e: React.DragEvent) => {
    if (readOnly) return;
    e.preventDefault();
    e.stopPropagation();
    const raw = e.dataTransfer.getData(PRESENTATION_DND_MIME);
    if (!raw) return;
    const payload = parseDropPayload(raw);
    if (!payload) return;
    const rawBlock = payloadToBlock(payload, blocks.length);
    const block = applyCanvasPlacementToNewBlock(
      slide,
      rawBlock,
      blocks.length,
    );
    onChangeSlide({
      ...slide,
      blocks: [...blocks, block],
    });
  };

  const onNativeDragOver = (e: React.DragEvent) => {
    if (readOnly) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const emptyHint = (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <p className="max-w-sm text-[11px] leading-relaxed text-muted-foreground">
        Перетягніть сюди елементи з лівої панелі.
      </p>
    </div>
  );

  /** Поверхня слайда 16:9 — по центру колонки, без фону та обводки (лише контент). */
  const slideSurface =
    "relative mx-auto box-border min-h-0 w-[min(100%,min(96vw,1280px))] shrink-0 overflow-hidden rounded-xl p-4 md:p-6 aspect-video min-h-[min(70vh,560px)] max-h-[min(85vh,720px)]";

  const slideSurfacePreview =
    "relative mx-auto box-border min-h-0 w-[min(100%,min(96vw,1600px))] shrink-0 overflow-hidden rounded-xl p-4 md:p-6 aspect-video max-h-[min(78vh,calc(92vw*9/16))]";

  const renderReadonlyStack = () => (
    <div
      className={cn(
        "mx-auto w-full space-y-8",
        previewReadOnly
          ? "mx-auto min-h-0 w-full max-w-[min(96vw,1280px)] flex-1 overflow-y-auto overflow-x-hidden px-2 py-6 md:px-4 md:py-10"
          : "max-w-4xl",
      )}
    >
      {blocks.map((block, index) => (
        <SlideBlockPreview
          key={block.id}
          block={block}
          slide={slide}
          timing={timing}
          index={index}
          layout="stack"
        />
      ))}
    </div>
  );

  const renderReadonlyCanvas = () => (
    <div className="flex min-h-0 w-full min-w-0 max-w-full flex-1 flex-col items-center justify-center overflow-hidden">
      <div className={previewReadOnly ? slideSurfacePreview : slideSurface}>
        {blocks.map((block, index) => (
          <SlideBlockPreview
            key={block.id}
            block={block}
            slide={slide}
            timing={timing}
            index={index}
            layout="canvas"
          />
        ))}
      </div>
    </div>
  );

  const renderEditStack = () => (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={blocks.map((b) => b.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="relative z-10 mx-auto w-full max-w-4xl space-y-4 rounded-xl border border-border/15 bg-card/90 p-6 shadow-sm ring-1 ring-border/10 md:p-10">
          {blocks.map((block, index) => (
            <SortableSlideBlock
              key={block.id}
              block={block}
              slide={slide}
              timing={timing}
              index={index}
              selected={selectedBlockId === block.id}
              onSelect={() => onSelectBlock(block.id)}
              onDelete={() => removeBlock(block.id)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );

  const renderEditCanvas = () => (
    <div className="flex min-h-0 w-full min-w-0 max-w-full flex-1 flex-col items-center justify-center overflow-hidden">
      <div className={slideSurface}>
        {blocks.map((block, index) => (
          <CanvasSlideBlock
            key={block.id}
            block={block}
            slide={slide}
            timing={timing}
            index={index}
            selected={selectedBlockId === block.id}
            onSelect={() => onSelectBlock(block.id)}
            onDelete={() => removeBlock(block.id)}
          />
        ))}
      </div>
    </div>
  );

  const clearSelectionIfBackdrop = (e: MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("[data-nw-slide-block]")) return;
    onSelectBlock(null);
  };

  const rootClass = cn(
    "relative flex min-h-0 min-w-0 w-full max-w-full flex-col self-stretch",
    previewReadOnly ? "shrink-0" : "flex-1",
    layout === "stack"
      ? previewReadOnly
        ? "overflow-x-hidden overflow-y-visible"
        : "overflow-y-auto overflow-x-hidden"
      : "overflow-hidden",
  );

  return (
    <div
      className={rootClass}
      onDrop={onNativeDrop}
      onDragOver={onNativeDragOver}
      onClick={clearSelectionIfBackdrop}
    >
      {blocks.length === 0 ? (
        emptyHint
      ) : readOnly ? (
        layout === "canvas" ? (
          renderReadonlyCanvas()
        ) : (
          renderReadonlyStack()
        )
      ) : layout === "canvas" ? (
        renderEditCanvas()
      ) : (
        renderEditStack()
      )}
    </div>
  );
}

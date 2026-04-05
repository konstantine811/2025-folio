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
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Slide } from "../types/types";

function SortableSlideTab({
  slide,
  index,
  active,
  onActivate,
  showDrag,
}: {
  slide: Slide;
  index: number;
  active: boolean;
  onActivate: () => void;
  showDrag: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: slide.id, disabled: !showDrag });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.65 : 1,
    zIndex: isDragging ? 20 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex max-w-[10rem] items-center gap-0.5"
    >
      {showDrag ? (
        <button
          type="button"
          className="shrink-0 cursor-grab rounded p-0.5 text-muted-foreground/60 hover:text-foreground active:cursor-grabbing"
          aria-label="Перетягнути слайд"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-3.5" />
        </button>
      ) : null}
      <button
        type="button"
        onClick={onActivate}
        className={cn(
          "mono min-w-0 flex-1 truncate rounded px-2 py-1 text-[10px] uppercase tracking-wide transition-colors",
          active
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        {slide.title?.trim() || `Слайд ${index + 1}`}
      </button>
    </div>
  );
}

interface PresentationSlideTabsProps {
  slides: Slide[];
  activeIdx: number;
  onActiveIdx: (idx: number) => void;
  onReorderSlides: (slideIdsOrdered: string[]) => void;
  onAddSlide: () => void;
  onDeleteSlide: (slideId: string) => void;
  canEditChrome: boolean;
}

export function PresentationSlideTabs({
  slides,
  activeIdx,
  onActiveIdx,
  onReorderSlides,
  onAddSlide,
  onDeleteSlide,
  canEditChrome,
}: PresentationSlideTabsProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = slides.map((s) => s.id);
    const oldIndex = ids.indexOf(active.id as string);
    const newIndex = ids.indexOf(over.id as string);
    if (oldIndex < 0 || newIndex < 0) return;
    onReorderSlides(arrayMove(ids, oldIndex, newIndex));
  };

  const activeSlide = slides[activeIdx];
  const showDrag = canEditChrome && slides.length > 1;

  const readOnlyTabs = slides.map((s, i) => (
    <button
      key={s.id}
      type="button"
      onClick={() => onActiveIdx(i)}
      className={cn(
        "mono max-w-[10rem] truncate rounded px-2 py-1 text-[10px] uppercase tracking-wide transition-colors",
        i === activeIdx
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {s.title?.trim() || `Слайд ${i + 1}`}
    </button>
  ));

  return (
    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-1 gap-y-1 overflow-auto">
      {canEditChrome ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={slides.map((s) => s.id)}
            strategy={horizontalListSortingStrategy}
          >
            {slides.map((s, i) => (
              <SortableSlideTab
                key={s.id}
                slide={s}
                index={i}
                active={i === activeIdx}
                onActivate={() => onActiveIdx(i)}
                showDrag={showDrag}
              />
            ))}
          </SortableContext>
        </DndContext>
      ) : (
        readOnlyTabs
      )}
      {canEditChrome ? (
        <button
          type="button"
          onClick={onAddSlide}
          className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          title="Новий слайд"
        >
          <Plus className="size-4" />
        </button>
      ) : null}
      {canEditChrome && activeSlide ? (
        <button
          type="button"
          onClick={() => {
            if (
              typeof window !== "undefined" &&
              !window.confirm("Видалити цей слайд?")
            ) {
              return;
            }
            onDeleteSlide(activeSlide.id);
          }}
          className="rounded p-1 text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
          title="Видалити слайд"
        >
          <Trash2 className="size-4" />
        </button>
      ) : null}
    </div>
  );
}

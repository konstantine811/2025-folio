import type { CSSProperties } from "react";
import type { CanvasImageItem, NodePort } from "../../types/types";
import { PORT_LABELS } from "../constants";

const EDGES: NodePort[] = ["n", "e", "s", "w"];

function edgeStyle(edge: NodePort): CSSProperties {
  switch (edge) {
    case "e":
      return { top: "50%", right: 0 };
    case "w":
      return { top: "50%", left: 0 };
    case "n":
      return { left: "50%", top: 0 };
    case "s":
      return { left: "50%", bottom: 0 };
  }
}

function edgeTransformClass(edge: NodePort): string {
  switch (edge) {
    case "e":
      return "translate-x-1/2 -translate-y-1/2";
    case "w":
      return "-translate-x-1/2 -translate-y-1/2";
    case "n":
      return "-translate-x-1/2 -translate-y-1/2";
    case "s":
      return "-translate-x-1/2 translate-y-1/2";
  }
}

interface CanvasImageCardProps {
  image: CanvasImageItem;
  zIndex: number;
  wireDragging: boolean;
  onStartWireFromEdge: (
    e: React.PointerEvent,
    imageId: string,
    edge: NodePort,
  ) => void;
  onDragPointerDown: (e: React.PointerEvent, image: CanvasImageItem) => void;
  onDragPointerMove: (e: React.PointerEvent) => void;
  onDragPointerUp: (e: React.PointerEvent) => void;
  onResizePointerDown: (e: React.PointerEvent, image: CanvasImageItem) => void;
  onTitleChange: (id: string, title: string) => void;
  onRemove: (id: string) => void;
}

export function CanvasImageCard({
  image,
  zIndex,
  wireDragging,
  onStartWireFromEdge,
  onDragPointerDown,
  onDragPointerMove,
  onDragPointerUp,
  onResizePointerDown,
  onTitleChange,
  onRemove,
}: CanvasImageCardProps) {
  const { id, x, y, width, height, url, title } = image;

  return (
    <div
      data-canvas-image-id={id}
      style={{
        left: x,
        top: y,
        width,
        height,
        zIndex,
      }}
      className="pointer-events-auto group/canvas-img absolute flex flex-col overflow-visible border border-border/20 bg-card/90 shadow-sm backdrop-blur-sm"
    >
      {EDGES.map((edge) => (
        <button
          key={edge}
          type="button"
          data-canvas-image-id={id}
          data-link-port={edge}
          title={`Звʼязок · ${PORT_LABELS[edge]}`}
          style={edgeStyle(edge)}
          className={`absolute z-[45] flex h-5 min-w-5 cursor-crosshair touch-manipulation items-center justify-center rounded-full border border-border/40 bg-primary/90 text-[8px] font-bold text-primary-foreground shadow-sm transition-opacity ${edgeTransformClass(edge)} ${
            wireDragging
              ? "opacity-100"
              : "opacity-0 group-hover/canvas-img:opacity-100"
          }`}
          onPointerDown={(e) => onStartWireFromEdge(e, id, edge)}
        >
          ·
        </button>
      ))}

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex min-h-0 shrink-0 items-stretch gap-0 border-b border-border/15">
          <div
            title="Перетягнути"
            className="flex w-7 shrink-0 cursor-grab touch-none items-center justify-center border-r border-border/15 bg-muted/30 text-[10px] text-muted-foreground active:cursor-grabbing"
            onPointerDown={(e) => onDragPointerDown(e, image)}
            onPointerMove={onDragPointerMove}
            onPointerUp={onDragPointerUp}
            onPointerCancel={onDragPointerUp}
          >
            ⋮⋮
          </div>
          <div className="flex min-w-0 flex-1 items-center justify-between gap-1 py-1 pr-2 pl-1">
            <input
              value={title ?? ""}
              onChange={(e) => onTitleChange(id, e.target.value)}
              placeholder="Заголовок"
              className="min-w-0 flex-1 bg-transparent px-1 py-0.5 text-[11px] font-semibold tracking-tight text-foreground outline-none placeholder:text-muted-foreground/50"
              onPointerDown={(e) => e.stopPropagation()}
            />
            <button
              type="button"
              title="Прибрати зображення"
              className="mono shrink-0 px-1.5 py-0.5 text-[10px] text-muted-foreground hover:text-destructive"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onRemove(id);
              }}
            >
              ×
            </button>
          </div>
        </div>
        <div className="relative min-h-0 flex-1 overflow-hidden p-1">
          <img
            src={url}
            alt=""
            draggable={false}
            className="pointer-events-none mx-auto block h-full max-h-full w-full max-w-full object-contain select-none"
          />
        </div>
      </div>

      <div
        role="separator"
        aria-hidden
        title="Змінити розмір"
        className="absolute right-0 bottom-0 z-[50] h-4 w-4 cursor-nwse-resize touch-manipulation border-t border-l border-border/25 bg-muted/40 hover:border-border/45 hover:bg-muted/60"
        onPointerDown={(e) => onResizePointerDown(e, image)}
      />
    </div>
  );
}

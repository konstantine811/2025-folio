import type { CSSProperties } from "react";
import type { CanvasImageItem, NodePort } from "../../types/types";
import { NODE_PORT_EDGE_INSET, NODE_PORT_HANDLE_PX, PORT_LABELS } from "../constants";

const EDGES: NodePort[] = ["n", "e", "s", "w"];

/** Світіння позаду image-ноди (cyan / sky). */
const IMAGE_NODE_REAR_GLOW: CSSProperties = {
  background:
    "radial-gradient(ellipse 78% 72% at 70% 22%, rgba(56,189,248,0.38) 0%, transparent 58%), radial-gradient(ellipse 68% 58% at 22% 78%, rgba(34,211,238,0.22) 0%, transparent 52%)",
};

const IMAGE_CARD_OUTER =
  "rounded-[1.75rem] border border-white/10 bg-[#0a0a0a] shadow-[0_12px_48px_-16px_rgba(0,0,0,0.75)]";

const IMAGE_CARD_OUTER_HOVER =
  "hover:border-sky-400/25 hover:shadow-[0_0_40px_-12px_rgba(56,189,248,0.25)]";

const IMAGE_INNER_FRAME =
  "rounded-xl border border-white/[0.06] bg-[#09090b] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]";

/** Порти зображення — синій «канал». */
const IMAGE_PORT_HANDLE =
  "border-sky-400/80 bg-sky-400 text-sky-950 shadow-[0_0_10px_rgba(56,189,248,0.45)]";

function edgeStyle(edge: NodePort): CSSProperties {
  const d = NODE_PORT_EDGE_INSET;
  switch (edge) {
    case "e":
      return { top: "50%", right: d, transform: "translateY(-50%)" };
    case "w":
      return { top: "50%", left: d, transform: "translateY(-50%)" };
    case "n":
      return { left: "50%", top: d, transform: "translateX(-50%)" };
    case "s":
      return { left: "50%", bottom: d, transform: "translateX(-50%)" };
  }
}

interface CanvasImageCardProps {
  /** Лише перегляд: без перетягування, портів і заголовка. */
  readOnly?: boolean;
  /** Синій індикатор у шапці — лише якщо зображення бере участь у хоча б одному звʼязку. */
  linked?: boolean;
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
  /** Підсвітка порту під час ведення звʼязку. */
  highlightDropPort?: NodePort | null;
  /** Якщо false — з цим зображенням вже є звʼязок; червона обводка порту. */
  highlightDropAllowed?: boolean;
}

function ImageHeaderDot() {
  return (
    <span
      aria-hidden
      className="h-2 w-2 shrink-0 rounded-full bg-sky-400 shadow-[0_0_14px_rgba(56,189,248,0.65)] ring-1 ring-sky-300/40"
    />
  );
}

export function CanvasImageCard({
  readOnly = false,
  linked = false,
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
  highlightDropPort = null,
  highlightDropAllowed = true,
}: CanvasImageCardProps) {
  const { id, x, y, width, height, url, title } = image;

  if (readOnly) {
    return (
      <div
        data-canvas-image-id={id}
        style={{ left: x, top: y, width, height, zIndex }}
        className="pointer-events-none absolute isolate overflow-hidden"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-5 -z-10 rounded-[2rem] opacity-[0.85] blur-2xl"
          style={IMAGE_NODE_REAR_GLOW}
        />
        <div
          className={`relative flex h-full min-h-0 flex-col overflow-hidden ${IMAGE_CARD_OUTER}`}
        >
          <div className="flex shrink-0 items-center gap-2 border-b border-white/[0.07] px-3 py-2.5">
            {linked ? (
              <ImageHeaderDot />
            ) : (
              <span className="h-2 w-2 shrink-0" aria-hidden />
            )}
            <span className="min-w-0 truncate font-sans text-sm font-normal normal-case text-zinc-400">
              {(title?.trim() || "image").toLowerCase()}
            </span>
          </div>
          <div className={`mx-2 mb-2 mt-2 flex min-h-0 flex-1 flex-col overflow-hidden p-1.5 ${IMAGE_INNER_FRAME}`}>
            <div className="relative min-h-0 flex-1 overflow-hidden rounded-lg">
              <img
                src={url}
                alt={title?.trim() || ""}
                draggable={false}
                className="pointer-events-none h-full w-full select-none rounded-lg object-cover"
              />
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-[38%] rounded-b-lg bg-gradient-to-t from-black/65 via-black/20 to-transparent"
                aria-hidden
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      data-canvas-image-id={id}
      style={{ left: x, top: y, width, height, zIndex }}
      className="pointer-events-auto group/canvas-img absolute isolate overflow-visible"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-5 -z-10 rounded-[2rem] opacity-[0.85] blur-2xl"
        style={IMAGE_NODE_REAR_GLOW}
      />
      <div
        className={`relative flex h-full min-h-0 flex-col overflow-visible transition-[border-color,box-shadow] ${IMAGE_CARD_OUTER} ${IMAGE_CARD_OUTER_HOVER}`}
      >
        {EDGES.map((edge) => (
          <button
            key={edge}
            type="button"
            data-canvas-image-id={id}
            data-link-port={edge}
            title={`Звʼязок · ${PORT_LABELS[edge]}`}
            className={`absolute z-[45] flex cursor-crosshair touch-manipulation items-center justify-center rounded-full border border-solid p-0 text-[6px] font-bold leading-none transition-all ${IMAGE_PORT_HANDLE} ${
              highlightDropPort === edge
                ? highlightDropAllowed
                  ? "z-[55] scale-110 opacity-100 ring-2 ring-white/95 ring-offset-2 ring-offset-zinc-950"
                  : "z-[55] scale-110 opacity-100 ring-2 ring-red-500 ring-offset-2 ring-offset-zinc-950 shadow-[0_0_12px_rgba(239,68,68,0.55)]"
                : wireDragging
                  ? "opacity-100"
                  : "opacity-0 group-hover/canvas-img:opacity-100"
            } hover:scale-110`}
            style={{
              ...edgeStyle(edge),
              width: NODE_PORT_HANDLE_PX,
              minWidth: NODE_PORT_HANDLE_PX,
              height: NODE_PORT_HANDLE_PX,
            }}
            onPointerDown={(e) => onStartWireFromEdge(e, id, edge)}
          >
            ·
          </button>
        ))}

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="flex min-h-0 shrink-0 items-stretch gap-0 border-b border-white/[0.07]">
            <div
              title="Перетягнути"
              className="flex w-7 shrink-0 cursor-grab touch-none items-center justify-center border-r border-white/[0.07] bg-white/[0.03] text-[10px] text-zinc-500 active:cursor-grabbing"
              onPointerDown={(e) => onDragPointerDown(e, image)}
              onPointerMove={onDragPointerMove}
              onPointerUp={onDragPointerUp}
              onPointerCancel={onDragPointerUp}
            >
              ⋮⋮
            </div>
            <div className="flex min-w-0 flex-1 items-center gap-2 py-2 pr-2 pl-2">
              {linked ? (
                <ImageHeaderDot />
              ) : (
                <span className="h-2 w-2 shrink-0" aria-hidden />
              )}
              <input
                value={title ?? ""}
                onChange={(e) => onTitleChange(id, e.target.value)}
                placeholder="image"
                className="min-w-0 flex-1 bg-transparent font-sans text-sm font-normal normal-case text-zinc-300 outline-none placeholder:text-zinc-500 placeholder:normal-case"
                onPointerDown={(e) => e.stopPropagation()}
              />
              <button
                type="button"
                title="Прибрати зображення"
                className="shrink-0 px-1.5 py-0.5 font-sans text-xs text-zinc-500 transition-colors hover:text-red-400"
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

          <div
            className={`mx-2 mb-2 mt-2 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-1.5 ${IMAGE_INNER_FRAME}`}
          >
            <div className="relative min-h-0 flex-1 overflow-hidden rounded-lg">
              <img
                src={url}
                alt=""
                draggable={false}
                className="pointer-events-none h-full w-full select-none rounded-lg object-cover"
              />
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-[38%] rounded-b-lg bg-gradient-to-t from-black/65 via-black/20 to-transparent"
                aria-hidden
              />
            </div>
          </div>
        </div>
      </div>

      <div
        role="separator"
        aria-hidden
        title="Змінити розмір"
        className="absolute right-0 bottom-0 z-[50] h-4 w-4 cursor-nwse-resize touch-manipulation border-t border-l border-solid border-white/15 bg-white/[0.06] hover:border-white/25 hover:bg-white/10"
        onPointerDown={(e) => onResizePointerDown(e, image)}
      />
    </div>
  );
}

import type { PointerEvent as ReactPointerEvent } from "react";
import type { Viewport } from "pixi-viewport";
import { MarkdownResolvingImg } from "../components/MarkdownResolvingImg";
import { NODE_PORT_HANDLE_PX } from "../constants";
import type {
  CanvasImageItem,
  NodePort,
  ProjectPatchFn,
} from "../../types/types";
import {
  EDGE_PORT_RING,
  EDGES,
  edgeGroupPositionStyle,
  rearGlowStyle,
  removeCanvasImage,
} from "./nodeOverlayHelpers";

type CanvasImageDropHighlight =
  | {
      targetKind: "canvasImage";
      imageId: string;
      port: NodePort;
      dropAllowed: boolean;
    }
  | {
      targetKind: "node";
      nodeId: string;
      port: NodePort;
      dropAllowed: boolean;
    }
  | null;

type Props = {
  image: CanvasImageItem & {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  isConnected: boolean;
  viewport: Viewport;
  worldViewBounds: { minX: number; maxX: number; minY: number; maxY: number };
  zoom: number;
  viewportVersion: number;
  isDark: boolean;
  readOnly: boolean;
  isSelected: boolean;
  wireSession: unknown;
  wireDropHighlight: CanvasImageDropHighlight;
  onProjectPatch: (fn: ProjectPatchFn) => void;
  onSelect: (imageId: string) => void;
  onResetMultiSelection: () => void;
  onStartWireFromCanvasImage: (
    event: ReactPointerEvent<HTMLButtonElement>,
    imageId: string,
    edge: NodePort,
  ) => void;
  onStartCanvasImageDrag: (
    event: ReactPointerEvent<HTMLDivElement>,
    imageId: string,
    originX: number,
    originY: number,
  ) => void;
  onStartCanvasImageResize: (
    event: ReactPointerEvent<HTMLDivElement>,
    imageId: string,
    originWidth: number,
    originHeight: number,
  ) => void;
};

const CanvasImageOverlayItem = ({
  image,
  isConnected,
  viewport,
  worldViewBounds,
  zoom,
  viewportVersion,
  isDark,
  readOnly,
  isSelected,
  wireSession,
  wireDropHighlight,
  onProjectPatch,
  onSelect,
  onResetMultiSelection,
  onStartWireFromCanvasImage,
  onStartCanvasImageDrag,
  onStartCanvasImageResize,
}: Props) => {
  if (
    image.x > worldViewBounds.maxX ||
    image.x + image.width < worldViewBounds.minX ||
    image.y > worldViewBounds.maxY ||
    image.y + image.height < worldViewBounds.minY
  ) {
    return null;
  }

  const topLeft = viewport.toScreen(image.x, image.y);
  const bottomRight = viewport.toScreen(
    image.x + image.width,
    image.y + image.height,
  );
  const left = Math.min(topLeft.x, bottomRight.x);
  const top = Math.min(topLeft.y, bottomRight.y);
  const width = Math.abs(bottomRight.x - topLeft.x);
  const height = Math.abs(bottomRight.y - topLeft.y);
  const bodyTop = 50;
  const bodyHeight = Math.max(0, image.height - bodyTop - 10);

  if (width < 48 || height < 40 || bodyHeight < 12) return null;

  return (
    <div
      key={`canvas-image-html-${image.id}`}
      style={{ left, top, width, height }}
      className="group/canvas-image pointer-events-auto absolute select-none"
      data-overlay-canvas-image-id={image.id}
      data-viewport-version={viewportVersion}
      onPointerDown={(event) => {
        event.stopPropagation();
        onResetMultiSelection();
        onSelect(image.id);
      }}
    >
      <div
        className="absolute left-0 top-0"
        style={{
          width: image.width,
          height: image.height,
          transform: `scale(${zoom})`,
          transformOrigin: "top left",
        }}
      >
        {EDGES.map((edge) => {
          const isHighlighted =
            wireDropHighlight?.targetKind === "canvasImage" &&
            wireDropHighlight.imageId === image.id &&
            wireDropHighlight.port === edge;
          const isAllowed = wireDropHighlight?.dropAllowed ?? true;
          return (
            <button
              key={`${image.id}-${edge}`}
              type="button"
              data-canvas-image-id={image.id}
              data-link-port={edge}
              className={`pointer-events-auto absolute z-[45] flex cursor-crosshair touch-manipulation items-center justify-center rounded-full border border-solid p-0 font-mono text-[6px] font-bold leading-none transition-all hover:scale-110 ${EDGE_PORT_RING[edge]} ${
                isHighlighted
                  ? isAllowed
                    ? "z-[55] scale-110 opacity-100 ring-2 ring-white/90 ring-offset-2 ring-offset-background"
                    : "z-[55] scale-110 opacity-100 ring-2 ring-red-500 ring-offset-2 ring-offset-background shadow-[0_0_12px_rgba(239,68,68,0.45)]"
                  : wireSession
                    ? "opacity-100"
                    : "opacity-0 group-hover/canvas-image:opacity-100"
              }`}
              style={{
                ...edgeGroupPositionStyle(edge),
                width: NODE_PORT_HANDLE_PX,
                minWidth: NODE_PORT_HANDLE_PX,
                height: NODE_PORT_HANDLE_PX,
              }}
              onPointerDown={(event) =>
                onStartWireFromCanvasImage(event, image.id, edge)
              }
            >
              1
            </button>
          );
        })}

        {isSelected ? (
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-9 -z-10 rounded-[2.25rem] opacity-[1] blur-3xl"
            style={rearGlowStyle(isConnected)}
          />
        ) : null}

        <div
          className={`absolute inset-0 overflow-hidden rounded-2xl backdrop-blur-xl ${
            isDark
              ? "border border-border/20 bg-black/78 shadow-[0_14px_34px_-18px_rgba(0,0,0,0.85)]"
              : "border border-border/35 bg-white/80 shadow-[0_14px_30px_-20px_rgba(15,23,42,0.35)]"
          }`}
        />
        <div
          className={`absolute left-0 right-0 top-0 flex h-11 min-h-0 items-stretch overflow-hidden rounded-t-2xl ${
            isDark ? "border-b border-border/20" : "border-b border-border/35"
          }`}
        >
          <div
            className={`pointer-events-auto flex w-7 shrink-0 cursor-grab items-center justify-center text-[10px] text-muted-foreground active:cursor-grabbing ${
              isDark
                ? "border-r border-border/20 bg-zinc-900/35"
                : "border-r border-border/35 bg-zinc-200/45"
            }`}
            onPointerDown={(event) =>
              onStartCanvasImageDrag(event, image.id, image.x, image.y)
            }
            title="Перетягнути зображення"
          >
            ⋮⋮
          </div>
          <div className="pointer-events-auto flex min-w-0 flex-1 items-center justify-between gap-1 py-2 pl-2 pr-2">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <span
                aria-hidden
                className="h-2 w-2 shrink-0 rounded-full bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.55)] ring-1 ring-sky-300/35"
              />
              <input
                value={image.title ?? ""}
                readOnly={readOnly}
                onChange={(event) =>
                  onProjectPatch((prev) => ({
                    ...prev,
                    canvasImages: (prev.canvasImages ?? []).map((candidate) =>
                      candidate.id === image.id
                        ? {
                            ...candidate,
                            title: event.target.value.trim()
                              ? event.target.value
                              : undefined,
                          }
                        : candidate,
                    ),
                  }))
                }
                onPointerDown={(event) => event.stopPropagation()}
                className="min-w-0 flex-1 border-0 bg-transparent px-1 py-0.5 font-sans text-[16px] font-semibold text-foreground placeholder:text-muted-foreground/80 outline-none"
                placeholder="image"
                spellCheck={false}
              />
            </div>
            <button
              type="button"
              disabled={readOnly}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => removeCanvasImage(onProjectPatch, image.id)}
              className="mono px-1.5 py-0.5 text-[15px] text-muted-foreground transition-colors hover:text-rose-400 disabled:opacity-40"
              title="Видалити зображення"
            >
              ×
            </button>
          </div>
        </div>
        <div
          className={`absolute left-[14px] right-[14px] overflow-hidden rounded-xl border backdrop-blur-[2px] backdrop-saturate-125 ${
            isDark
              ? "border-zinc-700/18 bg-black/35"
              : "border-zinc-300/30 bg-white/70"
          }`}
          style={{ top: bodyTop, height: bodyHeight }}
        >
          <MarkdownResolvingImg
            src={image.url}
            alt={image.title ?? "image"}
            className="pointer-events-none h-full w-full select-none object-contain object-center"
          />
        </div>
        {!readOnly ? (
          <div
            role="separator"
            aria-label="Змінити розмір зображення"
            title="Змінити розмір"
            className={`pointer-events-auto absolute bottom-0 right-0 z-[4] h-4 w-4 cursor-nwse-resize rounded-br-2xl border-l border-t ${
              isDark
                ? "border-zinc-700/22 bg-zinc-900/45"
                : "border-zinc-300/35 bg-zinc-100/85"
            }`}
            onPointerDown={(event) =>
              onStartCanvasImageResize(
                event,
                image.id,
                image.width,
                image.height,
              )
            }
          />
        ) : null}
      </div>
    </div>
  );
};

export default CanvasImageOverlayItem;

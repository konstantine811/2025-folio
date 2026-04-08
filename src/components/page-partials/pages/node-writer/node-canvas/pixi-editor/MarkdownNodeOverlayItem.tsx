import type { PointerEvent as ReactPointerEvent } from "react";
import type { Viewport } from "pixi-viewport";
import { NodeMarkdownBlocksEditor } from "../components/NodeMarkdownBlocksEditor";
import { MarkdownResolvingImg } from "../components/MarkdownResolvingImg";
import { NODE_MD_BODY_TYPO, NODE_PORT_HANDLE_PX } from "../constants";
import { descriptionFromBlocks } from "../utils/node-markdown-blocks";
import { visibleChildSlotCount } from "../utils";
import type {
  LinkData,
  NodeData,
  NodeHeadingLevel,
  NodeMarkdownBlock,
  NodePort,
  ProjectPatchFn,
} from "../../types/types";
import {
  EDGE_PORT_RING,
  EDGES,
  SLOT_FLEX_GAP_PX,
  edgeGroupLayoutClass,
  edgeGroupPositionStyle,
  extractStandaloneImageUrlFromBlocks,
  headingLabelClass,
  normalizeHeadingLevel,
  rearGlowStyle,
  removeNode,
  toDisplayImageUrlCandidate,
  updateNodeAccentColor,
  updateNodeBlocks,
  updateNodeHeadingLevel,
  updateNodeLabel,
} from "./nodeOverlayHelpers";

type NodeDropHighlight =
  | {
      targetKind: "node";
      nodeId: string;
      port: NodePort;
      dropAllowed: boolean;
    }
  | {
      targetKind: "canvasImage";
      imageId: string;
      port: NodePort;
      dropAllowed: boolean;
    }
  | null;

type Props = {
  node: NodeData & { x: number; y: number; width: number; height: number };
  blocks: NodeMarkdownBlock[];
  isConnected: boolean;
  links: LinkData[];
  viewport: Viewport;
  worldViewBounds: { minX: number; maxX: number; minY: number; maxY: number };
  zoom: number;
  viewportVersion: number;
  isDark: boolean;
  readOnly: boolean;
  isSelected: boolean;
  wireSession: unknown;
  wireDropHighlight: NodeDropHighlight;
  uploadMarkdownPasteImage: (file: File) => Promise<string>;
  onProjectPatch: (fn: ProjectPatchFn) => void;
  onSelect: (nodeId: string) => void;
  onResetMultiSelection: () => void;
  onStartWireFromChildSlot: (
    event: ReactPointerEvent<HTMLButtonElement>,
    nodeId: string,
    edge: NodePort,
    slot: number,
  ) => void;
  onStartNodeDrag: (
    event: ReactPointerEvent<HTMLDivElement>,
    nodeId: string,
    originX: number,
    originY: number,
  ) => void;
  onStartNodeResize: (
    event: ReactPointerEvent<HTMLDivElement>,
    nodeId: string,
    originWidth: number,
    originHeight: number,
  ) => void;
};

const MarkdownNodeOverlayItem = ({
  node,
  blocks,
  isConnected,
  links,
  viewport,
  worldViewBounds,
  zoom,
  viewportVersion,
  isDark,
  readOnly,
  isSelected,
  wireSession,
  wireDropHighlight,
  uploadMarkdownPasteImage,
  onProjectPatch,
  onSelect,
  onResetMultiSelection,
  onStartWireFromChildSlot,
  onStartNodeDrag,
  onStartNodeResize,
}: Props) => {
  if (
    node.x > worldViewBounds.maxX ||
    node.x + node.width < worldViewBounds.minX ||
    node.y > worldViewBounds.maxY ||
    node.y + node.height < worldViewBounds.minY
  ) {
    return null;
  }

  const topLeft = viewport.toScreen(node.x, node.y);
  const bottomRight = viewport.toScreen(
    node.x + node.width,
    node.y + node.height,
  );

  const left = Math.min(topLeft.x, bottomRight.x);
  const top = Math.min(topLeft.y, bottomRight.y);
  const width = Math.abs(bottomRight.x - topLeft.x);
  const height = Math.abs(bottomRight.y - topLeft.y);
  const bodyTop = 56;
  const bodyHeight = Math.max(0, node.height - bodyTop - 10);
  const nodeImageUrl =
    toDisplayImageUrlCandidate(node.imageUrl?.trim() ?? "") ||
    extractStandaloneImageUrlFromBlocks(blocks);
  const isImageNode = nodeImageUrl.length > 0;
  const headingLevel = normalizeHeadingLevel(node.headingLevel);
  const titleClass = headingLabelClass(headingLevel);

  if (width < 48 || height < 40) return null;

  return (
    <div
      key={node.id}
      style={{ left, top, width, height }}
      className="group/node-overlay pointer-events-auto absolute select-none"
      data-overlay-node-id={node.id}
      data-viewport-version={viewportVersion}
      onPointerDown={() => {
        onResetMultiSelection();
        onSelect(node.id);
      }}
    >
      <div
        className="absolute left-0 top-0 pointer-events-none"
        style={{
          width: node.width,
          height: node.height,
          transform: `scale(${zoom})`,
          transformOrigin: "top left",
        }}
      >
        {isSelected ? (
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-9 -z-10 rounded-[2.25rem] opacity-[1] blur-3xl"
            style={rearGlowStyle(isConnected)}
          />
        ) : null}
        <div
          className={`absolute inset-0 overflow-hidden rounded-2xl backdrop-blur-xl backdrop-saturate-150 ${
            isDark
              ? "border border-border/20 bg-black/78 shadow-[0_14px_34px_-18px_rgba(0,0,0,0.85)]"
              : "border border-border/35 bg-white/80 shadow-[0_14px_30px_-20px_rgba(15,23,42,0.35)]"
          }`}
        />

        {!readOnly
          ? EDGES.map((edge) => {
              const count = visibleChildSlotCount(links, node.id, edge);
              const slots = Array.from({ length: count }, (_, idx) => idx + 1);
              return (
                <div
                  key={`${node.id}-${edge}`}
                  className={`pointer-events-none absolute z-[45] ${edgeGroupLayoutClass(edge)}`}
                  style={{
                    ...edgeGroupPositionStyle(edge),
                    gap: SLOT_FLEX_GAP_PX,
                  }}
                >
                  {slots.map((slot) => {
                    const isHighlighted =
                      wireDropHighlight?.targetKind === "node" &&
                      wireDropHighlight.nodeId === node.id &&
                      wireDropHighlight.port === edge;
                    const isAllowed = wireDropHighlight?.dropAllowed ?? true;
                    return (
                      <button
                        key={`${edge}-${slot}`}
                        type="button"
                        data-node-id={node.id}
                        data-link-port={edge}
                        data-source-child-edge={edge}
                        data-source-child-slot={String(slot)}
                        className={`pointer-events-auto flex cursor-crosshair touch-manipulation items-center justify-center rounded-full border border-solid p-0 font-mono text-[6px] font-bold leading-none transition-all hover:scale-110 ${EDGE_PORT_RING[edge]} ${
                          isHighlighted
                            ? isAllowed
                              ? "z-[55] scale-110 opacity-100 ring-2 ring-white/90 ring-offset-2 ring-offset-background"
                              : "z-[55] scale-110 opacity-100 ring-2 ring-red-500 ring-offset-2 ring-offset-background shadow-[0_0_12px_rgba(239,68,68,0.45)]"
                            : wireSession
                              ? "opacity-100"
                              : "opacity-0 group-hover/node-overlay:opacity-100"
                        }`}
                        style={{
                          width: NODE_PORT_HANDLE_PX,
                          minWidth: NODE_PORT_HANDLE_PX,
                          height: NODE_PORT_HANDLE_PX,
                        }}
                        onPointerDown={(event) =>
                          onStartWireFromChildSlot(event, node.id, edge, slot)
                        }
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              );
            })
          : null}

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
              onStartNodeDrag(event, node.id, node.x, node.y)
            }
            title="Перетягнути ноду"
          >
            ⋮⋮
          </div>
          <div className="pointer-events-auto flex min-w-0 flex-1 items-center justify-between gap-1 py-2 pl-1 pr-2">
            <input
              value={node.label}
              readOnly={readOnly}
              onChange={(event) =>
                updateNodeLabel(onProjectPatch, node.id, event.target.value)
              }
              onPointerDown={(event) => {
                event.stopPropagation();
              }}
              className={`min-w-0 flex-1 border-0 bg-transparent px-1 py-0.5 outline-none select-text placeholder:text-muted-foreground/80 ${titleClass}`}
              spellCheck={false}
            />
            <div className="flex shrink-0 items-center gap-1 text-muted-foreground">
              <button
                type="button"
                disabled={readOnly || headingLevel >= 6}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() =>
                  updateNodeHeadingLevel(
                    onProjectPatch,
                    node.id,
                    Math.min(6, headingLevel + 1) as NodeHeadingLevel,
                  )
                }
                className="flex h-5 min-w-5 items-center justify-center rounded text-[18px] leading-none transition-colors hover:text-foreground disabled:opacity-40"
                title="Зменшити заголовок"
              >
                −
              </button>
              <span className="mono min-w-[1.35rem] px-0.5 text-center text-[8px] leading-none text-muted-foreground">
                h{headingLevel}
              </span>
              <button
                type="button"
                disabled={readOnly || headingLevel <= 1}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() =>
                  updateNodeHeadingLevel(
                    onProjectPatch,
                    node.id,
                    Math.max(1, headingLevel - 1) as NodeHeadingLevel,
                  )
                }
                className="flex h-5 min-w-5 items-center justify-center rounded text-[18px] leading-none transition-colors hover:text-foreground disabled:opacity-40"
                title="Збільшити заголовок"
              >
                +
              </button>
              <label
                className="relative inline-flex h-5 w-5 cursor-pointer items-center justify-center overflow-hidden rounded border border-border/45 shadow-sm"
                style={{
                  background:
                    "conic-gradient(from 0deg, #ef4444, #f97316, #eab308, #22c55e, #14b8a6, #3b82f6, #a855f7, #ec4899, #ef4444)",
                }}
                title="Колір ноди"
              >
                <input
                  type="color"
                  value={node.accentColor ?? "#6366f1"}
                  disabled={readOnly}
                  onChange={(event) =>
                    updateNodeAccentColor(
                      onProjectPatch,
                      node.id,
                      event.target.value,
                    )
                  }
                  onPointerDown={(event) => event.stopPropagation()}
                  className="absolute inset-0 opacity-0"
                />
              </label>
              <button
                type="button"
                disabled={readOnly}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => removeNode(onProjectPatch, node.id)}
                className="mono px-1.5 py-0.5 text-[15px] text-muted-foreground transition-colors hover:text-rose-400 disabled:opacity-40"
                title="Видалити ноду"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        {bodyHeight >= 28 ? (
          <div
            className="pointer-events-auto absolute left-[14px] right-[14px]"
            style={{ top: bodyTop, height: bodyHeight }}
          >
            <div
              className={`flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-[24px] font-sans antialiased ${
                isImageNode
                  ? isDark
                    ? "border border-sky-700/26 bg-black/35 backdrop-blur-[2px] backdrop-saturate-125 shadow-[inset_0_1px_0_rgba(125,211,252,0.12)]"
                    : "border border-sky-300/45 bg-white/70 backdrop-blur-[2px] backdrop-saturate-125 shadow-[inset_0_1px_0_rgba(14,165,233,0.1)]"
                  : isDark
                    ? "border border-zinc-700/18 bg-black/62 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
                    : "border border-zinc-300/30 bg-white/86 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
              }`}
            >
              {isImageNode ? (
                <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-2">
                  <div
                    className={`relative min-h-0 flex-1 overflow-hidden rounded-[18px] border backdrop-blur-[2px] backdrop-saturate-125 ${
                      isDark
                        ? "border-sky-800/26 bg-black/35"
                        : "border-sky-300/45 bg-white/60"
                    }`}
                  >
                    <MarkdownResolvingImg
                      src={nodeImageUrl}
                      alt={node.label}
                      className="pointer-events-none h-full w-full select-none object-contain object-center"
                    />
                  </div>
                </div>
              ) : readOnly ? (
                <div
                  data-node-overlay-scroll="true"
                  className={`h-full overflow-auto px-5 py-2 whitespace-pre-wrap text-foreground/85 ${NODE_MD_BODY_TYPO}`}
                >
                  {descriptionFromBlocks(blocks)}
                </div>
              ) : (
                <div
                  data-node-overlay-scroll="true"
                  className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden pl-5 pr-2 pt-2"
                >
                  <NodeMarkdownBlocksEditor
                    nodeId={node.id}
                    blocks={blocks}
                    selectionEditorMode="toolbar"
                    uploadPasteImage={uploadMarkdownPasteImage}
                    onBlocksChange={(nextBlocks) =>
                      updateNodeBlocks(onProjectPatch, node.id, nextBlocks)
                    }
                  />
                </div>
              )}
            </div>
          </div>
        ) : null}

        {!readOnly ? (
          <div
            role="separator"
            aria-label="Змінити розмір ноди"
            title="Змінити розмір"
            className={`pointer-events-auto absolute bottom-0 right-0 z-[4] h-4 w-4 cursor-nwse-resize rounded-br-2xl border-l border-t ${
              isDark
                ? "border-zinc-700/22 bg-zinc-900/45"
                : "border-zinc-300/35 bg-zinc-100/85"
            }`}
            onPointerDown={(event) =>
              onStartNodeResize(event, node.id, node.width, node.height)
            }
          />
        ) : null}
      </div>
    </div>
  );
};

export default MarkdownNodeOverlayItem;

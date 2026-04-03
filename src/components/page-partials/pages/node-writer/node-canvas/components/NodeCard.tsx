import type { CSSProperties } from "react";
import { useMemo } from "react";
import { Info } from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { remarkDefaultFenceLang } from "@/utils/remark-default-fence-lang";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type {
  LinkData,
  NodeData,
  NodeHeadingLevel,
  NodeMarkdownBlock,
  NodePort,
} from "../../types/types";
import {
  DEFAULT_NODE_H,
  DEFAULT_NODE_W,
  NODE_HEADING_LABEL_CLASSES,
  NODE_MARKDOWN_EDITOR_HELP_TEXT,
  resolveNodeHeadingLevel,
} from "../constants";
import { nodeTextThemeFromAccent } from "../utils/node-accent";
import { deriveMarkdownBlocks } from "../utils/node-markdown-blocks";
import { ChildSlotHandles } from "./ChildSlotHandles";
import {
  NodeMarkdownBlocksEditor,
  nodeMarkdownPreviewComponents,
} from "./NodeMarkdownBlocksEditor";

/** Значення для нативного `<input type="color">`, коли в ноди ще немає accent. */
const COLOR_INPUT_FALLBACK = "#6366f1";

/** Яскравий «веселковий» фон свотча до вибору кольору (конічний градієнт). */
const COLOR_SWATCH_IDLE_GRADIENT =
  "conic-gradient(from 0deg, #ef4444, #f97316, #eab308, #22c55e, #14b8a6, #3b82f6, #a855f7, #ec4899, #ef4444)";

interface NodeCardProps {
  /** Лише перегляд: без перетягування, редагування та звʼязків. */
  readOnly?: boolean;
  node: NodeData;
  links: LinkData[];
  zIndex: number;
  wireDragging: boolean;
  onStartWireFromChildSlot: (
    e: React.PointerEvent,
    nodeId: string,
    edge: NodePort,
    slot: number,
  ) => void;
  onDragPointerDown: (e: React.PointerEvent, node: NodeData) => void;
  onDragPointerMove: (e: React.PointerEvent) => void;
  onDragPointerUp: (e: React.PointerEvent) => void;
  onResizePointerDown: (e: React.PointerEvent, node: NodeData) => void;
  onLabelChange: (id: string, label: string) => void;
  onHeadingLevelChange: (id: string, level: NodeHeadingLevel) => void;
  onAccentColorChange: (id: string, hex: string | undefined) => void;
  onMarkdownBlocksChange: (id: string, blocks: NodeMarkdownBlock[]) => void;
  onRemove: (id: string) => void;
  setNodeRef: (id: string) => (el: HTMLDivElement | null) => void;
}

export function NodeCard({
  readOnly = false,
  node,
  links,
  zIndex,
  wireDragging,
  onStartWireFromChildSlot,
  onDragPointerDown,
  onDragPointerMove,
  onDragPointerUp,
  onResizePointerDown,
  onLabelChange,
  onHeadingLevelChange,
  onAccentColorChange,
  onMarkdownBlocksChange,
  onRemove,
  setNodeRef,
}: NodeCardProps) {
  const x = node.x ?? 0;
  const y = node.y ?? 0;
  const nw = node.width ?? DEFAULT_NODE_W;
  const nh = node.height ?? DEFAULT_NODE_H;
  const headingLevel = resolveNodeHeadingLevel(node.headingLevel);
  const labelWeight = headingLevel === 1 ? "font-extrabold" : "font-bold";

  const accent = node.accentColor?.trim();
  const themeAccent =
    accent != null && accent !== ""
      ? nodeTextThemeFromAccent(accent)
      : null;

  const mdFg = themeAccent?.fg ?? "inherit";
  const mdFgMuted = themeAccent?.fgMuted ?? "inherit";
  const mdComponents = useMemo(
    () => nodeMarkdownPreviewComponents(mdFg, mdFgMuted),
    [mdFg, mdFgMuted],
  );
  const mdBlocks = deriveMarkdownBlocks(node);

  const labelClass = `${NODE_HEADING_LABEL_CLASSES[headingLevel]} ${labelWeight} tracking-tight uppercase ${themeAccent ? "" : "text-foreground"}`;

  const rootStyle: CSSProperties = {
    left: x,
    top: y,
    width: nw,
    height: nh,
    zIndex,
    ...(themeAccent && accent
      ? {
          backgroundColor: accent,
          borderColor: themeAccent.border,
          color: themeAccent.fg,
        }
      : {}),
  };

  if (readOnly) {
    return (
      <div
        ref={setNodeRef(node.id)}
        data-node-id={node.id}
        style={rootStyle}
        className={`pointer-events-none group/node-card absolute flex flex-col overflow-hidden border shadow-sm ${
          themeAccent
            ? "border-solid"
            : "border-border/20 bg-card/95 text-card-foreground backdrop-blur-sm"
        }`}
      >
        <ChildSlotHandles
          readOnly
          nodeId={node.id}
          links={links}
          wireDragging={false}
          onPointerDown={onStartWireFromChildSlot}
        />
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div
            className="flex shrink-0 items-center border-b border-solid px-3 py-2"
            style={
              themeAccent
                ? { borderBottomColor: themeAccent.headerRule }
                : undefined
            }
          >
            <span className={`min-w-0 truncate ${labelClass}`}>{node.label}</span>
          </div>
          <div
            className={`min-h-0 flex-1 overflow-y-auto overflow-x-hidden py-1 pl-5 pr-2 ${
              !themeAccent ? "text-foreground/90" : ""
            }`}
            style={themeAccent ? { color: themeAccent.fg } : undefined}
          >
            {mdBlocks.map((b) => (
              <div
                key={b.id}
                className="markdown-node-preview px-2 py-0.5 text-[12px] leading-snug"
              >
                {b.text.trim() ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkDefaultFenceLang]}
                    rehypePlugins={[rehypeRaw]}
                    components={mdComponents}
                  >
                    {b.text}
                  </ReactMarkdown>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef(node.id)}
      data-node-id={node.id}
      style={rootStyle}
      className={`pointer-events-auto group/node-card absolute flex flex-col overflow-visible border shadow-sm transition-[border-color] ${
        themeAccent
          ? "border-solid"
          : "border-border/20 bg-card/95 text-card-foreground backdrop-blur-sm hover:border-border/35"
      }`}
    >
      <ChildSlotHandles
        nodeId={node.id}
        links={links}
        wireDragging={wireDragging}
        onPointerDown={onStartWireFromChildSlot}
      />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div
          className="flex min-h-0 shrink-0 items-stretch gap-0 border-b border-solid"
          style={
            themeAccent
              ? { borderBottomColor: themeAccent.headerRule }
              : undefined
          }
        >
          <div
            title="Перетягнути"
            className={`flex w-7 shrink-0 cursor-grab touch-none items-center justify-center border-r border-solid text-[10px] active:cursor-grabbing ${
              themeAccent
                ? ""
                : "border-border/15 bg-muted/30 text-muted-foreground"
            }`}
            style={
              themeAccent
                ? {
                    borderRightColor: themeAccent.headerRule,
                    backgroundColor: themeAccent.dragBg,
                    color: themeAccent.fgSubtle,
                  }
                : undefined
            }
            onPointerDown={(e) => onDragPointerDown(e, node)}
            onPointerMove={onDragPointerMove}
            onPointerUp={onDragPointerUp}
            onPointerCancel={onDragPointerUp}
          >
            ⋮⋮
          </div>
          <div className="flex min-w-0 flex-1 items-center justify-between gap-1 py-2 pr-2 pl-1">
            <input
              value={node.label}
              onChange={(e) => onLabelChange(node.id, e.target.value)}
              className={`min-w-0 flex-1 bg-transparent px-1 py-0.5 outline-none placeholder:opacity-50 ${labelClass}`}
              style={themeAccent ? { color: themeAccent.fg } : undefined}
              onPointerDown={(e) => e.stopPropagation()}
            />
            <div className="flex shrink-0 items-center gap-0.5">
              <div className="flex shrink-0 items-center gap-px">
                <button
                  type="button"
                  title="Знизити рівень (h6 — найменший шрифт)"
                  disabled={headingLevel >= 6}
                  className={`mono flex h-5 min-w-5 items-center justify-center rounded border border-solid text-[11px] disabled:pointer-events-none disabled:opacity-35 ${
                    themeAccent
                      ? ""
                      : "border-border/25 text-muted-foreground hover:border-border/45 hover:text-foreground"
                  }`}
                  style={
                    themeAccent
                      ? {
                          borderColor: themeAccent.border,
                          color: themeAccent.fgMuted,
                        }
                      : undefined
                  }
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (headingLevel < 6) {
                      onHeadingLevelChange(
                        node.id,
                        (headingLevel + 1) as NodeHeadingLevel,
                      );
                    }
                  }}
                >
                  −
                </button>
                <span
                  className={`mono min-w-[1.35rem] px-0.5 text-center text-[8px] leading-none ${
                    themeAccent ? "" : "text-muted-foreground"
                  }`}
                  style={
                    themeAccent
                      ? { color: themeAccent.fgSubtle }
                      : undefined
                  }
                  title={`Рівень заголовка: h${headingLevel}`}
                >
                  h{headingLevel}
                </span>
                <button
                  type="button"
                  title="Підвищити рівень (h1 — найбільший шрифт)"
                  disabled={headingLevel <= 1}
                  className={`mono flex h-5 min-w-5 items-center justify-center rounded border border-solid text-[11px] disabled:pointer-events-none disabled:opacity-35 ${
                    themeAccent
                      ? ""
                      : "border-border/25 text-muted-foreground hover:border-border/45 hover:text-foreground"
                  }`}
                  style={
                    themeAccent
                      ? {
                          borderColor: themeAccent.border,
                          color: themeAccent.fgMuted,
                        }
                      : undefined
                  }
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (headingLevel > 1) {
                      onHeadingLevelChange(
                        node.id,
                        (headingLevel - 1) as NodeHeadingLevel,
                      );
                    }
                  }}
                >
                  +
                </button>
              </div>
              <label
                className={`relative flex h-5 min-w-5 shrink-0 cursor-pointer overflow-hidden rounded border border-solid shadow-sm ${
                  themeAccent
                    ? ""
                    : "border-white/25 ring-1 ring-black/10 dark:border-white/20 dark:ring-white/10"
                }`}
                style={
                  themeAccent
                    ? { borderColor: themeAccent.border }
                    : undefined
                }
                title="Колір ноди"
              >
                <input
                  type="color"
                  className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                  value={node.accentColor ?? COLOR_INPUT_FALLBACK}
                  onChange={(e) =>
                    onAccentColorChange(node.id, e.target.value)
                  }
                  onPointerDown={(e) => e.stopPropagation()}
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 z-0 block rounded-[inherit]"
                  style={{ background: COLOR_SWATCH_IDLE_GRADIENT }}
                />
              </label>
            </div>
            <button
              type="button"
              title="Видалити ноду"
              className={`mono shrink-0 px-1.5 py-0.5 text-[10px] hover:text-destructive ${
                themeAccent ? "" : "text-muted-foreground"
              }`}
              style={themeAccent ? { color: themeAccent.fgMuted } : undefined}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onRemove(node.id);
              }}
            >
              ×
            </button>
          </div>
        </div>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden pl-5 pr-2">
          <NodeMarkdownBlocksEditor
            nodeId={node.id}
            blocks={deriveMarkdownBlocks(node)}
            themeAccent={themeAccent}
            onBlocksChange={(blocks) =>
              onMarkdownBlocksChange(node.id, blocks)
            }
          />
        </div>
        <div
          className={`flex shrink-0 justify-start border-t border-solid px-1.5 py-0.5 ${
            themeAccent ? "" : "border-border/15"
          }`}
          style={
            themeAccent
              ? { borderTopColor: themeAccent.footerRule }
              : undefined
          }
        >
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label="Підказки редактора тексту в ноді"
                className={`rounded p-1 transition-colors ${
                  themeAccent
                    ? "hover:bg-black/10"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
                style={themeAccent ? { color: themeAccent.fgSubtle } : undefined}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <Info className="size-3.5" strokeWidth={2} aria-hidden />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              align="start"
              sideOffset={6}
              className="mono max-w-md px-3 py-2.5 text-left text-[10px] leading-relaxed font-normal tracking-normal whitespace-pre-line normal-case text-balance"
            >
              {NODE_MARKDOWN_EDITOR_HELP_TEXT}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      <div
        role="separator"
        aria-hidden
        title="Змінити розмір"
        className={`absolute right-0 bottom-0 z-[50] h-4 w-4 cursor-nwse-resize touch-manipulation border-t border-l border-solid ${
          themeAccent
            ? ""
            : "border-border/25 bg-muted/40 hover:border-border/45 hover:bg-muted/60"
        }`}
        style={
          themeAccent
            ? {
                borderColor: themeAccent.border,
                backgroundColor: themeAccent.dragBg,
              }
            : undefined
        }
        onPointerDown={(e) => onResizePointerDown(e, node)}
      />
    </div>
  );
}

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
  NODE_MD_BODY_TYPO,
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

/** Зовнішній «скло» шар (backdrop): заголовок живе тут, контент — у вкладеній панелі. */
const NODE_OUTER_GLASS =
  "rounded-2xl border border-white/12 bg-white/[0.07] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.55)] backdrop-blur-xl backdrop-saturate-150 dark:border-white/10 dark:bg-zinc-900/25 dark:shadow-[0_12px_48px_-16px_rgba(0,0,0,0.75)]";

const NODE_OUTER_GLASS_INTERACTIVE =
  "hover:border-white/18 hover:shadow-[0_0_36px_-14px_rgba(129,140,248,0.28)]";

/** Темна внутрішня панель (обмежує title / markdown як у референс-ноді). */
const NODE_INNER_PANEL =
  "rounded-xl border border-white/[0.07] bg-zinc-950/95 font-sans antialiased shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] dark:border-white/[0.06] dark:bg-[#09090b]";

/** Розділювач між скляним заголовком і внутрішньою панеллю. */
const NODE_OUTER_HEADER_RULE = "border-white/10 dark:border-white/[0.08]";

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
  /** Вставка зображення з буфера в markdown (Ctrl/⌘+V у рядку). */
  uploadMarkdownPasteImage?: (file: File) => Promise<string>;
  onRemove: (id: string) => void;
  setNodeRef: (id: string) => (el: HTMLDivElement | null) => void;
  /** Підсвітка боку цілі під час ведення звʼязку. */
  wireDropHighlightPort?: NodePort | null;
  /** Якщо false — з цією нодою вже є звʼязок; червона обводка порту. */
  wireDropHighlightAllowed?: boolean;
  /** Виділено в групу (Shift) — обводка картки. */
  multiSelected?: boolean;
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
  uploadMarkdownPasteImage,
  onRemove,
  setNodeRef,
  wireDropHighlightPort = null,
  wireDropHighlightAllowed = true,
  multiSelected = false,
}: NodeCardProps) {
  const x = node.x ?? 0;
  const y = node.y ?? 0;
  const nw = node.width ?? DEFAULT_NODE_W;
  const nh = node.height ?? DEFAULT_NODE_H;
  const headingLevel = resolveNodeHeadingLevel(node.headingLevel);
  const labelWeight =
    headingLevel <= 2 ? "font-semibold" : "font-medium";

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

  const nodeHasLinks = useMemo(
    () => links.some((l) => l.source === node.id || l.target === node.id),
    [links, node.id],
  );

  const labelClass = `font-sans antialiased ${NODE_HEADING_LABEL_CLASSES[headingLevel]} ${labelWeight} normal-case ${themeAccent ? "" : "text-foreground"}`;

  const rootStyle: CSSProperties = {
    left: x,
    top: y,
    width: nw,
    height: nh,
    zIndex,
  };

  const rearGlowStyle: CSSProperties = useMemo(() => {
    if (accent && themeAccent) {
      return {
        background: `radial-gradient(ellipse 78% 68% at 28% 44%, color-mix(in srgb, ${accent} 52%, transparent) 0%, transparent 58%), radial-gradient(ellipse 70% 60% at 82% 56%, rgba(34,211,238,0.2) 0%, transparent 52%)`,
      };
    }
    return {
      background:
        "radial-gradient(ellipse 80% 70% at 24% 46%, rgba(217,70,211,0.32) 0%, transparent 58%), radial-gradient(ellipse 72% 62% at 80% 52%, rgba(34,211,238,0.24) 0%, transparent 52%)",
    };
  }, [accent, themeAccent]);

  const outerShellStyle: CSSProperties | undefined =
    themeAccent && accent
      ? {
          borderColor: themeAccent.border,
          backgroundColor: `color-mix(in srgb, ${accent} 22%, rgba(9,9,11,0.42))`,
        }
      : undefined;

  if (readOnly) {
    return (
      <div
        ref={setNodeRef(node.id)}
        data-node-id={node.id}
        style={rootStyle}
        className="pointer-events-none group/node-card absolute isolate overflow-hidden"
      >
        {nodeHasLinks ? (
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-5 -z-10 rounded-[1.75rem] opacity-[0.82] blur-2xl"
            style={rearGlowStyle}
          />
        ) : null}
        <div
          className={`relative flex h-full min-h-0 flex-col overflow-visible shadow-md ${
            themeAccent
              ? "rounded-2xl border border-solid backdrop-blur-xl backdrop-saturate-150"
              : `${NODE_OUTER_GLASS} text-card-foreground`
          }`}
          style={outerShellStyle}
        >
          <ChildSlotHandles
            readOnly
            nodeId={node.id}
            links={links}
            wireDragging={false}
            onPointerDown={onStartWireFromChildSlot}
          />
          <div
            className={`flex shrink-0 items-center border-b border-solid px-3 py-2 ${
              themeAccent ? "" : NODE_OUTER_HEADER_RULE
            }`}
            style={
              themeAccent
                ? { borderBottomColor: themeAccent.border }
                : undefined
            }
          >
            <span className={`min-w-0 truncate ${labelClass}`}>{node.label}</span>
          </div>
          <div
            className={`mx-2 mb-2 mt-1 flex min-h-0 flex-1 flex-col overflow-hidden ${NODE_INNER_PANEL}`}
          >
            <div
              className={`min-h-0 flex-1 overflow-y-auto overflow-x-hidden py-2 pl-5 pr-2 ${
                !themeAccent ? "text-foreground/90" : ""
              }`}
              style={themeAccent ? { color: themeAccent.fg } : undefined}
            >
              {mdBlocks.map((b) => (
                <div
                  key={b.id}
                  className={`markdown-node-preview px-2 py-0.5 ${NODE_MD_BODY_TYPO}`}
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
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef(node.id)}
      data-node-id={node.id}
      style={rootStyle}
      className="pointer-events-auto group/node-card absolute isolate overflow-visible"
    >
      {nodeHasLinks ? (
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-5 -z-10 rounded-[1.75rem] opacity-[0.82] blur-2xl"
          style={rearGlowStyle}
        />
      ) : null}
      <div
        className={`relative flex h-full min-h-0 flex-col overflow-visible shadow-md transition-[border-color,box-shadow] ${
          multiSelected ? "rounded-2xl ring-2 ring-sky-400/65 ring-offset-0" : ""
        } ${
          themeAccent
            ? "rounded-2xl border border-solid backdrop-blur-xl backdrop-saturate-150"
            : `${NODE_OUTER_GLASS} text-card-foreground ${NODE_OUTER_GLASS_INTERACTIVE}`
        }`}
        style={outerShellStyle}
      >
        <ChildSlotHandles
          nodeId={node.id}
          links={links}
          wireDragging={wireDragging}
          highlightDropPort={wireDropHighlightPort}
          highlightDropAllowed={wireDropHighlightAllowed}
          onPointerDown={onStartWireFromChildSlot}
        />

        <div
          className={`flex min-h-0 shrink-0 items-stretch gap-0 border-b border-solid ${
            themeAccent ? "" : NODE_OUTER_HEADER_RULE
          }`}
          style={
            themeAccent
              ? { borderBottomColor: themeAccent.border }
              : undefined
          }
        >
          <div
            title="Перетягнути · Shift+клік — у групу / з групи"
            className={`flex w-7 shrink-0 cursor-grab touch-none items-center justify-center border-r border-solid text-[10px] active:cursor-grabbing ${
              themeAccent
                ? ""
                : `border-white/10 bg-white/[0.04] text-muted-foreground dark:border-white/[0.09]`
            }`}
            style={
              themeAccent
                ? {
                    borderRightColor: themeAccent.border,
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

        <div
          className={`mx-2 mb-2 mt-1 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden ${NODE_INNER_PANEL}`}
        >
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden pl-5 pr-2 pt-2">
            <NodeMarkdownBlocksEditor
              nodeId={node.id}
              blocks={deriveMarkdownBlocks(node)}
              themeAccent={themeAccent}
              onBlocksChange={(blocks) =>
                onMarkdownBlocksChange(node.id, blocks)
              }
              uploadPasteImage={uploadMarkdownPasteImage}
            />
          </div>
          <div
            className={`flex shrink-0 justify-start border-t border-solid border-white/8 px-1.5 py-0.5 dark:border-white/[0.07]`}
            style={
              themeAccent
                ? { borderTopColor: themeAccent.border }
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
                      ? "hover:bg-white/10"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
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
      </div>

      <div
        role="separator"
        aria-hidden
        title="Змінити розмір"
        className={`absolute right-0 bottom-0 z-[50] h-4 w-4 cursor-nwse-resize touch-manipulation border-t border-l border-solid ${
          themeAccent
            ? ""
            : "border-white/15 bg-white/[0.06] hover:border-white/25 hover:bg-white/10"
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

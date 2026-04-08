import { useMemo } from "react";
import { ImageIcon, Heading2, Type, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CanvasImageItem, NodeData } from "../types/types";
import { deriveMarkdownBlocks } from "../node-canvas/utils/node-markdown-blocks";
import {
  PRESENTATION_DND_MIME,
  type DndPayload,
  usedSourceKeyCanvasImage,
  usedSourceKeyHeading,
  usedSourceKeyImageNode,
  usedSourceKeyText,
} from "./presentation-model";

const NESTED_LENIS_SCROLL = {
  "data-lenis-prevent": true,
  "data-lenis-prevent-wheel": true,
  "data-lenis-prevent-touch": true,
} as const;

function previewText(raw: string, max = 120): string {
  const t = raw.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}

function startDrag(e: React.DragEvent, payload: DndPayload) {
  e.dataTransfer.setData(PRESENTATION_DND_MIME, JSON.stringify(payload));
  e.dataTransfer.effectAllowed = "copy";
}

interface PresentationSourcePanelProps {
  nodes: NodeData[];
  canvasImages: CanvasImageItem[];
  readOnly: boolean;
  /** Ключі з `collectUsedSourceKeys` — м’яка підсвітка «вже на слайдах». */
  usedKeys: Set<string>;
}

export function PresentationSourcePanel({
  nodes,
  canvasImages,
  readOnly,
  usedKeys,
}: PresentationSourcePanelProps) {
  const nodeSections = useMemo(
    () =>
      nodes.map((n) => ({
        node: n,
        blocks: deriveMarkdownBlocks(n),
      })),
    [nodes],
  );

  if (readOnly) {
    return null;
  }

  return (
    <aside
      {...NESTED_LENIS_SCROLL}
      className="flex min-h-0 w-full shrink-0 flex-col self-stretch overflow-auto border-b border-border/25 bg-muted/40 xl:w-72 xl:self-stretch xl:border-r xl:border-b-0"
    >
      <div className="shrink-0 border-b border-border/20 px-3 py-2">
        <h3 className="font-sans text-[11px] font-semibold uppercase tracking-widest text-foreground">
          З документа (ноди)
        </h3>
        <p className="mt-1 text-[10px] leading-snug text-muted-foreground">
          Перетягніть на слайд заголовок, фрагмент тексту або зображення з ноди.
          Підсвічені — уже додані до презентації.
        </p>
      </div>
      <div
        {...NESTED_LENIS_SCROLL}
        className="min-h-0 flex-1 space-y-3 px-2 py-2 [-webkit-overflow-scrolling:touch]"
      >
        {nodeSections.map(({ node, blocks }) => (
          <div
            key={node.id}
            className="rounded-lg border border-border/12 bg-card/80 p-2 ring-1 ring-border/8"
          >
            <div className="mb-2 flex items-start gap-1.5">
              <GripVertical
                className="mt-0.5 size-3 shrink-0 text-muted-foreground/50"
                aria-hidden
              />
              <div className="min-w-0">
                <div className="truncate font-sans text-[11px] font-medium text-foreground">
                  {node.label || "Без назви"}
                </div>
                <div className="mt-1.5 flex flex-col gap-1">
                  <button
                    type="button"
                    draggable
                    onDragStart={(e) =>
                      startDrag(e, {
                        type: "heading",
                        nodeId: node.id,
                        text: node.label || "Без назви",
                      })
                    }
                    className={cn(
                      "flex w-full items-center gap-2 rounded border border-dashed px-2 py-1.5 text-left text-[10px] transition-colors",
                      usedKeys.has(usedSourceKeyHeading(node.id))
                        ? "border-primary/28 bg-primary/10 text-foreground ring-1 ring-primary/12 hover:border-primary/40"
                        : "border-border/35 bg-muted/45 text-foreground hover:border-border/50 hover:bg-muted/70",
                    )}
                  >
                    <Heading2 className="size-3 shrink-0 opacity-80" />
                    Заголовок (мітка ноди)
                  </button>
                  {blocks.map((b) => {
                    const t = (b.text ?? "").trim();
                    if (!t) return null;
                    const textUsed = usedKeys.has(
                      usedSourceKeyText(node.id, b.id),
                    );
                    return (
                      <button
                        key={b.id}
                        type="button"
                        draggable
                        onDragStart={(e) =>
                          startDrag(e, {
                            type: "text",
                            nodeId: node.id,
                            markdownBlockId: b.id,
                            text: b.text ?? "",
                          })
                        }
                        className={cn(
                          "flex w-full items-start gap-2 rounded border border-dashed px-2 py-1.5 text-left text-[10px] transition-colors",
                          textUsed
                            ? "border-primary/28 bg-primary/10 text-foreground ring-1 ring-primary/12 hover:border-primary/40"
                            : "border-border/30 bg-muted/40 text-foreground hover:border-border/45 hover:bg-muted/70",
                        )}
                      >
                        <Type className="mt-0.5 size-3 shrink-0 text-muted-foreground" />
                        <span className="line-clamp-3">{previewText(t)}</span>
                      </button>
                    );
                  })}
                  {node.imageUrl ? (
                    <button
                      type="button"
                      draggable
                      onDragStart={(e) =>
                        startDrag(e, {
                          type: "image-node",
                          nodeId: node.id,
                          url: node.imageUrl!,
                        })
                      }
                      className={cn(
                        "flex w-full items-center gap-2 rounded border border-dashed px-2 py-1.5 text-left text-[10px] transition-colors",
                        usedKeys.has(usedSourceKeyImageNode(node.id))
                          ? "border-primary/28 bg-primary/10 text-foreground ring-1 ring-primary/12 hover:border-primary/40"
                          : "border-border/35 bg-muted/45 text-foreground hover:border-border/50 hover:bg-muted/70",
                      )}
                    >
                      <ImageIcon className="size-3 shrink-0" />
                      Зображення в ноді
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        ))}

        {canvasImages.length > 0 ? (
          <div className="rounded-lg border border-border/12 bg-card/80 p-2 ring-1 ring-border/8">
            <div className="mb-2 font-sans text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Полотно (картки)
            </div>
            <div className="flex flex-col gap-1.5">
              {canvasImages.map((im) => {
                const cu = usedKeys.has(usedSourceKeyCanvasImage(im.id));
                return (
                  <button
                    key={im.id}
                    type="button"
                    draggable
                    onDragStart={(e) =>
                      startDrag(e, {
                        type: "image-canvas",
                        canvasImageId: im.id,
                        url: im.url,
                      })
                    }
                    className={cn(
                      "flex items-center gap-2 rounded border border-dashed px-2 py-1.5 text-left text-[10px] transition-colors",
                      cu
                        ? "border-primary/28 bg-primary/10 text-foreground ring-1 ring-primary/12 hover:border-primary/40"
                        : "border-border/35 bg-muted/45 text-foreground hover:border-border/50 hover:bg-muted/70",
                    )}
                  >
                    <ImageIcon className="size-3 shrink-0" />
                    <span className="truncate">
                      {(im.title?.trim() || "image").toLowerCase()}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {nodes.length === 0 && canvasImages.length === 0 ? (
          <p className="px-2 py-6 text-center text-[10px] text-muted-foreground">
            Немає нод і зображень на полотні — додайте їх у вигляді «Ноди».
          </p>
        ) : null}
      </div>
    </aside>
  );
}

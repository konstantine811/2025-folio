import type { CanvasImageItem, LinkData, NodeData } from "../../types/types";

interface LinksPanelProps {
  /** Якщо true — список без кнопок видалення. */
  readOnly?: boolean;
  links: LinkData[];
  nodes: NodeData[];
  canvasImages: CanvasImageItem[];
  onRemoveLink: (source: string, target: string) => void;
}

function endpointLabel(
  id: string,
  isCanvas: boolean | undefined,
  nodes: NodeData[],
  canvasImages: CanvasImageItem[],
): string {
  if (isCanvas) {
    const t = canvasImages.find((i) => i.id === id)?.title?.trim();
    return t ? `🖼 ${t}` : "🖼 Зображення";
  }
  return nodes.find((n) => n.id === id)?.label ?? id;
}

export function LinksPanel({
  readOnly = false,
  links,
  nodes,
  canvasImages,
  onRemoveLink,
}: LinksPanelProps) {
  if (links.length === 0) return null;

  return (
    <div className="max-h-28 shrink-0 overflow-y-auto border-t border-border/20 bg-card px-4 py-2">
      <p className="mono mb-2 text-[8px] tracking-widest text-muted-foreground uppercase">
        Зв&apos;язки
      </p>
      <ul className="flex flex-wrap gap-2">
        {links.map((l) => (
          <li
            key={`${l.source}-${l.target}-${String(l.sourceIsCanvasImage)}-${String(l.targetIsCanvasImage)}-${l.sourcePort ?? ""}-${l.targetPort ?? ""}-${l.sourceChildSlot ?? ""}`}
          >
            {readOnly ? (
              <span className="mono inline-block border border-border/20 px-2 py-1 text-[9px] text-muted-foreground normal-case">
                {endpointLabel(
                  l.source,
                  l.sourceIsCanvasImage,
                  nodes,
                  canvasImages,
                )}
                {l.sourceChildSlot != null
                  ? ` [${(l.sourcePort ?? "e").toUpperCase()}·${l.sourceChildSlot}]`
                  : ""}{" "}
                →{" "}
                {endpointLabel(
                  l.target,
                  l.targetIsCanvasImage,
                  nodes,
                  canvasImages,
                )}
              </span>
            ) : (
              <button
                type="button"
                className="mono border border-border/25 px-2 py-1 text-[9px] text-muted-foreground normal-case hover:border-destructive/40 hover:text-destructive"
                onClick={() => onRemoveLink(l.source, l.target)}
              >
                {endpointLabel(
                  l.source,
                  l.sourceIsCanvasImage,
                  nodes,
                  canvasImages,
                )}
                {l.sourceChildSlot != null
                  ? ` [${(l.sourcePort ?? "e").toUpperCase()}·${l.sourceChildSlot}]`
                  : ""}{" "}
                →{" "}
                {endpointLabel(
                  l.target,
                  l.targetIsCanvasImage,
                  nodes,
                  canvasImages,
                )}{" "}
                ✕
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

import { cn } from "@/lib/utils";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code2,
  Italic,
  Link2,
  type LucideIcon,
} from "lucide-react";
import { type SyntheticEvent } from "react";
import { createPortal } from "react-dom";
import type {
  NodeMdAlignKind,
  NodeMdFontKind,
  NodeMdHlKind,
} from "../utils/node-markdown-inline-hl";

type ToolbarPlacement = "above" | "below";

type Props = {
  open: boolean;
  anchorX: number;
  anchorY: number;
  placement: ToolbarPlacement;
  onHl: (kind: NodeMdHlKind) => void;
  onAlign: (kind: NodeMdAlignKind) => void;
  onFont: (kind: NodeMdFontKind) => void;
  onLink: () => void;
};

const HL_BTNS: { kind: NodeMdHlKind; label: string; preview: string }[] = [
  {
    kind: "border",
    label: "Рамка",
    preview:
      "border border-border/45 bg-transparent text-foreground shadow-none",
  },
  {
    kind: "accent",
    label: "Синій акцент",
    preview:
      "bg-[#5e86ff]/75 text-[#f2f6ff] italic ring-1 ring-[#8babff]/50 shadow-[0_0_10px_rgba(94,134,255,0.2)]",
  },
  {
    kind: "green",
    label: "Зелений",
    preview:
      "bg-emerald-400/95 text-emerald-950 ring-1 ring-emerald-500/45 shadow-[inset_0_0_0_1px_rgba(34,197,94,0.28)]",
  },
];

const ALIGN: { kind: NodeMdAlignKind; Icon: typeof AlignLeft; label: string }[] =
  [
    { kind: "left", Icon: AlignLeft, label: "Ліворуч" },
    { kind: "center", Icon: AlignCenter, label: "По центру" },
    { kind: "right", Icon: AlignRight, label: "Праворуч" },
  ];

const FONT_ICONS: {
  kind: NodeMdFontKind;
  Icon: LucideIcon | null;
  label: string;
  thinMark?: boolean;
}[] = [
  { kind: "italic", Icon: Italic, label: "Курсив" },
  { kind: "mono", Icon: Code2, label: "Код (моно)" },
  { kind: "bold", Icon: Bold, label: "Жирний" },
  { kind: "thin", Icon: null, label: "Легке накреслення", thinMark: true },
];

const DIVIDER = "border-t border-border/12 pt-1.5";

function stopToolbarPointer(e: SyntheticEvent) {
  e.preventDefault();
  e.stopPropagation();
}

export function MarkdownLineHighlightToolbar({
  open,
  anchorX,
  anchorY,
  placement,
  onHl,
  onAlign,
  onFont,
  onLink,
}: Props) {
  if (!open || typeof document === "undefined") return null;

  const transform =
    placement === "above"
      ? "translate(-50%, calc(-100% - 8px))"
      : "translate(-50%, 8px)";

  return createPortal(
    <div
      data-md-hl-toolbar=""
      className={cn(
        "pointer-events-auto fixed z-[300] min-w-[200px] max-w-[min(272px,calc(100vw-24px))] flex-col gap-1 rounded-md border border-border/30 bg-popover/93 p-1.5 shadow-[0_8px_24px_-14px_rgba(0,0,0,0.55)] backdrop-blur-sm",
      )}
      style={{ left: anchorX, top: anchorY, transform }}
      role="toolbar"
      aria-label="Стилі для виділеного тексту"
      onMouseDown={stopToolbarPointer}
      onPointerDown={stopToolbarPointer}
    >
      <div className="flex flex-wrap justify-center gap-0.5">
        {HL_BTNS.map(({ kind, label, preview }) => (
          <button
            key={kind}
            type="button"
            title={label}
            className="rounded-md px-1 py-0.5 text-[10px] font-medium text-foreground/85 hover:bg-muted/60"
            onPointerDown={(e) => {
              stopToolbarPointer(e);
              onHl(kind);
            }}
            onMouseDown={stopToolbarPointer}
          >
            <span
              className={cn(
                "inline-block min-w-[2.1rem] rounded px-1.5 py-0.5 font-mono text-[9px]",
                preview,
              )}
            >
              Aa
            </span>
          </button>
        ))}
      </div>

      <div
        className={cn("flex justify-center gap-0.5", DIVIDER)}
        role="group"
        aria-label="Вирівнювання"
      >
        {ALIGN.map(({ kind, Icon, label }) => (
          <button
            key={kind}
            type="button"
            title={label}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            onPointerDown={(e) => {
              stopToolbarPointer(e);
              onAlign(kind);
            }}
            onMouseDown={stopToolbarPointer}
          >
            <Icon className="size-3.5" strokeWidth={2} />
          </button>
        ))}
      </div>

      <div
        className={cn("flex justify-center gap-0.5", DIVIDER)}
        role="group"
        aria-label="Накреслення та шрифт"
      >
        {FONT_ICONS.map(({ kind, Icon, label, thinMark }) => (
          <button
            key={kind}
            type="button"
            title={label}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            onPointerDown={(e) => {
              stopToolbarPointer(e);
              onFont(kind);
            }}
            onMouseDown={stopToolbarPointer}
          >
            {thinMark ? (
              <span className="flex size-3.5 items-center justify-center text-[9px] font-extralight leading-none tracking-tight text-current">
                Aa
              </span>
            ) : (
              Icon && <Icon className="size-3.5" strokeWidth={2} />
            )}
          </button>
        ))}
      </div>

      <div className={cn(DIVIDER)}>
        <button
          type="button"
          title="Посилання в новій вкладці"
          className="flex w-full items-center justify-center gap-1.5 rounded-md py-1 text-[10px] font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground"
          onPointerDown={(e) => {
            stopToolbarPointer(e);
            onLink();
          }}
          onMouseDown={stopToolbarPointer}
        >
          <Link2 className="size-3.5" />
          Посилання
        </button>
      </div>
    </div>,
    document.body,
  );
}

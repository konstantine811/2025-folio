import { ChevronDown, ChevronUp } from "lucide-react";
import type {
  Slide,
  SlideBlock,
  SlideBlockAnimationTiming,
  SlideEntranceKind,
  SlideFontPreset,
  SlideLayoutMode,
  SlideTextAlign,
} from "../types/types";
import {
  DEFAULT_BODY_TEXT_SCALE,
  DEFAULT_HEADING_SCALE,
} from "./presentation-model";

const ENTRANCE_OPTIONS: { value: SlideEntranceKind; label: string }[] = [
  { value: "fade", label: "Згасання" },
  { value: "slide-up", label: "Знизу" },
  { value: "slide-left", label: "Зліва" },
  { value: "zoom", label: "Масштаб" },
  { value: "none", label: "Без анімації" },
];

const FONT_PRESETS: { value: SlideFontPreset; label: string }[] = [
  { value: "theme", label: "Стиль слайду" },
  { value: "sans", label: "Sans" },
  { value: "serif", label: "Serif" },
  { value: "mono", label: "Mono" },
];

const ALIGN_OPTIONS: { value: SlideTextAlign; label: string }[] = [
  { value: "left", label: "Ліворуч" },
  { value: "center", label: "По центру" },
  { value: "right", label: "Праворуч" },
];

interface PresentationInspectorProps {
  slide: Slide;
  selectedBlock: SlideBlock | null;
  readOnly: boolean;
  onChangeSlide: (next: Slide) => void;
  onChangeBlock: (blockId: string, patch: Partial<SlideBlock>) => void;
  onReorderBlock: (blockId: string, delta: -1 | 1) => void;
}

export function PresentationInspector({
  slide,
  selectedBlock,
  readOnly,
  onChangeSlide,
  onChangeBlock,
  onReorderBlock,
}: PresentationInspectorProps) {
  if (readOnly) return null;

  const timing = slide.blockAnimationTiming ?? "sequential";
  const layout: SlideLayoutMode = slide.slideLayout ?? "stack";
  const blocksSorted = [...(slide.blocks ?? [])].sort(
    (a, b) => a.order - b.order,
  );
  const selIdx = selectedBlock
    ? blocksSorted.findIndex((b) => b.id === selectedBlock.id)
    : -1;

  const applyLayoutMode = (next: SlideLayoutMode) => {
    if (next === "canvas") {
      onChangeSlide({
        ...slide,
        slideLayout: "canvas",
        blocks: blocksSorted.map((b, i) => ({
          ...b,
          leftPct: b.leftPct ?? 50,
          topPct: b.topPct ?? Math.min(22 + i * 14, 78),
          widthPct:
            b.widthPct ?? (b.kind === "image" ? 48 : 72),
        })),
      });
    } else {
      onChangeSlide({ ...slide, slideLayout: "stack" });
    }
  };

  return (
    <aside className="flex min-h-0 w-full shrink-0 flex-col self-stretch border-t border-border/25 bg-muted/40 xl:w-72 xl:self-stretch xl:border-t-0 xl:border-l xl:border-border/25">
      <div className="shrink-0 border-b border-border/20 px-3 py-2">
        <h3 className="font-sans text-[11px] font-semibold uppercase tracking-widest text-foreground">
          Слайд і блоки
        </h3>
      </div>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-3 py-3 text-[11px] text-foreground">
        <label className="block space-y-1.5">
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Розміщення на слайді
          </span>
          <select
            value={layout}
            onChange={(e) =>
              applyLayoutMode(e.target.value as SlideLayoutMode)
            }
            className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-[11px] text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="stack">Стовпчик (порядок перетягуванням)</option>
            <option value="canvas">Вільне положення (%)</option>
          </select>
        </label>

        <label className="block space-y-1.5">
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Поява блоків
          </span>
          <select
            value={timing}
            onChange={(e) =>
              onChangeSlide({
                ...slide,
                blockAnimationTiming: e.target
                  .value as SlideBlockAnimationTiming,
              })
            }
            className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-[11px] text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="together">Одночасно</option>
            <option value="sequential">По черзі</option>
          </select>
        </label>

        {selectedBlock ? (
          <div className="space-y-3 border-t border-border/20 pt-3">
            <p className="text-[10px] uppercase tracking-wide text-primary">
              Блок ({selectedBlock.kind})
            </p>

            {layout === "canvas" && blocksSorted.length > 1 ? (
              <div className="flex gap-1">
                <button
                  type="button"
                  disabled={selIdx <= 0}
                  onClick={() => onReorderBlock(selectedBlock.id, -1)}
                  className="mono flex flex-1 items-center justify-center gap-1 rounded border border-border/25 bg-muted/35 py-1.5 text-[10px] text-muted-foreground disabled:opacity-30"
                >
                  <ChevronUp className="size-3.5" />
                  Порядок ↑
                </button>
                <button
                  type="button"
                  disabled={selIdx < 0 || selIdx >= blocksSorted.length - 1}
                  onClick={() => onReorderBlock(selectedBlock.id, 1)}
                  className="mono flex flex-1 items-center justify-center gap-1 rounded border border-border/25 bg-muted/35 py-1.5 text-[10px] text-muted-foreground disabled:opacity-30"
                >
                  <ChevronDown className="size-3.5" />
                  Порядок ↓
                </button>
              </div>
            ) : null}

            {(selectedBlock.kind === "heading" ||
              selectedBlock.kind === "text") && (
              <>
                <label className="block space-y-1">
                  <span className="text-[10px] text-muted-foreground">Шрифт</span>
                  <select
                    value={selectedBlock.fontPreset ?? "theme"}
                    onChange={(e) =>
                      onChangeBlock(selectedBlock.id, {
                        fontPreset: e.target.value as SlideFontPreset,
                      })
                    }
                    className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-[11px] text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {FONT_PRESETS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block space-y-1">
                  <span className="text-[10px] text-muted-foreground">
                    Вирівнювання
                  </span>
                  <select
                    value={selectedBlock.textAlign ?? "left"}
                    onChange={(e) =>
                      onChangeBlock(selectedBlock.id, {
                        textAlign: e.target.value as SlideTextAlign,
                      })
                    }
                    className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-[11px] text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {ALIGN_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>
              </>
            )}

            {(selectedBlock.kind === "heading" ||
              selectedBlock.kind === "text") && (
              <label className="block space-y-1">
                <span className="text-[10px] text-muted-foreground">
                  {selectedBlock.kind === "heading"
                    ? "Розмір (× до базового заголовка)"
                    : "Розмір (× до заголовка на слайді)"}
                </span>
                <input
                  type="range"
                  min={0.2}
                  max={2}
                  step={0.02}
                  value={
                    selectedBlock.kind === "heading"
                      ? selectedBlock.scale ?? DEFAULT_HEADING_SCALE
                      : selectedBlock.scale ?? DEFAULT_BODY_TEXT_SCALE
                  }
                  onChange={(e) =>
                    onChangeBlock(selectedBlock.id, {
                      scale: Number(e.target.value),
                    })
                  }
                  className="w-full accent-primary"
                />
                <span className="text-[10px] text-muted-foreground">
                  {(
                    (selectedBlock.kind === "heading"
                      ? selectedBlock.scale ?? DEFAULT_HEADING_SCALE
                      : selectedBlock.scale ?? DEFAULT_BODY_TEXT_SCALE) * 100
                  ).toFixed(0)}
                  %
                </span>
              </label>
            )}

            {selectedBlock.kind === "image" && layout === "stack" ? (
              <label className="block space-y-1">
                <span className="text-[10px] text-muted-foreground">
                  Ширина зображення (%)
                </span>
                <input
                  type="range"
                  min={20}
                  max={200}
                  step={1}
                  value={selectedBlock.widthPct ?? 100}
                  onChange={(e) =>
                    onChangeBlock(selectedBlock.id, {
                      widthPct: Number(e.target.value),
                    })
                  }
                  className="w-full accent-primary"
                />
                <span className="text-[10px] text-muted-foreground">
                  {selectedBlock.widthPct ?? 100}%
                  {(selectedBlock.widthPct ?? 100) > 100
                    ? " — ширше за колонку (скрол)"
                    : ""}
                </span>
              </label>
            ) : null}

            {layout === "canvas" ? (
              <>
                <label className="block space-y-1">
                  <span className="text-[10px] text-muted-foreground">
                    Положення X (% від ширини)
                  </span>
                  <input
                    type="range"
                    min={5}
                    max={95}
                    step={1}
                    value={selectedBlock.leftPct ?? 50}
                    onChange={(e) =>
                      onChangeBlock(selectedBlock.id, {
                        leftPct: Number(e.target.value),
                      })
                    }
                    className="w-full accent-primary"
                  />
                  <span className="text-[10px] text-muted-foreground">
                    {selectedBlock.leftPct ?? 50}%
                  </span>
                </label>
                <label className="block space-y-1">
                  <span className="text-[10px] text-muted-foreground">
                    Положення Y (% від висоти)
                  </span>
                  <input
                    type="range"
                    min={5}
                    max={95}
                    step={1}
                    value={selectedBlock.topPct ?? 50}
                    onChange={(e) =>
                      onChangeBlock(selectedBlock.id, {
                        topPct: Number(e.target.value),
                      })
                    }
                    className="w-full accent-primary"
                  />
                  <span className="text-[10px] text-muted-foreground">
                    {selectedBlock.topPct ?? 50}%
                  </span>
                </label>
                <label className="block space-y-1">
                  <span className="text-[10px] text-muted-foreground">
                    Ширина блоку (%)
                  </span>
                  <input
                    type="range"
                    min={15}
                    max={200}
                    step={1}
                    value={selectedBlock.widthPct ?? 70}
                    onChange={(e) =>
                      onChangeBlock(selectedBlock.id, {
                        widthPct: Number(e.target.value),
                      })
                    }
                    className="w-full accent-primary"
                  />
                  <span className="text-[10px] text-muted-foreground">
                    {selectedBlock.widthPct ?? 70}%
                    {(selectedBlock.widthPct ?? 70) > 100
                      ? " — прокрутка полотна"
                      : ""}
                  </span>
                </label>
              </>
            ) : null}

            <label className="block space-y-1.5">
              <span className="text-[10px] text-muted-foreground">
                Анімація появи
              </span>
              <select
                value={selectedBlock.entrance ?? "fade"}
                onChange={(e) =>
                  onChangeBlock(selectedBlock.id, {
                    entrance: e.target.value as SlideEntranceKind,
                  })
                }
                className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-[11px] text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {ENTRANCE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>

            {(selectedBlock.kind === "heading" ||
              selectedBlock.kind === "text") && (
              <label className="block space-y-1">
                <span className="text-[10px] text-muted-foreground">Текст</span>
                <textarea
                  value={selectedBlock.text}
                  onChange={(e) =>
                    onChangeBlock(selectedBlock.id, {
                      text: e.target.value,
                    } as Partial<SlideBlock>)
                  }
                  rows={selectedBlock.kind === "heading" ? 2 : 6}
                  className="w-full resize-y rounded-md border border-input bg-background px-2 py-1.5 font-sans text-[11px] text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>
            )}

            {selectedBlock.kind === "image" && (
              <label className="block space-y-1">
                <span className="text-[10px] text-muted-foreground">Підпис</span>
                <input
                  type="text"
                  value={selectedBlock.caption ?? ""}
                  onChange={(e) =>
                    onChangeBlock(selectedBlock.id, {
                      caption: e.target.value || undefined,
                    })
                  }
                  className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-[11px] text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>
            )}
          </div>
        ) : (
          <p className="text-[10px] leading-relaxed text-muted-foreground">
            Оберіть блок на слайді — зʼявляться шрифт, розмір, анімація та (у
            режимі «Вільне положення») координати.
          </p>
        )}
      </div>
    </aside>
  );
}

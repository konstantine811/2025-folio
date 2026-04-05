import type {
  Slide,
  SlideBlock,
  SlideBlockAnimationTiming,
  SlideEntranceKind,
  SlideLayoutMode,
} from "../types/types";

export const PRESENTATION_DND_MIME = "application/x-nw-presentation-v1";

export function newSlideBlockId(): string {
  return `blk-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function newSlideId(): string {
  return `slide-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Типовий масштаб тексту відносно заголовка на слайді. */
export const DEFAULT_HEADING_SCALE = 1;
export const DEFAULT_BODY_TEXT_SCALE = 0.42;

export function normalizeSlide(slide: Slide): Slide {
  const layout: SlideLayoutMode = slide.slideLayout ?? "stack";
  if (slide.blocks && slide.blocks.length > 0) {
    const sorted = [...slide.blocks].sort((a, b) => a.order - b.order);
    return {
      ...slide,
      slideLayout: layout,
      blockAnimationTiming:
        slide.blockAnimationTiming ?? ("sequential" as SlideBlockAnimationTiming),
      blocks: sorted.map((b, i) => ({ ...b, order: i })),
    };
  }
  const blocks: SlideBlock[] = [];
  let order = 0;
  if (slide.title?.trim()) {
    blocks.push({
      id: newSlideBlockId(),
      kind: "heading",
      order: order++,
      text: slide.title.trim(),
      scale: DEFAULT_HEADING_SCALE,
      entrance: "fade",
    });
  }
  const legacy = slide.content?.trim();
  if (legacy) {
    blocks.push({
      id: newSlideBlockId(),
      kind: "text",
      order: order++,
      text: legacy,
      scale: DEFAULT_BODY_TEXT_SCALE,
      entrance: "fade",
    });
  }
  return {
    ...slide,
    slideLayout: layout,
    blocks,
    blockAnimationTiming:
      slide.blockAnimationTiming ?? ("sequential" as SlideBlockAnimationTiming),
  };
}

export function normalizeSlides(slides: Slide[]): Slide[] {
  return slides.map(normalizeSlide);
}

export function newEmptySlide(): Slide {
  return {
    id: newSlideId(),
    title: "Новий слайд",
    blocks: [],
    blockAnimationTiming: "sequential",
  };
}

export function entranceClass(entrance?: SlideEntranceKind): string {
  switch (entrance) {
    case "none":
      return "";
    case "slide-up":
      return "slide-in-from-bottom-6";
    case "slide-left":
      return "slide-in-from-left-6";
    case "zoom":
      return "zoom-in-95";
    case "fade":
    default:
      return "fade-in";
  }
}

export type DndPayload =
  | { type: "heading"; nodeId: string; text: string }
  | {
      type: "text";
      nodeId: string;
      markdownBlockId: string;
      text: string;
    }
  | { type: "image-node"; nodeId: string; url: string }
  | { type: "image-canvas"; canvasImageId: string; url: string };

/** Ключі для підсвітки «вже на слайдах» у лівій панелі. */
export function usedSourceKeyHeading(nodeId: string): string {
  return `h:${nodeId}`;
}

export function usedSourceKeyText(nodeId: string, markdownBlockId: string): string {
  return `t:${nodeId}:${markdownBlockId}`;
}

export function usedSourceKeyImageNode(nodeId: string): string {
  return `in:${nodeId}`;
}

export function usedSourceKeyCanvasImage(canvasImageId: string): string {
  return `ic:${canvasImageId}`;
}

/** Збирає ключі джерел, які вже використані в будь-якому слайді. */
/** Для нового блоку в режимі `canvas`: типові координати, якщо ще не задані. */
export function applyCanvasPlacementToNewBlock(
  slide: Slide,
  block: SlideBlock,
  existingBlockCount: number,
): SlideBlock {
  if ((slide.slideLayout ?? "stack") !== "canvas") return block;
  return {
    ...block,
    leftPct: block.leftPct ?? 50,
    topPct: block.topPct ?? Math.min(22 + existingBlockCount * 14, 78),
    widthPct:
      block.widthPct ?? (block.kind === "image" ? 48 : 72),
  } as SlideBlock;
}

export function collectUsedSourceKeys(slides: Slide[]): Set<string> {
  const set = new Set<string>();
  for (const slide of slides) {
    for (const b of slide.blocks ?? []) {
      if (b.kind === "heading" && b.sourceNodeId) {
        set.add(usedSourceKeyHeading(b.sourceNodeId));
      }
      if (b.kind === "text" && b.sourceNodeId && b.markdownBlockId) {
        set.add(usedSourceKeyText(b.sourceNodeId, b.markdownBlockId));
      }
      if (b.kind === "image" && b.sourceNodeId) {
        set.add(usedSourceKeyImageNode(b.sourceNodeId));
      }
      if (b.kind === "image" && b.sourceCanvasImageId) {
        set.add(usedSourceKeyCanvasImage(b.sourceCanvasImageId));
      }
    }
  }
  return set;
}

export function parseDropPayload(json: string): DndPayload | null {
  try {
    const o = JSON.parse(json) as DndPayload;
    if (!o || typeof o !== "object" || !("type" in o)) return null;
    return o;
  } catch {
    return null;
  }
}

export function payloadToBlock(
  payload: DndPayload,
  order: number,
): SlideBlock {
  const entrance: SlideEntranceKind = "fade";
  switch (payload.type) {
    case "heading":
      return {
        id: newSlideBlockId(),
        kind: "heading",
        order,
        text: payload.text,
        sourceNodeId: payload.nodeId,
        scale: DEFAULT_HEADING_SCALE,
        entrance,
      };
    case "text":
      return {
        id: newSlideBlockId(),
        kind: "text",
        order,
        text: payload.text,
        sourceNodeId: payload.nodeId,
        markdownBlockId: payload.markdownBlockId,
        scale: DEFAULT_BODY_TEXT_SCALE,
        entrance,
      };
    case "image-node":
      return {
        id: newSlideBlockId(),
        kind: "image",
        order,
        url: payload.url,
        sourceNodeId: payload.nodeId,
        entrance,
      };
    case "image-canvas":
      return {
        id: newSlideBlockId(),
        kind: "image",
        order,
        url: payload.url,
        sourceCanvasImageId: payload.canvasImageId,
        entrance,
      };
    default:
      return {
        id: newSlideBlockId(),
        kind: "text",
        order,
        text: "",
        scale: DEFAULT_BODY_TEXT_SCALE,
        entrance,
      };
  }
}

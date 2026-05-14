import {
  memo,
  useEffect,
  useRef,
  type ComponentProps,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type { Viewport } from "pixi-viewport";
import { resolveNodeWriterMediaUrlForDisplay } from "@/services/firebase/node-writer-workspace";
import { NodeMarkdownBlocksEditor } from "../components/NodeMarkdownBlocksEditor";
import { MarkdownResolvingImg } from "../components/MarkdownResolvingImg";
import { NODE_PORT_HANDLE_PX } from "../constants";
import { descriptionFromBlocks } from "../utils/node-markdown-blocks";
import { nodeTextThemeFromAccent } from "../utils/node-accent";
import { parseHexRgb, relativeLuminance } from "../utils/node-accent";
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
  unwrapMarkdownImageCandidate,
  updateNodeAccentColor,
  updateNodeBlocks,
  updateNodeHeadingLevel,
  updateNodeLabel,
} from "./nodeOverlayHelpers";

type NodeMarkdownBlocksEditorProps = ComponentProps<
  typeof NodeMarkdownBlocksEditor
>;

const MemoNodeMarkdownBlocksEditor = memo(
  NodeMarkdownBlocksEditor,
  (
    prev: Readonly<NodeMarkdownBlocksEditorProps>,
    next: Readonly<NodeMarkdownBlocksEditorProps>,
  ) =>
    prev.nodeId === next.nodeId &&
    prev.blocks === next.blocks &&
    prev.selectionEditorMode === next.selectionEditorMode &&
    prev.isDarkMode === next.isDarkMode &&
    prev.isSelectionOwner === next.isSelectionOwner &&
    prev.uploadPasteImage === next.uploadPasteImage,
);

const MDX_CANVAS_TYPO = {
  contentPaddingX: 32,
  contentPaddingTop: 24.5,
  contentPaddingBottom: 12,
  bodySize: 16.32,
  bodyLineHeight: 28.1,
  paragraphGap: 14.3,
  headingGapTop: 4,
  headingGapBottom: 12,
  heading: {
    1: { size: 32, weight: 800 },
    2: { size: 27.2, weight: 750 },
    3: { size: 23.2, weight: 700 },
    4: { size: 20, weight: 650 },
    5: { size: 17.6, weight: 620 },
    6: { size: 15.68, weight: 600 },
  },
  headingLineHeight: 1.32,
  listMarginTop: 4,
  listMarginBottom: 16,
  listPaddingLeft: 28.8,
  listMarkerGap: 4,
  listItemGap: 5.4,
  codeSize: 13.76,
  codeLineHeight: 22,
  codePaddingX: 10,
  codePaddingY: 9,
  codeHeaderHeight: 38,
  codeGutterWidth: 44,
  inlineCodePaddingX: 5.6,
  inlineCodeHeight: 22,
  inlineCodeRadius: 4,
  taskBoxSize: 18,
  taskBoxRadius: 4,
  taskTextGap: 18,
  thematicBreakGapTop: 8,
  thematicBreakGapBottom: 14,
} as const;

const MDX_CANVAS_CODE_FONT =
  '"Roboto Mono", "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace';

type InlineTextUnit = {
  text: string;
  isCode: boolean;
  isBold: boolean;
  isItalic: boolean;
  isStrike: boolean;
  width: number;
};

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function decodeMarkdownCanvasEntities(text: string) {
  return text
    .replace(/&amp;/gi, "&")
    .replace(/&#x20;|&#32;|&nbsp;/gi, " ")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'");
}

function unescapeMarkdownCanvasText(text: string) {
  return decodeMarkdownCanvasEntities(text).replace(
    /\\([\\`*_[\]{}()#+\-.!|=<>])/g,
    "$1",
  );
}

function splitMarkdownCanvasIndent(text: string) {
  const leadingSpaces = text.match(/^ +/)?.[0].length ?? 0;
  if (leadingSpaces === 0) {
    return { indent: 0, text };
  }

  return {
    indent: Math.ceil(leadingSpaces / 2) * MDX_CANVAS_TYPO.listPaddingLeft,
    text: text.slice(leadingSpaces),
  };
}

function extractMarkdownCanvasImage(
  line: string,
): { src: string; alt: string } | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  const markdownImage = trimmed.match(/^!\[([^\]]*)]\((.+?)\)$/);
  if (markdownImage) {
    return {
      alt: markdownImage[1] ?? "",
      src: unwrapMarkdownImageCandidate(markdownImage[2] ?? ""),
    };
  }

  const rawImage = trimmed.match(
    /^<img\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/i,
  );
  if (rawImage) {
    const alt = trimmed.match(/\balt\s*=\s*["']([^"']*)["']/i)?.[1] ?? "";
    return {
      alt,
      src: rawImage[1] ?? "",
    };
  }

  return null;
}

function isMarkdownCanvasThematicBreak(line: string): boolean {
  const trimmed = line.trim();
  return (
    /^(?:\*\s*){3,}$/.test(trimmed) ||
    /^(?:-\s*){3,}$/.test(trimmed) ||
    /^(?:_\s*){3,}$/.test(trimmed)
  );
}

function blocksContainMarkdownImage(blocks: NodeMarkdownBlock[]): boolean {
  return descriptionFromBlocks(blocks)
    .split("\n")
    .some((line) => extractMarkdownCanvasImage(line) !== null);
}

function labelForCodeFenceLanguage(language: string) {
  const normalized = language.trim().toLowerCase();
  if (
    normalized === "tsx" ||
    normalized === "jsx" ||
    normalized === "typescriptreact"
  ) {
    return "TypeScript JSX";
  }
  if (normalized === "ts" || normalized === "typescript") return "TypeScript";
  if (normalized === "js" || normalized === "javascript") return "JavaScript";
  if (normalized === "json") return "JSON";
  if (normalized === "css") return "CSS";
  if (normalized === "html") return "HTML";
  if (normalized === "bash" || normalized === "sh" || normalized === "shell") {
    return "Shell";
  }
  return language.trim() || "TypeScript JSX";
}

function drawMarkdownCanvasCodeLine(
  ctx: CanvasRenderingContext2D,
  line: string,
  x: number,
  y: number,
  maxWidth: number,
  colors: {
    fg: string;
    keyword: string;
    variable: string;
    type: string;
    property: string;
    tag: string;
    number: string;
    operator: string;
    punctuation: string;
    comment: string;
    string: string;
  },
) {
  const tokenPattern =
    /(\/\/.*$|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b[A-Za-z_$][\w$]*\b|\b\d+(?:\.\d+)?\b|[=:+\-*/<>.,;{}()[\]])/g;
  let cursorX = x;
  let index = 0;
  const keywordPattern =
    /^(?:const|let|var|type|interface|return|if|else|for|while|function|import|from|export|default|as|new|extends|number|string|boolean|void|null|undefined|true|false)$/;

  const drawToken = (text: string, fill: string, italic = false) => {
    if (!text || cursorX > x + maxWidth) return;
    ctx.font = `${italic ? "italic " : ""}400 ${MDX_CANVAS_TYPO.codeSize}px ${MDX_CANVAS_CODE_FONT}`;
    ctx.fillStyle = fill;
    const clipped =
      cursorX + ctx.measureText(text).width > x + maxWidth
        ? text.slice(0, Math.max(0, Math.floor((x + maxWidth - cursorX) / 8)))
        : text;
    ctx.fillText(clipped, cursorX, y);
    cursorX += ctx.measureText(clipped).width;
  };

  for (const match of line.matchAll(tokenPattern)) {
    const matchText = match[0];
    const matchIndex = match.index ?? 0;
    drawToken(line.slice(index, matchIndex), colors.fg);

    if (matchText.startsWith("//")) {
      drawToken(matchText, colors.comment, true);
    } else if (/^["'`]/.test(matchText)) {
      drawToken(matchText, colors.string);
    } else if (/^\d/.test(matchText)) {
      drawToken(matchText, colors.number);
    } else if (/^[=:+\-*/]$/.test(matchText)) {
      drawToken(matchText, colors.operator);
    } else if (/^[<>]$/.test(matchText)) {
      drawToken(matchText, colors.tag);
    } else if (/^[.,;{}()[\]]$/.test(matchText)) {
      drawToken(matchText, colors.punctuation);
    } else if (keywordPattern.test(matchText)) {
      drawToken(matchText, colors.keyword);
    } else if (/^[A-Z]/.test(matchText)) {
      const before = line.slice(0, matchIndex).trimEnd();
      drawToken(matchText, before.endsWith("<") ? colors.tag : colors.type);
    } else if (/^\s*=/.test(line.slice(matchIndex + matchText.length))) {
      drawToken(matchText, colors.property);
    } else {
      drawToken(matchText, colors.variable);
    }

    index = matchIndex + matchText.length;
  }

  drawToken(line.slice(index), colors.fg);
}

type InlineTextStyle = Pick<
  InlineTextUnit,
  "isCode" | "isBold" | "isItalic" | "isStrike"
>;

function fontForInlineUnit(unit: InlineTextStyle, baseFont: string) {
  if (unit.isCode) {
    return `${unit.isItalic ? "italic " : ""}${
      unit.isBold ? "700 " : ""
    }${MDX_CANVAS_TYPO.codeSize}px ${MDX_CANVAS_CODE_FONT}`;
  }

  let font = baseFont;
  if (unit.isBold) {
    if (/^(italic\s+)?(normal|400)\s+/i.test(font)) {
      font = font.replace(/^(italic\s+)?(normal|400)\s+/i, "$1700 ");
    } else if (/^(italic\s+)?[1-5]00\s+/i.test(font)) {
      font = font.replace(/^(italic\s+)?[1-5]00\s+/i, "$1700 ");
    } else if (!/^(italic\s+)?[6-9]00\s+/i.test(font)) {
      font = `700 ${font}`;
    }
  }
  if (unit.isItalic && !/^italic\s+/i.test(font)) {
    font = `italic ${font}`;
  }
  return font;
}

function parseStyledInlineText(
  text: string,
  style: InlineTextStyle,
): Array<Omit<InlineTextUnit, "width">> {
  const units: Array<Omit<InlineTextUnit, "width">> = [];
  let index = 0;

  const pushPlain = (value: string, nextStyle = style) => {
    if (!value) return;
    units.push({ text: value, ...nextStyle });
  };

  while (index < text.length) {
    const remaining = text.slice(index);
    const codeMatch = remaining.match(/^`([^`]+)`/);
    if (codeMatch) {
      pushPlain(codeMatch[1]!, { ...style, isCode: true });
      index += codeMatch[0].length;
      continue;
    }

    const delimiter =
      remaining.startsWith("**") || remaining.startsWith("__")
        ? remaining.slice(0, 2)
        : remaining.startsWith("~~")
          ? "~~"
          : remaining.startsWith("*") || remaining.startsWith("_")
            ? remaining[0]
            : null;

    if (delimiter) {
      const closeIndex = text.indexOf(delimiter, index + delimiter.length);
      if (closeIndex !== -1) {
        const inner = text.slice(index + delimiter.length, closeIndex);
        const nextStyle = {
          ...style,
          isBold: style.isBold || delimiter === "**" || delimiter === "__",
          isItalic: style.isItalic || delimiter === "*" || delimiter === "_",
          isStrike: style.isStrike || delimiter === "~~",
        };
        units.push(...parseStyledInlineText(inner, nextStyle));
        index = closeIndex + delimiter.length;
        continue;
      }
    }

    const nextMarkers = ["`", "**", "__", "~~", "*", "_"]
      .map((marker) => text.indexOf(marker, index + 1))
      .filter((markerIndex) => markerIndex !== -1);
    const nextIndex = nextMarkers.length
      ? Math.min(...nextMarkers)
      : text.length;
    pushPlain(text.slice(index, nextIndex));
    index = nextIndex;
  }

  return units;
}

function toInlineTextUnits(ctx: CanvasRenderingContext2D, text: string) {
  const units: InlineTextUnit[] = [];
  const baseFont = ctx.font;
  const linked = unescapeMarkdownCanvasText(text)
    .replace(/!\[([^\]]*)]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .replace(/<[^>]+>/g, "")
    .trimEnd();

  const inlineUnits = parseStyledInlineText(linked, {
    isCode: false,
    isBold: false,
    isItalic: false,
    isStrike: false,
  });

  for (const inlineUnit of inlineUnits) {
    const words = inlineUnit.text.split(/(\s+)/).filter(Boolean);
    for (const word of words) {
      if (!word.trim()) {
        ctx.font = fontForInlineUnit(inlineUnit, baseFont);
        units.push({
          ...inlineUnit,
          text: " ",
          width: ctx.measureText(" ").width,
        });
        ctx.font = baseFont;
        continue;
      }

      ctx.font = fontForInlineUnit(inlineUnit, baseFont);
      const width =
        ctx.measureText(word).width +
        (inlineUnit.isCode ? MDX_CANVAS_TYPO.inlineCodePaddingX * 2 : 0);
      ctx.font = baseFont;
      units.push({ ...inlineUnit, text: word, width });
    }
  }

  return units;
}

function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxY: number,
  colors?: {
    codeBg: string;
    codeBorder: string;
    strike?: string;
  },
) {
  const baseFont = ctx.font;
  const units = toInlineTextUnits(ctx, text).filter(
    (unit, index, all) =>
      unit.text !== " " ||
      (index > 0 && index < all.length - 1 && all[index - 1]?.text !== " "),
  );
  if (units.length === 0) return y + lineHeight;

  let lineUnits: InlineTextUnit[] = [];
  let lineWidth = 0;

  const drawLine = () => {
    let cursorX = x;

    for (const unit of lineUnits) {
      if (unit.text === " ") {
        cursorX += unit.width;
        continue;
      }

      const unitFont = fontForInlineUnit(unit, baseFont);

      if (unit.isCode && colors) {
        const pillWidth = unit.width;
        const pillHeight = MDX_CANVAS_TYPO.inlineCodeHeight;
        const pillY = y + (MDX_CANVAS_TYPO.bodySize - pillHeight) / 2;
        const textFill = ctx.fillStyle;
        drawRoundedRect(
          ctx,
          cursorX,
          pillY,
          pillWidth,
          pillHeight,
          MDX_CANVAS_TYPO.inlineCodeRadius,
        );
        ctx.fillStyle = colors.codeBg;
        ctx.fill();
        ctx.strokeStyle = colors.codeBorder;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.font = unitFont;
        ctx.fillStyle = textFill;
        ctx.fillText(
          unit.text,
          cursorX + MDX_CANVAS_TYPO.inlineCodePaddingX,
          y + (MDX_CANVAS_TYPO.bodySize - MDX_CANVAS_TYPO.codeSize) / 2,
        );
        ctx.font = baseFont;
        ctx.fillStyle = textFill;
      } else {
        ctx.font = unitFont;
        ctx.fillText(unit.text, cursorX, y);
        ctx.font = baseFont;
      }

      if (unit.isStrike && colors?.strike) {
        ctx.strokeStyle = colors.strike;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cursorX, y + MDX_CANVAS_TYPO.bodySize * 0.58);
        ctx.lineTo(cursorX + unit.width, y + MDX_CANVAS_TYPO.bodySize * 0.58);
        ctx.stroke();
      }

      cursorX += unit.width;
    }

    if (colors?.strike) {
      ctx.strokeStyle = colors.strike;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y + MDX_CANVAS_TYPO.bodySize * 0.58);
      ctx.lineTo(cursorX, y + MDX_CANVAS_TYPO.bodySize * 0.58);
      ctx.stroke();
    }
  };

  for (const unit of units) {
    const canWrap = lineUnits.length > 0 && unit.text !== " ";
    if (canWrap && lineWidth + unit.width > maxWidth) {
      drawLine();
      y += lineHeight;
      if (y > maxY) return y;
      lineUnits = unit.text === " " ? [] : [unit];
      lineWidth = unit.text === " " ? 0 : unit.width;
    } else {
      lineUnits.push(unit);
      lineWidth += unit.width;
    }
  }
  if (lineUnits.length > 0 && y <= maxY) {
    drawLine();
  }
  return y + lineHeight;
}

function MarkdownBlocksPreview({
  blocks,
  isDark,
  nodeId,
}: {
  blocks: NodeMarkdownBlock[];
  isDark: boolean;
  nodeId: string;
}) {
  return blocksContainMarkdownImage(blocks) ? (
    <MarkdownReadonlyMdxPreview
      blocks={blocks}
      isDark={isDark}
      nodeId={nodeId}
    />
  ) : (
    <MarkdownCanvasPreview blocks={blocks} isDark={isDark} />
  );
}

function MarkdownReadonlyMdxPreview({
  blocks,
  isDark,
  nodeId,
}: {
  blocks: NodeMarkdownBlock[];
  isDark: boolean;
  nodeId: string;
}) {
  return (
    <MemoNodeMarkdownBlocksEditor
      nodeId={`${nodeId}-preview`}
      blocks={blocks}
      selectionEditorMode="toolbar"
      isDarkMode={isDark}
      isSelectionOwner={false}
      uploadPasteImage={async () => ""}
      onBlocksChange={() => {}}
    />
  );
}

function MarkdownCanvasPreview({
  blocks,
  isDark,
}: {
  blocks: NodeMarkdownBlock[];
  isDark: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageCacheRef = useRef<
    Map<
      string,
      | { status: "loading" }
      | { status: "loaded"; image: HTMLImageElement }
      | { status: "error" }
    >
  >(new Map());

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;
    let disposed = false;
    let redrawFrame = 0;

    const requestRedraw = () => {
      if (disposed) return;
      window.cancelAnimationFrame(redrawFrame);
      redrawFrame = window.requestAnimationFrame(draw);
    };

    const loadPreviewImage = (src: string) => {
      const candidate = unwrapMarkdownImageCandidate(src);
      if (!candidate) return null;

      const cached = imageCacheRef.current.get(candidate);
      if (cached) return cached;

      const loading = { status: "loading" as const };
      imageCacheRef.current.set(candidate, loading);

      void resolveNodeWriterMediaUrlForDisplay(candidate)
        .then((resolved) => {
          if (disposed) return;
          if (!resolved) {
            imageCacheRef.current.set(candidate, { status: "error" });
            requestRedraw();
            return;
          }

          const image = new Image();
          image.onload = () => {
            imageCacheRef.current.set(candidate, { status: "loaded", image });
            requestRedraw();
          };
          image.onerror = () => {
            imageCacheRef.current.set(candidate, { status: "error" });
            requestRedraw();
          };
          image.src = resolved;
          if (image.complete && image.naturalWidth > 0) {
            imageCacheRef.current.set(candidate, { status: "loaded", image });
            requestRedraw();
          }
        })
        .catch(() => {
          if (!disposed) {
            imageCacheRef.current.set(candidate, { status: "error" });
            requestRedraw();
          }
        });

      return loading;
    };

    const draw = () => {
      const cssWidth = Math.max(1, Math.floor(parent.clientWidth));
      const cssHeight = Math.max(1, Math.floor(parent.clientHeight));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(cssWidth * dpr);
      canvas.height = Math.floor(cssHeight * dpr);
      canvas.style.width = `${cssWidth}px`;
      canvas.style.height = `${cssHeight}px`;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cssWidth, cssHeight);
      ctx.textBaseline = "top";

      const fg = isDark ? "rgba(244,244,245,0.86)" : "rgba(24,24,27,0.82)";
      const muted = isDark ? "rgba(212,212,216,0.58)" : "rgba(63,63,70,0.62)";
      const codeBg = isDark ? "rgba(8,13,24,0.82)" : "rgba(244,247,252,0.94)";
      const codeBorder = isDark
        ? "rgba(148,163,184,0.16)"
        : "rgba(15,23,42,0.12)";
      const codeHeaderBg = isDark
        ? "rgba(24,24,27,0.92)"
        : "rgba(232,232,232,0.94)";
      const codeBodyBg = isDark
        ? "rgba(8,13,24,0.72)"
        : "rgba(255,255,255,0.94)";
      const codeGutterBg = isDark
        ? "rgba(30,41,59,0.72)"
        : "rgba(239,245,255,0.88)";
      const codeHeaderControlBg = isDark
        ? "rgba(3,7,18,0.72)"
        : "rgba(255,251,252,0.86)";
      const codeSyntax = isDark
        ? {
            fg: "rgba(226,232,240,0.9)",
            keyword: "rgba(147,197,253,0.92)",
            variable: "rgba(252,165,165,0.9)",
            type: "rgba(253,224,171,0.92)",
            property: "rgba(251,191,36,0.9)",
            tag: "rgba(216,180,254,0.9)",
            number: "rgba(125,211,252,0.92)",
            operator: "rgba(190,242,100,0.78)",
            punctuation: "rgba(226,232,240,0.86)",
            comment: "rgba(148,163,184,0.82)",
            string: "rgba(253,186,116,0.9)",
          }
        : {
            fg: "rgba(17,24,39,0.92)",
            keyword: "rgba(82,120,172,0.9)",
            variable: "rgba(207,122,98,0.9)",
            type: "rgba(232,196,120,0.9)",
            property: "rgba(228,190,107,0.92)",
            tag: "rgba(177,130,171,0.88)",
            number: "rgba(116,188,207,0.9)",
            operator: "rgba(127,161,91,0.86)",
            punctuation: "rgba(17,24,39,0.9)",
            comment: "rgba(100,116,139,0.74)",
            string: "rgba(184,118,62,0.9)",
          };
      const taskCheckedBg = isDark
        ? "rgba(96,165,250,0.92)"
        : "rgba(59, 102, 222, 0.95)";
      const taskUncheckedBg = isDark
        ? "rgba(24,24,27,0.56)"
        : "rgba(255,255,255,0.9)";
      const taskUncheckedBorder = isDark
        ? "rgba(244,244,245,0.18)"
        : "rgba(15,23,42,0.14)";
      const taskStrike = isDark
        ? "rgba(244,244,245,0.72)"
        : "rgba(24,24,27,0.72)";
      const imageBg = isDark ? "rgba(8,13,24,0.45)" : "rgba(255,255,255,0.7)";
      const imageBorder = isDark
        ? "rgba(125,211,252,0.18)"
        : "rgba(14,165,233,0.18)";

      let y: number = MDX_CANVAS_TYPO.contentPaddingTop;
      const x = MDX_CANVAS_TYPO.contentPaddingX;
      const maxWidth = Math.max(20, cssWidth - x - 16);
      const maxY = cssHeight - MDX_CANVAS_TYPO.contentPaddingBottom;
      let inCode = false;
      let codeLines: string[] = [];
      let codeLanguage = "";
      let paragraphLines: string[] = [];

      const lines = descriptionFromBlocks(blocks).split("\n");

      const flushParagraph = () => {
        if (paragraphLines.length === 0) return;

        ctx.font = `${MDX_CANVAS_TYPO.bodySize}px Inter, ui-sans-serif, system-ui, sans-serif`;
        ctx.fillStyle = fg;
        for (const paragraphLine of paragraphLines) {
          const { indent, text } = splitMarkdownCanvasIndent(paragraphLine);
          y = drawWrappedText(
            ctx,
            text,
            x + indent,
            y,
            maxWidth - indent,
            MDX_CANVAS_TYPO.bodyLineHeight,
            maxY,
            { codeBg, codeBorder },
          );
        }
        y += MDX_CANVAS_TYPO.paragraphGap;
        paragraphLines = [];
      };

      const flushCodeBlock = () => {
        const blockX = x - 8;
        const blockY = y;
        const blockWidth = maxWidth + 16;
        const bodyY = blockY + MDX_CANVAS_TYPO.codeHeaderHeight;
        const blockHeight =
          MDX_CANVAS_TYPO.codeHeaderHeight +
          MDX_CANVAS_TYPO.codePaddingY * 2 +
          Math.max(1, codeLines.length) * MDX_CANVAS_TYPO.codeLineHeight;
        const textX =
          blockX +
          MDX_CANVAS_TYPO.codeGutterWidth +
          MDX_CANVAS_TYPO.codePaddingX;
        let textY = bodyY + MDX_CANVAS_TYPO.codePaddingY;

        drawRoundedRect(ctx, blockX, blockY, blockWidth, blockHeight, 8);
        ctx.fillStyle = codeBodyBg;
        ctx.fill();
        ctx.strokeStyle = codeBorder;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.save();
        drawRoundedRect(
          ctx,
          blockX,
          blockY,
          blockWidth,
          MDX_CANVAS_TYPO.codeHeaderHeight,
          8,
        );
        ctx.clip();
        ctx.fillStyle = codeHeaderBg;
        ctx.fillRect(
          blockX,
          blockY,
          blockWidth,
          MDX_CANVAS_TYPO.codeHeaderHeight,
        );
        ctx.restore();

        ctx.strokeStyle = codeBorder;
        ctx.beginPath();
        ctx.moveTo(blockX, bodyY);
        ctx.lineTo(blockX + blockWidth, bodyY);
        ctx.stroke();

        ctx.fillStyle = codeGutterBg;
        ctx.fillRect(
          blockX,
          bodyY,
          MDX_CANVAS_TYPO.codeGutterWidth,
          blockHeight - MDX_CANVAS_TYPO.codeHeaderHeight,
        );

        const dotY = blockY + 18;
        for (const [dotIndex, color] of [
          "rgba(255,95,87,0.96)",
          "rgba(255,189,46,0.96)",
          "rgba(39,201,63,0.96)",
        ].entries()) {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(blockX + 18 + dotIndex * 14, dotY, 5.2, 0, Math.PI * 2);
          ctx.fill();
        }

        const label = labelForCodeFenceLanguage(codeLanguage);
        ctx.font = `600 13px Inter, ui-sans-serif, system-ui, sans-serif`;
        const labelWidth = Math.min(150, ctx.measureText(label).width + 42);
        const labelX = blockX + 58;
        drawRoundedRect(ctx, labelX, blockY + 7, labelWidth, 24, 7);
        ctx.fillStyle = codeHeaderControlBg;
        ctx.fill();
        ctx.strokeStyle = codeBorder;
        ctx.stroke();
        ctx.fillStyle = fg;
        ctx.textBaseline = "middle";
        ctx.fillText(label, labelX + 14, blockY + 19);
        ctx.textBaseline = "top";
        ctx.strokeStyle = muted;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(labelX + labelWidth - 18, blockY + 17);
        ctx.lineTo(labelX + labelWidth - 13, blockY + 22);
        ctx.lineTo(labelX + labelWidth - 8, blockY + 17);
        ctx.stroke();

        const copyX = blockX + blockWidth - 28;
        const copyY = blockY + 10;
        drawRoundedRect(ctx, copyX - 4, copyY - 4, 22, 22, 6);
        ctx.fillStyle = codeHeaderControlBg;
        ctx.fill();
        ctx.strokeStyle = codeBorder;
        ctx.stroke();
        ctx.strokeStyle = fg;
        ctx.lineWidth = 1.2;
        ctx.strokeRect(copyX + 3, copyY + 4, 9, 10);
        ctx.strokeRect(copyX, copyY, 9, 10);

        ctx.font = `400 ${MDX_CANVAS_TYPO.codeSize}px ${MDX_CANVAS_CODE_FONT}`;
        for (const [lineIndex, codeLine] of (codeLines.length > 0
          ? codeLines
          : [""]
        ).entries()) {
          if (textY <= maxY) {
            ctx.fillStyle = muted;
            const lineNumber = String(lineIndex + 1);
            ctx.fillText(
              lineNumber,
              blockX +
                MDX_CANVAS_TYPO.codeGutterWidth -
                MDX_CANVAS_TYPO.codePaddingX -
                ctx.measureText(lineNumber).width,
              textY,
            );
            drawMarkdownCanvasCodeLine(
              ctx,
              codeLine,
              textX,
              textY,
              blockWidth -
                MDX_CANVAS_TYPO.codeGutterWidth -
                MDX_CANVAS_TYPO.codePaddingX * 2,
              codeSyntax,
            );
          }
          textY += MDX_CANVAS_TYPO.codeLineHeight;
        }

        y += blockHeight + MDX_CANVAS_TYPO.paragraphGap;
        codeLines = [];
        codeLanguage = "";
      };

      const drawImageBlock = (imageLine: { src: string; alt: string }) => {
        flushParagraph();
        const imageState = loadPreviewImage(imageLine.src);
        const blockX = x - 8;
        const blockWidth = maxWidth + 16;
        const maxBlockHeight = Math.max(72, Math.min(320, maxY - y));
        if (maxBlockHeight <= 0) return;

        let blockHeight = Math.min(220, maxBlockHeight);
        if (imageState?.status === "loaded") {
          const naturalW =
            imageState.image.naturalWidth || imageState.image.width || 1;
          const naturalH =
            imageState.image.naturalHeight || imageState.image.height || 1;
          blockHeight = Math.min(
            maxBlockHeight,
            Math.max(72, blockWidth * (naturalH / naturalW)),
          );
        }

        drawRoundedRect(ctx, blockX, y, blockWidth, blockHeight, 12);
        ctx.fillStyle = imageBg;
        ctx.fill();
        ctx.strokeStyle = imageBorder;
        ctx.lineWidth = 1;
        ctx.stroke();

        if (imageState?.status === "loaded") {
          const image = imageState.image;
          const naturalW = image.naturalWidth || image.width || 1;
          const naturalH = image.naturalHeight || image.height || 1;
          const fitScale = Math.min(
            blockWidth / naturalW,
            blockHeight / naturalH,
          );
          const drawW = naturalW * fitScale;
          const drawH = naturalH * fitScale;
          ctx.save();
          drawRoundedRect(ctx, blockX, y, blockWidth, blockHeight, 12);
          ctx.clip();
          ctx.drawImage(
            image,
            blockX + (blockWidth - drawW) / 2,
            y + (blockHeight - drawH) / 2,
            drawW,
            drawH,
          );
          ctx.restore();
        } else {
          ctx.font = `600 13px Inter, ui-sans-serif, system-ui, sans-serif`;
          ctx.fillStyle = muted;
          ctx.fillText(
            imageState?.status === "error"
              ? imageLine.alt || "Image failed to load"
              : imageLine.alt || "Loading image...",
            blockX + 16,
            y + 16,
          );
        }

        y += blockHeight + MDX_CANVAS_TYPO.paragraphGap;
      };

      for (const rawLine of lines) {
        if (y > maxY) break;

        const sourceLine = decodeMarkdownCanvasEntities(rawLine).replace(
          /\t/g,
          "  ",
        );
        const line = unescapeMarkdownCanvasText(sourceLine);
        const hasEscapedBulletMarker = /^\s*\\[-*+]\s+/.test(sourceLine);
        const fence = line.trim().match(/^```(\S*)/);
        if (fence) {
          flushParagraph();
          if (!inCode) {
            inCode = true;
            codeLines = [];
            codeLanguage = fence[1] ?? "";
          } else {
            flushCodeBlock();
            inCode = false;
          }
          continue;
        }

        if (inCode) {
          codeLines.push(line);
          continue;
        }

        const previewImage = extractMarkdownCanvasImage(line);
        if (previewImage) {
          drawImageBlock(previewImage);
          continue;
        }

        if (!line.trim()) {
          flushParagraph();
          continue;
        }

        if (isMarkdownCanvasThematicBreak(line)) {
          flushParagraph();
          y += MDX_CANVAS_TYPO.thematicBreakGapTop;
          ctx.strokeStyle = isDark
            ? "rgba(212,212,216,0.36)"
            : "rgba(63,63,70,0.42)";
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + maxWidth, y);
          ctx.stroke();
          y += MDX_CANVAS_TYPO.thematicBreakGapBottom;
          continue;
        }

        const heading = line.match(/^(#{1,6})\s+(.+)$/);
        if (heading) {
          flushParagraph();
          const level = Math.min(
            6,
            heading[1]!.length,
          ) as keyof typeof MDX_CANVAS_TYPO.heading;
          const { size, weight } = MDX_CANVAS_TYPO.heading[level];
          ctx.font = `${weight} ${size}px Inter, ui-sans-serif, system-ui, sans-serif`;
          ctx.fillStyle = fg;
          y += MDX_CANVAS_TYPO.headingGapTop;
          y =
            drawWrappedText(
              ctx,
              heading[2]!,
              x,
              y,
              maxWidth,
              size * MDX_CANVAS_TYPO.headingLineHeight,
              maxY,
              { codeBg, codeBorder },
            ) + MDX_CANVAS_TYPO.headingGapBottom;
          continue;
        }

        const bullet = hasEscapedBulletMarker
          ? null
          : line.match(/^(\s*)[-*+]\s+(.+)$/);
        const ordered = line.match(/^(\s*)(\d+)[.)]\s+(.+)$/);
        if (bullet || ordered) {
          flushParagraph();
          const sourceIndent = bullet?.[1] ?? ordered?.[1] ?? "";
          const nestedIndent =
            Math.floor(sourceIndent.length / 2) *
            MDX_CANVAS_TYPO.listPaddingLeft;
          const indent = MDX_CANVAS_TYPO.listPaddingLeft + nestedIndent;
          const textX = x + indent;
          const rawText = bullet?.[2] ?? ordered?.[3] ?? "";
          const task = rawText.match(/^\[([ xX])]\s+(.+)$/);
          ctx.font = `${MDX_CANVAS_TYPO.bodySize}px Inter, ui-sans-serif, system-ui, sans-serif`;

          if (task && bullet) {
            const checked = task[1]!.toLowerCase() === "x";
            const boxSize = MDX_CANVAS_TYPO.taskBoxSize;
            const boxX = textX - boxSize - MDX_CANVAS_TYPO.listMarkerGap;
            const boxY = y + (MDX_CANVAS_TYPO.bodySize - boxSize) / 2;
            const taskTextX = textX;

            drawRoundedRect(
              ctx,
              boxX,
              boxY,
              boxSize,
              boxSize,
              MDX_CANVAS_TYPO.taskBoxRadius,
            );
            ctx.fillStyle = checked ? taskCheckedBg : taskUncheckedBg;
            ctx.fill();
            ctx.strokeStyle = checked ? taskCheckedBg : taskUncheckedBorder;
            ctx.lineWidth = 1;
            ctx.stroke();

            if (checked) {
              ctx.strokeStyle = "rgba(255,255,255,0.96)";
              ctx.lineWidth = 2.4;
              ctx.lineCap = "round";
              ctx.lineJoin = "round";
              ctx.beginPath();
              ctx.moveTo(boxX + 4.3, boxY + 9.3);
              ctx.lineTo(boxX + 7.6, boxY + 12.4);
              ctx.lineTo(boxX + 14, boxY + 5.2);
              ctx.stroke();
              ctx.lineCap = "butt";
              ctx.lineJoin = "miter";
            }

            ctx.fillStyle = fg;
            y =
              drawWrappedText(
                ctx,
                task[2]!,
                taskTextX,
                y,
                maxWidth - (taskTextX - x),
                MDX_CANVAS_TYPO.bodyLineHeight,
                maxY,
                {
                  codeBg,
                  codeBorder,
                  strike: checked ? taskStrike : undefined,
                },
              ) + MDX_CANVAS_TYPO.listItemGap;
            continue;
          }

          const marker = ordered ? `${ordered[2]}.` : "•";
          const text = rawText;
          const markerWidth = ctx.measureText(marker).width;
          ctx.fillStyle = muted;
          ctx.fillText(
            marker,
            textX - MDX_CANVAS_TYPO.listMarkerGap - markerWidth,
            y,
          );
          ctx.fillStyle = fg;
          y =
            drawWrappedText(
              ctx,
              text,
              textX,
              y,
              maxWidth - indent,
              MDX_CANVAS_TYPO.bodyLineHeight,
              maxY,
              { codeBg, codeBorder },
            ) + MDX_CANVAS_TYPO.listItemGap;
          continue;
        }

        const quote = line.match(/^>\s?(.+)$/);
        if (quote) {
          paragraphLines.push(quote[1]!);
          continue;
        }

        paragraphLines.push(line);
      }

      flushParagraph();
      if (inCode) {
        flushCodeBlock();
      }
    };

    draw();

    const observer = new ResizeObserver(draw);
    observer.observe(parent);
    return () => {
      disposed = true;
      window.cancelAnimationFrame(redrawFrame);
      observer.disconnect();
    };
  }, [blocks, isDark]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="block h-full w-full select-none"
    />
  );
}

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
  layerZIndex: number;
  readOnly: boolean;
  touchNavigationMode?: boolean;
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
  onStartTouchReadOnlyNavigation?: (
    event: ReactPointerEvent<HTMLElement>,
    selectTarget: () => void,
  ) => boolean;
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
  layerZIndex,
  readOnly,
  touchNavigationMode = false,
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
  onStartTouchReadOnlyNavigation,
}: Props) => {
  const computeAccentBorderColor = (hex: string, darkMode: boolean): string => {
    const rgb = parseHexRgb(hex);
    if (!rgb) {
      return darkMode ? "rgba(224, 231, 255, 0.22)" : "rgba(15, 23, 42, 0.2)";
    }
    const [r, g, b] = rgb;
    const lum = relativeLuminance(r, g, b);

    // Keep node borders visible even when accent is near-black/near-white.
    if (darkMode) {
      if (lum < 0.08) return "rgba(203, 213, 225, 0.32)";
      if (lum < 0.18) return `rgba(${r}, ${g}, ${b}, 0.44)`;
      return `rgba(${r}, ${g}, ${b}, 0.34)`;
    }

    if (lum > 0.9) return "rgba(15, 23, 42, 0.24)";
    if (lum > 0.78) return `rgba(${r}, ${g}, ${b}, 0.34)`;
    return `rgba(${r}, ${g}, ${b}, 0.26)`;
  };

  const accent = node.accentColor?.trim();
  const themeAccent =
    accent != null && accent !== "" ? nodeTextThemeFromAccent(accent) : null;
  const accentBorderColor =
    accent && themeAccent
      ? computeAccentBorderColor(accent, isDark)
      : undefined;
  const outerShellStyle: CSSProperties | undefined =
    themeAccent && accent
      ? {
          borderColor: accentBorderColor,
          backgroundColor: isDark
            ? `color-mix(in srgb, ${accent} 22%, rgba(9,9,11,0.42))`
            : `color-mix(in srgb, ${accent} 16%, rgba(255,255,255,0.88))`,
          boxShadow: isDark
            ? "inset 0 0 0 1px rgba(255,255,255,0.08)"
            : "inset 0 0 0 1px rgba(15,23,42,0.05)",
        }
      : undefined;
  const selectedGlowStyle: CSSProperties =
    accent && themeAccent
      ? {
          background: `radial-gradient(ellipse 78% 68% at 28% 44%, color-mix(in srgb, ${accent} 52%, transparent) 0%, transparent 58%), radial-gradient(ellipse 70% 60% at 82% 56%, rgba(34,211,238,0.2) 0%, transparent 52%)`,
        }
      : rearGlowStyle(isConnected);

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
  const isInWorldView = !(
    node.x > worldViewBounds.maxX ||
    node.x + node.width < worldViewBounds.minX ||
    node.y > worldViewBounds.maxY ||
    node.y + node.height < worldViewBounds.minY
  );
  const isRenderableSize = width >= 48 && height >= 40;
  const nodeImageUrl =
    toDisplayImageUrlCandidate(node.imageUrl?.trim() ?? "") ||
    extractStandaloneImageUrlFromBlocks(blocks);
  const isImageNode = nodeImageUrl.length > 0;
  const headingLevel = normalizeHeadingLevel(node.headingLevel);
  const titleClass = headingLabelClass(headingLevel);
  const shouldRenderLiveEditor = !readOnly && !isImageNode && isSelected;

  if (!isInWorldView) {
    return null;
  }

  if (!isRenderableSize) return null;

  return (
    <div
      key={node.id}
      style={{
        left,
        top,
        width,
        height,
        zIndex: layerZIndex,
        contain: "layout paint style",
      }}
      className="group/node-overlay pointer-events-auto absolute select-none"
      data-overlay-node-id={node.id}
      data-viewport-version={viewportVersion}
      onPointerDown={(event) => {
        if (
          touchNavigationMode &&
          readOnly &&
          onStartTouchReadOnlyNavigation?.(event, () => {
            onResetMultiSelection();
            onSelect(node.id);
          })
        ) {
          return;
        }
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
            style={selectedGlowStyle}
          />
        ) : null}
        <div
          className={`absolute inset-0 overflow-hidden rounded-2xl backdrop-blur-xl backdrop-saturate-150 ${
            themeAccent
              ? `border border-solid ${
                  isDark
                    ? "shadow-[0_14px_34px_-18px_rgba(0,0,0,0.85)]"
                    : "shadow-[0_14px_30px_-20px_rgba(15,23,42,0.35)]"
                }`
              : isDark
                ? "border border-border/20 bg-black/78 shadow-[0_14px_34px_-18px_rgba(0,0,0,0.85)]"
                : "border border-border/35 bg-white/80 shadow-[0_14px_30px_-20px_rgba(15,23,42,0.35)]"
          }`}
          style={outerShellStyle}
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
            themeAccent
              ? "border-b border-solid"
              : isDark
                ? "border-b border-border/20"
                : "border-b border-border/35"
          }`}
          style={
            themeAccent ? { borderBottomColor: themeAccent.border } : undefined
          }
        >
          <div
            className={`pointer-events-auto flex w-7 shrink-0 ${readOnly ? "cursor-default" : "cursor-grab active:cursor-grabbing"} items-center justify-center text-[10px] text-muted-foreground ${
              themeAccent
                ? "border-r border-solid"
                : isDark
                  ? "border-r border-border/20 bg-zinc-900/35"
                  : "border-r border-border/35 bg-zinc-200/45"
            }`}
            style={
              themeAccent
                ? {
                    borderRightColor: themeAccent.border,
                    backgroundColor: themeAccent.dragBg,
                  }
                : undefined
            }
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
                if (touchNavigationMode && readOnly) return;
                event.stopPropagation();
              }}
              className={`min-w-0 flex-1 border-0 bg-transparent px-1 py-0.5 outline-none select-text placeholder:text-muted-foreground/80 ${
                touchNavigationMode && readOnly ? "pointer-events-none" : ""
              } ${titleClass}`}
              spellCheck={false}
            />
            <div
              className={`flex shrink-0 items-center gap-1 text-muted-foreground ${
                touchNavigationMode && readOnly ? "hidden" : ""
              }`}
            >
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
                  className="h-full overflow-hidden pointer-events-none"
                >
                  <MarkdownBlocksPreview
                    blocks={blocks}
                    isDark={isDark}
                    nodeId={node.id}
                  />
                </div>
              ) : shouldRenderLiveEditor ? (
                <div
                  data-node-overlay-scroll="true"
                  onPointerDown={(event) => {
                    if (isSelected) {
                      event.stopPropagation();
                    }
                  }}
                  onMouseDown={(event) => {
                    if (isSelected) {
                      event.stopPropagation();
                    }
                  }}
                  style={{
                    touchAction:
                      touchNavigationMode && isSelected ? "pan-y" : undefined,
                    overscrollBehavior:
                      touchNavigationMode && isSelected ? "contain" : undefined,
                  }}
                  className={`flex min-h-0 min-w-0 flex-1 flex-col pl-5 pr-2 pt-2 overflow-auto h-full ${
                    isSelected ? "pointer-events-auto" : "pointer-events-none"
                  }`}
                >
                  <MemoNodeMarkdownBlocksEditor
                    nodeId={node.id}
                    blocks={blocks}
                    selectionEditorMode="toolbar"
                    isDarkMode={isDark}
                    isSelectionOwner={isSelected}
                    uploadPasteImage={uploadMarkdownPasteImage}
                    onBlocksChange={(nextBlocks) =>
                      updateNodeBlocks(onProjectPatch, node.id, nextBlocks)
                    }
                  />
                </div>
              ) : (
                <div
                  data-node-overlay-scroll="true"
                  className="h-full overflow-hidden pointer-events-none"
                >
                  <MarkdownBlocksPreview
                    blocks={blocks}
                    isDark={isDark}
                    nodeId={node.id}
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

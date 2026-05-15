import {
  memo,
  useEffect,
  useRef,
  useState,
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
  contentPaddingX: 20,
  contentPaddingTop: 8,
  contentPaddingBottom: 12,
  bodySize: 16.32,
  bodyLineHeight: 28.1,
  paragraphGap: 14.3,
  headingGapTop: 10,
  headingGapBottom: 14,
  heading: {
    1: { size: 32, weight: 800 },
    2: { size: 27.2, weight: 750 },
    3: { size: 23.2, weight: 700 },
    4: { size: 20, weight: 650 },
    5: { size: 17.6, weight: 620 },
    6: { size: 15.68, weight: 600 },
  },
  headingLineHeight: 1.32,
  listMarginTop: 10,
  listMarginBottom: 10,
  listPaddingLeft: 16.8,
  listMarkerGap: 1,
  listItemGap: 4,
  codeSize: 13.76,
  /** Вирівняно з `.cm-scroller` у MDX (~1.58 × codeSize, компактні паддінги). */
  codeLineHeight: 23.5,
  codePaddingX: 7,
  codePaddingY: 7,
  codeHeaderHeight: 40,
  /** Окремий боковий відступ code block від країв preview. Не впливає на звичайний content. */
  codeBlockInsetX: 30,
  codeGutterWidth: 25,
  /** Розмір цифр у gutter (тіло коду — `codeSize`). */
  codeLineNumberSize: 10,
  /** Dropdown мови у шапці code block (не повна capsule). */
  codeLangSelectRadius: 10,
  codeChromeDotLeft: 10.5,
  codeChromeDotRadius: 4.45,
  codeChromeDotGap: 12.5,
  codeLangAfterDotsGap: 10,
  codeLangFallbackLeft: 52,
  codeLangHeight: 26,
  codeLangPaddingX: 11,
  codeLangChevronSlot: 24,
  codeLangMinWidth: 118,
  codeLangMaxWidth: 190,
  codeLangChevronRight: 15,
  codeCopySize: 26,
  codeCopyRadius: 6.5,
  codeCopyRight: 10,
  inlineCodePaddingX: 5.6,
  inlineCodeHeight: 22,
  inlineCodeRadius: 4,
  taskBoxSize: 18,
  taskBoxRadius: 4,
  taskBoxIndent: 36,
  taskTextGap: 14,
  taskBoxOffsetY: 0,
  taskItemGap: 8,
  thematicBreakGapTop: 8,
  thematicBreakGapBottom: 14,
} as const;

/** Вирівняно з fenced CodeMirror блоком MDX (`index.css` → `_codeMirrorWrapper_`). */
const MDX_CANVAS_CODE_CHROME = {
  radius: 10,
  light: {
    wrapperBg: "#f8fafc",
    border: "rgba(15,23,42,0.13)",
    toolbarBg: "#ececec",
    toolbarDivider: "rgba(63,63,70,0.13)",
    editorBg: "#ffffff",
    gutterBg: "#f8fafc",
    gutterDivider: "rgba(63,63,70,0.1)",
    gutterText: "#64748b",
    langBg: "#ffffff",
    langBorder: "rgba(63,63,70,0.15)",
    langFg: "#0f172a",
    copyBg: "#ffffff",
    copyBorder: "rgba(63,63,70,0.15)",
    copyIcon: "#334155",
    trafficColors: ["#ff5f57", "#febc2e", "#28c840"] as const,
  },
  dark: {
    wrapperBg: "#0f0f0f",
    border: "rgba(38,38,38,0.85)",
    toolbarBg: "#141414",
    toolbarDivider: "rgba(255,255,255,0.06)",
    editorBg: "#0c0c0c",
    gutterBg: "#1a1e2a",
    gutterDivider: "rgba(255,255,255,0.06)",
    gutterText: "#92a3b9",
    langBg: "#000000",
    langBorder: "rgba(255,255,255,0.14)",
    langFg: "#f4f4f5",
    copyBg: "#0a0a0a",
    copyBorder: "rgba(255,255,255,0.14)",
    copyIcon: "rgba(212,212,216,0.78)",
    trafficColors: ["#ff5f57", "#febc2e", "#28c840"] as const,
  },
} as const;

const MDX_CANVAS_CODE_FONT =
  '"JetBrains Mono", "Roboto Mono", ui-monospace, SFMono-Regular, Menlo, monospace';

type InlineTextUnit = {
  text: string;
  isCode: boolean;
  isBold: boolean;
  isItalic: boolean;
  isStrike: boolean;
  width: number;
};

type CanvasCodeCopyButton = {
  id: string;
  code: string;
  left: number;
  top: number;
  size: number;
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

function strokeRoundedRectOutline(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  drawRoundedRect(ctx, x, y, width, height, radius);
  ctx.stroke();
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

  const markdownImage = trimmed.match(/!\[([^\]]*)]\((.+?)\)/);
  if (markdownImage) {
    return {
      alt: markdownImage[1] ?? "",
      src: unwrapMarkdownImageCandidate(markdownImage[2] ?? ""),
    };
  }

  const rawImage = trimmed.match(
    /<img\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/i,
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
    normalized === "plain" ||
    normalized === "plain_text" ||
    normalized === "plaintext" ||
    normalized === "text" ||
    normalized === "txt"
  ) {
    return "Plain text";
  }
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
  if (normalized === "bash" || normalized === "sh") return "Bash";
  if (normalized === "shell") return "Shell";
  return language.trim() || "TypeScript JSX";
}

function inferCodeFenceLanguage(language: string, codeLines: string[]) {
  const normalized = language.trim().toLowerCase();
  if (
    normalized === "plain" ||
    normalized === "plain_text" ||
    normalized === "plaintext" ||
    normalized === "text" ||
    normalized === "txt"
  ) {
    return normalized;
  }

  if (normalized) {
    return normalized;
  }

  const code = codeLines.join("\n");
  if (
    /\b(?:type|interface|enum|implements|as const|readonly)\b/.test(code) ||
    /:\s*(?:string|number|boolean|unknown|Vector3|Object3D)\b/.test(code) ||
    /\bimport\s+type\b/.test(code)
  ) {
    return /<[A-Z][\w.]*[\s>]/.test(code) ? "tsx" : "ts";
  }
  if (/\b(?:const|let|function|export|import|return)\b/.test(code)) {
    return "js";
  }
  if (/^\s*[{\[]/.test(code) && /["']\w+["']\s*:/.test(code)) {
    return "json";
  }
  if (/<\/?[a-z][\w:-]*(?:\s|>|\/>)/i.test(code)) {
    return "html";
  }
  if (/^\s*[.#]?[\w-]+\s*\{[\s\S]*:[\s\S]*\}/.test(code)) {
    return "css";
  }

  return normalized || "";
}

async function copyCanvasPreviewText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return;
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "true");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }
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
  ctx.font = `400 ${MDX_CANVAS_TYPO.codeSize}px ${MDX_CANVAS_CODE_FONT}`;
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
    <div
      className="h-full overflow-hidden"
      style={{
        paddingLeft: MDX_CANVAS_TYPO.contentPaddingX,
        paddingRight: MDX_CANVAS_TYPO.contentPaddingX,
        paddingTop: MDX_CANVAS_TYPO.contentPaddingTop,
        paddingBottom: MDX_CANVAS_TYPO.contentPaddingBottom,
      }}
    >
      <MemoNodeMarkdownBlocksEditor
        nodeId={`${nodeId}-preview`}
        blocks={blocks}
        selectionEditorMode="toolbar"
        isDarkMode={isDark}
        isSelectionOwner={false}
        uploadPasteImage={async () => ""}
        onBlocksChange={() => {}}
      />
    </div>
  );
}

function MarkdownCanvasPreview({
  blocks,
  isDark,
  scrollable = false,
}: {
  blocks: NodeMarkdownBlock[];
  isDark: boolean;
  scrollable?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const spacerRef = useRef<HTMLDivElement | null>(null);
  const copyButtonsSignatureRef = useRef("");
  const copiedCodeTimeoutRef = useRef<number | null>(null);
  const [codeCopyButtons, setCodeCopyButtons] = useState<
    CanvasCodeCopyButton[]
  >([]);
  const [copiedCodeButtonId, setCopiedCodeButtonId] = useState<string | null>(
    null,
  );
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
      const codeSyntax = isDark
        ? {
            fg: "rgba(229,231,235,0.94)",
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
      const x = MDX_CANVAS_TYPO.contentPaddingX;
      const maxWidth = Math.max(
        20,
        cssWidth - MDX_CANVAS_TYPO.contentPaddingX * 2,
      );
      let inCode = false;
      let codeLines: string[] = [];
      let codeLanguage = "";
      let paragraphLines: string[] = [];
      const nextCodeCopyButtons: CanvasCodeCopyButton[] = [];

      const lines = descriptionFromBlocks(blocks).split("\n");

      const estimateWrappedTextHeight = (
        text: string,
        availableWidth: number,
        lineHeight: number,
        baseFont: string,
      ) => {
        ctx.font = baseFont;
        const inlineUnits = toInlineTextUnits(ctx, text);
        if (inlineUnits.length === 0) return lineHeight;

        let lineWidth = 0;
        let lineCount = 1;
        for (const inlineUnit of inlineUnits) {
          const canWrap = inlineUnit.text !== " ";
          if (canWrap && lineWidth + inlineUnit.width > availableWidth) {
            lineCount += 1;
            lineWidth = inlineUnit.text === " " ? 0 : inlineUnit.width;
          } else {
            lineWidth += inlineUnit.width;
          }
        }

        return lineCount * lineHeight;
      };

      const estimateContentHeight = () => {
        let estimatedY = MDX_CANVAS_TYPO.contentPaddingTop;
        let estimatingCode = false;
        let estimatingCodeLines = 0;
        let estimatingParagraphLines: string[] = [];
        let wasListLine = false;
        const bodyFont = `${MDX_CANVAS_TYPO.bodySize}px Inter, ui-sans-serif, system-ui, sans-serif`;

        const finalizeEstimatedList = () => {
          if (!wasListLine) return;
          estimatedY += MDX_CANVAS_TYPO.listMarginBottom;
          wasListLine = false;
        };

        const flushEstimatedParagraph = () => {
          if (estimatingParagraphLines.length === 0) return;
          finalizeEstimatedList();
          for (const paragraphLine of estimatingParagraphLines) {
            const { indent, text } = splitMarkdownCanvasIndent(paragraphLine);
            estimatedY += estimateWrappedTextHeight(
              text,
              maxWidth - indent,
              MDX_CANVAS_TYPO.bodyLineHeight,
              bodyFont,
            );
          }
          estimatedY += MDX_CANVAS_TYPO.paragraphGap;
          estimatingParagraphLines = [];
        };

        const flushEstimatedCodeBlock = () => {
          estimatedY +=
            MDX_CANVAS_TYPO.codeHeaderHeight +
            MDX_CANVAS_TYPO.codePaddingY * 2 +
            Math.max(1, estimatingCodeLines) * MDX_CANVAS_TYPO.codeLineHeight +
            MDX_CANVAS_TYPO.paragraphGap;
          estimatingCodeLines = 0;
        };

        for (const rawLine of lines) {
          const sourceLine = decodeMarkdownCanvasEntities(rawLine).replace(
            /\t/g,
            "  ",
          );
          const line = unescapeMarkdownCanvasText(sourceLine);
          const hasEscapedBulletMarker = /^\s*\\[-*+]\s+/.test(sourceLine);
          const fence = line.trim().match(/^```(\S*)/);
          if (fence) {
            finalizeEstimatedList();
            flushEstimatedParagraph();
            if (!estimatingCode) {
              estimatingCode = true;
              estimatingCodeLines = 0;
            } else {
              flushEstimatedCodeBlock();
              estimatingCode = false;
            }
            continue;
          }

          if (estimatingCode) {
            estimatingCodeLines += 1;
            continue;
          }

          const previewImage = extractMarkdownCanvasImage(line);
          if (previewImage) {
            finalizeEstimatedList();
            flushEstimatedParagraph();
            estimatedY += 220 + MDX_CANVAS_TYPO.paragraphGap;
            continue;
          }

          if (!line.trim()) {
            finalizeEstimatedList();
            flushEstimatedParagraph();
            continue;
          }

          if (isMarkdownCanvasThematicBreak(line)) {
            finalizeEstimatedList();
            flushEstimatedParagraph();
            estimatedY +=
              MDX_CANVAS_TYPO.thematicBreakGapTop +
              MDX_CANVAS_TYPO.thematicBreakGapBottom;
            continue;
          }

          const heading = line.match(/^(#{1,6})\s+(.+)$/);
          if (heading) {
            finalizeEstimatedList();
            flushEstimatedParagraph();
            const level = Math.min(
              6,
              heading[1]!.length,
            ) as keyof typeof MDX_CANVAS_TYPO.heading;
            const { size, weight } = MDX_CANVAS_TYPO.heading[level];
            estimatedY += MDX_CANVAS_TYPO.headingGapTop;
            estimatedY += estimateWrappedTextHeight(
              heading[2]!,
              maxWidth,
              size * MDX_CANVAS_TYPO.headingLineHeight,
              `${weight} ${size}px Inter, ui-sans-serif, system-ui, sans-serif`,
            );
            estimatedY += MDX_CANVAS_TYPO.headingGapBottom;
            continue;
          }

          const bullet = hasEscapedBulletMarker
            ? null
            : line.match(/^(\s*)[-*+]\s+(.+)$/);
          const ordered = line.match(/^(\s*)(\d+)[.)]\s+(.+)$/);
          if (bullet || ordered) {
            flushEstimatedParagraph();
            if (!wasListLine) {
              estimatedY += MDX_CANVAS_TYPO.listMarginTop;
            }
            const sourceIndent = bullet?.[1] ?? ordered?.[1] ?? "";
            const nestedIndent =
              Math.floor(sourceIndent.length / 2) *
              MDX_CANVAS_TYPO.listPaddingLeft;
            const indent = MDX_CANVAS_TYPO.listPaddingLeft + nestedIndent;
            const rawText = bullet?.[2] ?? ordered?.[3] ?? "";
            const task = rawText.match(/^\[([ xX])]\s+(.+)$/);
            const taskTextOffset =
              task && bullet
                ? MDX_CANVAS_TYPO.taskBoxIndent +
                  MDX_CANVAS_TYPO.taskBoxSize +
                  MDX_CANVAS_TYPO.taskTextGap +
                  nestedIndent
                : indent;
            estimatedY +=
              estimateWrappedTextHeight(
                task && bullet ? task[2]! : rawText,
                maxWidth - taskTextOffset,
                MDX_CANVAS_TYPO.bodyLineHeight,
                bodyFont,
              ) +
              (task && bullet
                ? MDX_CANVAS_TYPO.taskItemGap
                : MDX_CANVAS_TYPO.listItemGap);
            wasListLine = true;
            continue;
          }

          const quote = line.match(/^>\s?(.+)$/);
          if (wasListLine) finalizeEstimatedList();
          estimatingParagraphLines.push(quote?.[1] ?? line);
        }

        finalizeEstimatedList();
        flushEstimatedParagraph();
        if (estimatingCode) flushEstimatedCodeBlock();
        return Math.ceil(estimatedY + MDX_CANVAS_TYPO.contentPaddingBottom);
      };

      if (scrollable && spacerRef.current) {
        spacerRef.current.style.height = `${Math.max(
          0,
          estimateContentHeight() - cssHeight,
        )}px`;
      }

      const scrollTop = scrollable ? parent.scrollTop : 0;
      let y: number = MDX_CANVAS_TYPO.contentPaddingTop - scrollTop;
      const maxY = cssHeight - MDX_CANVAS_TYPO.contentPaddingBottom;

      let wasListDrawing = false;

      const finalizeDrawingListRun = () => {
        if (!wasListDrawing) return;
        y += MDX_CANVAS_TYPO.listMarginBottom;
        wasListDrawing = false;
      };

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
        const chrome = isDark
          ? MDX_CANVAS_CODE_CHROME.dark
          : MDX_CANVAS_CODE_CHROME.light;
        const rr = MDX_CANVAS_CODE_CHROME.radius;
        const blockX = MDX_CANVAS_TYPO.codeBlockInsetX;
        const blockY = y;
        const blockWidth = Math.max(
          20,
          cssWidth - MDX_CANVAS_TYPO.codeBlockInsetX * 2,
        );
        const headerH = MDX_CANVAS_TYPO.codeHeaderHeight;
        const bodyY = blockY + headerH;
        const blockHeight =
          headerH +
          MDX_CANVAS_TYPO.codePaddingY * 2 +
          Math.max(1, codeLines.length) * MDX_CANVAS_TYPO.codeLineHeight;
        const bodyH = blockHeight - headerH;
        const gutterW = MDX_CANVAS_TYPO.codeGutterWidth;
        const textX = blockX + gutterW + MDX_CANVAS_TYPO.codePaddingX;
        let textY = bodyY + MDX_CANVAS_TYPO.codePaddingY;

        drawRoundedRect(ctx, blockX, blockY, blockWidth, blockHeight, rr);

        ctx.save();
        drawRoundedRect(ctx, blockX, blockY, blockWidth, blockHeight, rr);
        ctx.clip();

        ctx.fillStyle = chrome.wrapperBg;
        ctx.fillRect(blockX, blockY, blockWidth, blockHeight);

        ctx.fillStyle = chrome.toolbarBg;
        ctx.fillRect(blockX, blockY, blockWidth, headerH);

        ctx.strokeStyle = chrome.toolbarDivider;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(blockX, bodyY + 0.5);
        ctx.lineTo(blockX + blockWidth, bodyY + 0.5);
        ctx.stroke();

        ctx.fillStyle = chrome.editorBg;
        ctx.fillRect(blockX, bodyY, blockWidth, bodyH);

        ctx.fillStyle = chrome.gutterBg;
        ctx.fillRect(blockX, bodyY, gutterW, bodyH);
        ctx.strokeStyle = chrome.gutterDivider;
        ctx.beginPath();
        ctx.moveTo(blockX + gutterW + 0.5, bodyY);
        ctx.lineTo(blockX + gutterW + 0.5, bodyY + bodyH);
        ctx.stroke();

        ctx.restore();

        ctx.strokeStyle = chrome.border;
        ctx.lineWidth = 1;
        drawRoundedRect(ctx, blockX, blockY, blockWidth, blockHeight, rr);
        ctx.stroke();

        const dotY = blockY + headerH / 2;
        const dotR = MDX_CANVAS_TYPO.codeChromeDotRadius;
        const dotStep = MDX_CANVAS_TYPO.codeChromeDotGap;
        const dot0 = blockX + MDX_CANVAS_TYPO.codeChromeDotLeft;
        for (const [i, trafficColor] of chrome.trafficColors.entries()) {
          ctx.fillStyle = trafficColor;
          ctx.beginPath();
          ctx.arc(dot0 + i * dotStep, dotY, dotR, 0, Math.PI * 2);
          ctx.fill();
        }

        const label = labelForCodeFenceLanguage(
          inferCodeFenceLanguage(codeLanguage, codeLines),
        );
        const langH = MDX_CANVAS_TYPO.codeLangHeight;
        const langR = MDX_CANVAS_TYPO.codeLangSelectRadius;
        ctx.font = `600 12px Inter, ui-sans-serif, system-ui, sans-serif`;
        const chevronSlot = MDX_CANVAS_TYPO.codeLangChevronSlot;
        const labelPadX = MDX_CANVAS_TYPO.codeLangPaddingX;
        const textW = ctx.measureText(label).width;
        const labelWidth = Math.min(
          MDX_CANVAS_TYPO.codeLangMaxWidth,
          Math.max(
            MDX_CANVAS_TYPO.codeLangMinWidth,
            textW + labelPadX + chevronSlot,
          ),
        );
        const afterDots =
          dot0 + 2 * dotStep + dotR + MDX_CANVAS_TYPO.codeLangAfterDotsGap;
        const labelX = Math.round(
          Math.max(afterDots, blockX + MDX_CANVAS_TYPO.codeLangFallbackLeft),
        );
        const langTop = Math.round(blockY + (headerH - langH) / 2);
        drawRoundedRect(ctx, labelX, langTop, labelWidth, langH, langR);
        ctx.fillStyle = chrome.langBg;
        ctx.fill();
        ctx.strokeStyle = chrome.langBorder;
        ctx.lineWidth = 1;
        drawRoundedRect(ctx, labelX, langTop, labelWidth, langH, langR);
        ctx.stroke();
        ctx.fillStyle = chrome.langFg;
        ctx.textBaseline = "middle";
        ctx.fillText(label, labelX + labelPadX, langTop + langH / 2 + 0.25);
        ctx.textBaseline = "top";

        ctx.strokeStyle = chrome.langFg;
        ctx.lineWidth = 1.05;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        const chevronCx =
          labelX + labelWidth - MDX_CANVAS_TYPO.codeLangChevronRight;
        const chevronCy = langTop + langH / 2 + 0.25;
        ctx.beginPath();
        ctx.moveTo(chevronCx - 3.75, chevronCy - 2.25);
        ctx.lineTo(chevronCx, chevronCy + 1.35);
        ctx.lineTo(chevronCx + 3.75, chevronCy - 2.25);
        ctx.stroke();

        const copySz = MDX_CANVAS_TYPO.codeCopySize;
        const copyR = MDX_CANVAS_TYPO.codeCopyRadius;
        const copyX = Math.round(
          blockX + blockWidth - copySz - MDX_CANVAS_TYPO.codeCopyRight,
        );
        const copyY = Math.round(blockY + (headerH - copySz) / 2);
        drawRoundedRect(ctx, copyX, copyY, copySz, copySz, copyR);
        ctx.fillStyle = chrome.copyBg;
        ctx.fill();
        ctx.strokeStyle = chrome.copyBorder;
        ctx.lineWidth = 1;
        drawRoundedRect(ctx, copyX, copyY, copySz, copySz, copyR);
        ctx.stroke();

        ctx.strokeStyle = chrome.copyIcon;
        ctx.lineWidth = 1.08;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        const copyCx = copyX + copySz / 2;
        const copyCy = copyY + copySz / 2;
        const dw = 9;
        const dh = 10;
        const dr = 2.1;
        const backX = copyCx - dw / 2 - 2.85;
        const backY = copyCy - dh / 2 - 2.55;
        const frontX = backX + 3.65;
        const frontY = backY + 3.55;
        strokeRoundedRectOutline(ctx, backX, backY, dw, dh, dr);
        drawRoundedRect(ctx, frontX, frontY, dw, dh, dr);
        ctx.fillStyle = chrome.copyBg;
        ctx.fill();
        drawRoundedRect(ctx, frontX, frontY, dw, dh, dr);
        ctx.stroke();

        if (scrollable) {
          nextCodeCopyButtons.push({
            id: `${nextCodeCopyButtons.length}-${Math.round(blockY + scrollTop)}`,
            code: codeLines.join("\n"),
            left: copyX,
            top: copyY + scrollTop,
            size: copySz,
          });
        }

        const codeUiFont = `400 ${MDX_CANVAS_TYPO.codeSize}px ${MDX_CANVAS_CODE_FONT}`;
        const codeLineNumFont = `400 ${MDX_CANVAS_TYPO.codeLineNumberSize}px ${MDX_CANVAS_CODE_FONT}`;
        ctx.font = codeUiFont;
        for (const [lineIndex, codeLine] of (codeLines.length > 0
          ? codeLines
          : [""]
        ).entries()) {
          if (textY <= maxY) {
            ctx.font = codeLineNumFont;
            ctx.fillStyle = chrome.gutterText;
            ctx.textBaseline = "middle";
            const lineNumber = String(lineIndex + 1);
            const numW = ctx.measureText(lineNumber).width;
            ctx.fillText(
              lineNumber,
              blockX + gutterW - MDX_CANVAS_TYPO.codePaddingX - numW,
              textY + MDX_CANVAS_TYPO.codeLineHeight / 2,
            );
            ctx.textBaseline = "top";
            ctx.font = codeUiFont;
            drawMarkdownCanvasCodeLine(
              ctx,
              codeLine,
              textX,
              textY,
              blockWidth - gutterW - MDX_CANVAS_TYPO.codePaddingX * 2,
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
          finalizeDrawingListRun();
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
          finalizeDrawingListRun();
          drawImageBlock(previewImage);
          continue;
        }

        if (!line.trim()) {
          finalizeDrawingListRun();
          flushParagraph();
          continue;
        }

        if (isMarkdownCanvasThematicBreak(line)) {
          finalizeDrawingListRun();
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
          finalizeDrawingListRun();
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
          if (!wasListDrawing) {
            y += MDX_CANVAS_TYPO.listMarginTop;
          }
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
            const boxX = x + nestedIndent + MDX_CANVAS_TYPO.taskBoxIndent;
            const boxY =
              y +
              (MDX_CANVAS_TYPO.bodySize - boxSize) / 2 +
              MDX_CANVAS_TYPO.taskBoxOffsetY;
            const taskTextX = boxX + boxSize + MDX_CANVAS_TYPO.taskTextGap;

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
              ) + MDX_CANVAS_TYPO.taskItemGap;
            wasListDrawing = true;
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
          wasListDrawing = true;
          continue;
        }

        const quote = line.match(/^>\s?(.+)$/);
        if (quote) {
          if (wasListDrawing) finalizeDrawingListRun();
          paragraphLines.push(quote[1]!);
          continue;
        }

        if (wasListDrawing) finalizeDrawingListRun();
        paragraphLines.push(line);
      }

      finalizeDrawingListRun();
      flushParagraph();
      if (inCode) {
        flushCodeBlock();
      }

      if (scrollable) {
        const nextSignature = JSON.stringify(
          nextCodeCopyButtons.map(({ id, code, left, top, size }) => [
            id,
            code,
            Math.round(left),
            Math.round(top),
            size,
          ]),
        );
        if (copyButtonsSignatureRef.current !== nextSignature) {
          copyButtonsSignatureRef.current = nextSignature;
          setCodeCopyButtons(nextCodeCopyButtons);
        }
      } else if (copyButtonsSignatureRef.current !== "") {
        copyButtonsSignatureRef.current = "";
        setCodeCopyButtons([]);
      }
    };

    draw();

    const observer = new ResizeObserver(draw);
    observer.observe(parent);
    parent.addEventListener("scroll", requestRedraw, { passive: true });
    return () => {
      disposed = true;
      window.cancelAnimationFrame(redrawFrame);
      observer.disconnect();
      parent.removeEventListener("scroll", requestRedraw);
    };
  }, [blocks, isDark, scrollable]);

  useEffect(() => {
    return () => {
      if (copiedCodeTimeoutRef.current !== null) {
        window.clearTimeout(copiedCodeTimeoutRef.current);
      }
    };
  }, []);

  if (scrollable) {
    return (
      <div
        data-lenis-prevent-wheel
        className="relative h-full w-full overflow-auto"
        style={{
          overscrollBehavior: "contain",
          scrollbarGutter: "stable",
        }}
      >
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="pointer-events-none sticky top-0 z-10 block h-full w-full select-none"
        />
        {codeCopyButtons.map((button) => (
          <button
            key={button.id}
            type="button"
            aria-label={
              copiedCodeButtonId === button.id ? "Code copied" : "Copy code"
            }
            title={copiedCodeButtonId === button.id ? "Copied" : "Copy code"}
            className={`absolute z-30 inline-flex items-center justify-center rounded-md outline-none transition-colors focus-visible:ring-2 focus-visible:ring-sky-400/60 ${
              copiedCodeButtonId === button.id
                ? "bg-emerald-500/95 text-white shadow-sm"
                : "text-transparent hover:bg-zinc-950/5"
            }`}
            style={{
              left: button.left,
              top: button.top,
              width: button.size,
              height: button.size,
            }}
            onPointerDown={(event) => {
              event.stopPropagation();
            }}
            onMouseDown={(event) => {
              event.stopPropagation();
            }}
            onClick={(event) => {
              event.stopPropagation();
              void copyCanvasPreviewText(button.code).then(() => {
                setCopiedCodeButtonId(button.id);
                if (copiedCodeTimeoutRef.current !== null) {
                  window.clearTimeout(copiedCodeTimeoutRef.current);
                }
                copiedCodeTimeoutRef.current = window.setTimeout(() => {
                  setCopiedCodeButtonId((current) =>
                    current === button.id ? null : current,
                  );
                  copiedCodeTimeoutRef.current = null;
                }, 1100);
              });
            }}
          >
            {copiedCodeButtonId === button.id ? (
              <span aria-hidden="true" className="text-[15px] leading-none">
                ✓
              </span>
            ) : null}
          </button>
        ))}
        <div ref={spacerRef} aria-hidden="true" className="w-px" />
      </div>
    );
  }

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
              ) : readOnly && isSelected ? (
                <div
                  data-node-overlay-scroll="true"
                  data-lenis-prevent-wheel
                  onPointerDown={(event) => {
                    event.stopPropagation();
                  }}
                  onMouseDown={(event) => {
                    event.stopPropagation();
                  }}
                  style={{
                    overscrollBehavior: "contain",
                  }}
                  className="h-full overflow-hidden pointer-events-auto"
                >
                  <MarkdownCanvasPreview
                    blocks={blocks}
                    isDark={isDark}
                    scrollable
                  />
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

import type {
  MutableRefObject,
  ReactNode,
  RefObject,
} from "react";
import {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  CodeToggle,
  CreateLink,
  ListsToggle,
  MDXEditor,
  Separator,
  UndoRedo,
  headingsPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  quotePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import { remarkDefaultFenceLang } from "@/utils/remark-default-fence-lang";
import { CodeBlock } from "@/components/ui-abc/code/code-block";
import type { NodeMarkdownBlock } from "../../types/types";
import {
  inFencedCodeAt,
  isFenceDrivenBlock,
  selectionIntersectsFencedCode,
} from "../utils/markdown-fence";
import { newMarkdownBlockId } from "../utils/node-ids";
import { MarkdownLineHighlightToolbar } from "./MarkdownLineHighlightToolbar";
import { MarkdownLinkUrlPopover } from "./MarkdownLinkUrlPopover";
import { MarkdownResolvingImg } from "./MarkdownResolvingImg";
import { NODE_MD_BODY_TYPO } from "../constants";
import {
  NODE_MD_ALIGN,
  NODE_MD_FONT,
  NODE_MD_HL,
  buildMarkdownLinkHtml,
  type NodeMdAlignKind,
  type NodeMdFontKind,
  type NodeMdHlKind,
} from "../utils/node-markdown-inline-hl";
import { getTextareaRangeClientRect } from "../utils/textarea-selection-rect";

/** Рядок виглядає як пункт нумерованого списку markdown (`1. …`). */
function isOrderedListLineMarkdown(text: string): boolean {
  return /^\s*\d+\.\s/.test(text);
}

const UNDO_STACK_MAX = 80;
const UNDO_DEBOUNCE_MS = 320;

function InlineMdxToolbar() {
  return (
    <>
      <UndoRedo />
      <Separator />
      <BoldItalicUnderlineToggles />
      <CodeToggle />
      <Separator />
      <ListsToggle />
      <Separator />
      <BlockTypeSelect />
      <Separator />
      <CreateLink />
    </>
  );
}

const INLINE_MDX_PLUGINS = [
  headingsPlugin(),
  listsPlugin(),
  quotePlugin(),
  thematicBreakPlugin(),
  markdownShortcutPlugin(),
  toolbarPlugin({
    toolbarContents: () => <InlineMdxToolbar />,
  }),
];

function cloneMarkdownBlocks(blocks: NodeMarkdownBlock[]): NodeMarkdownBlock[] {
  return blocks.map((b) => ({ id: b.id, text: b.text }));
}

function blocksEqual(a: NodeMarkdownBlock[], b: NodeMarkdownBlock[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i]!.id !== b[i]!.id || a[i]!.text !== b[i]!.text) return false;
  }
  return true;
}

export function nodeMarkdownPreviewComponents(
  fg: string,
  fgMuted: string,
): Partial<Components> {
  return {
    p: ({ children }) => (
      <p className={`my-0 ${NODE_MD_BODY_TYPO}`}>{children}</p>
    ),
    h1: ({ children }) => (
      <h1
        className="my-0 pb-1 text-[1.35rem] font-extrabold leading-tight tracking-tight"
        style={{ color: fg }}
      >
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2
        className="my-0 pb-0.5 text-[1.2rem] font-bold leading-tight"
        style={{ color: fg }}
      >
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3
        className="my-0 text-[1.05rem] font-semibold leading-snug"
        style={{ color: fg }}
      >
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4
        className="my-0 text-[0.95rem] font-semibold leading-snug"
        style={{ color: fg }}
      >
        {children}
      </h4>
    ),
    h5: ({ children }) => (
      <h5 className="my-0 text-[0.88rem] font-medium leading-snug">{children}</h5>
    ),
    h6: ({ children }) => (
      <h6 className="my-0 text-[0.82rem] font-medium leading-snug opacity-90">
        {children}
      </h6>
    ),
    ul: ({ children }) => (
      <ul className={`my-0 list-disc pl-4 ${NODE_MD_BODY_TYPO}`}>{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className={`my-0 list-decimal pl-4 ${NODE_MD_BODY_TYPO}`}>
        {children}
      </ol>
    ),
    li: ({ children }) => <li className="my-0">{children}</li>,
    blockquote: ({ children }) => (
      <blockquote
        className={`my-0 border-l-2 pl-2 italic opacity-90 ${NODE_MD_BODY_TYPO}`}
        style={{ borderColor: fgMuted }}
      >
        {children}
      </blockquote>
    ),
    code: ({ className, children, node }) => (
      <CodeBlock className={className} node={node} variant="embedded">
        {children}
      </CodeBlock>
    ),
    pre: ({ children }) => <Fragment>{children}</Fragment>,
    a: ({ href, children }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="markdown-node-preview-link text-[#5e86ff] underline underline-offset-[3px] decoration-[#5e86ff] transition-colors hover:text-[#5e86ff]"
      >
        {children}
      </a>
    ),
    hr: () => (
      <hr
        className="my-1 border-0 border-t"
        style={{ borderColor: fgMuted }}
      />
    ),
    strong: ({ children }) => (
      <strong className="font-semibold">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    span: ({ className, children }) => (
      <span className={className}>{children}</span>
    ),
    img: ({ src, alt, className }) => (
      <MarkdownResolvingImg
        src={src}
        alt={alt}
        className={
          className ??
          "my-2 block w-full max-w-full max-h-[min(72vh,40rem)] rounded border border-border/20 object-contain"
        }
      />
    ),
  };
}

function useTextareaAutosize(
  ref: RefObject<HTMLTextAreaElement | null>,
  value: string,
) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0";
    el.style.height = `${Math.max(28, el.scrollHeight)}px`;
  }, [ref, value]);
}

interface NodeMarkdownBlocksEditorProps {
  nodeId: string;
  blocks: NodeMarkdownBlock[];
  onBlocksChange: (blocks: NodeMarkdownBlock[]) => void;
  selectionEditorMode?: "toolbar" | "mdx";
  /**
   * Ctrl/⌘+V: вставити зображення з буфера як `![](<url>)` після upload у Storage.
   * Без пропа — лише текстовий paste (як раніше).
   */
  uploadPasteImage?: (file: File) => Promise<string>;
}

function InactiveMarkdownLineRow({
  line,
  mdComponents,
  onActivate,
}: {
  line: NodeMarkdownBlock;
  mdComponents: Partial<Components>;
  onActivate: () => void;
}) {
  const empty = !line.text.trim();
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Редагувати рядок markdown"
      className="w-full cursor-text px-0 py-0.5 text-left outline-none select-text hover:bg-foreground/[0.03] focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-inset"
      onPointerDown={(e) => {
        const t = e.target as HTMLElement | null;
        if (
          t?.closest(
            "a, button, input, textarea, select, [contenteditable='true']",
          )
        ) {
          return;
        }
        e.preventDefault();
        e.stopPropagation();
        onActivate();
      }}
      onKeyDown={(e) => {
        if (e.code !== "Enter" && e.code !== "Space") return;
        e.preventDefault();
        e.stopPropagation();
        onActivate();
      }}
    >
      {empty ? (
        <div className={`min-h-[1.5rem] px-2 py-1 ${NODE_MD_BODY_TYPO}`} aria-hidden />
      ) : (
        <div className={`markdown-node-preview px-2 py-1 ${NODE_MD_BODY_TYPO}`}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkDefaultFenceLang]}
            rehypePlugins={[rehypeRaw]}
            components={mdComponents}
          >
            {line.text}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}

export function NodeMarkdownBlocksEditor({
  nodeId,
  blocks,
  onBlocksChange,
  selectionEditorMode = "toolbar",
  uploadPasteImage,
}: NodeMarkdownBlocksEditorProps) {
  const [activeLineId, setActiveLineId] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<Map<string, HTMLTextAreaElement>>(new Map());
  const focusCaretRef = useRef<{ id: string; pos: number } | null>(null);
  const uploadPasteImageRef = useRef(uploadPasteImage);
  uploadPasteImageRef.current = uploadPasteImage;

  const blocksRef = useRef(blocks);
  blocksRef.current = blocks;

  const pastRef = useRef<NodeMarkdownBlock[][]>([]);
  const futureRef = useRef<NodeMarkdownBlock[][]>([]);
  const burstRef = useRef<{
    snapshot: NodeMarkdownBlock[] | null;
    timer: ReturnType<typeof setTimeout> | null;
  }>({ snapshot: null, timer: null });
  const skipHistoryRef = useRef(false);

  useEffect(() => {
    pastRef.current = [];
    futureRef.current = [];
    if (burstRef.current.timer) clearTimeout(burstRef.current.timer);
    burstRef.current = { snapshot: null, timer: null };
  }, [nodeId]);

  useEffect(() => {
    return () => {
      if (burstRef.current.timer) clearTimeout(burstRef.current.timer);
    };
  }, []);

  const commitBlocks = useCallback(
    (next: NodeMarkdownBlock[]) => {
      if (skipHistoryRef.current) {
        onBlocksChange(next);
        return;
      }
      const cur = blocksRef.current;
      if (blocksEqual(cur, next)) return;
      if (!burstRef.current.snapshot) {
        burstRef.current.snapshot = cloneMarkdownBlocks(cur);
        futureRef.current = [];
      }
      if (burstRef.current.timer) clearTimeout(burstRef.current.timer);
      burstRef.current.timer = setTimeout(() => {
        if (burstRef.current.snapshot) {
          pastRef.current.push(burstRef.current.snapshot);
          if (pastRef.current.length > UNDO_STACK_MAX) pastRef.current.shift();
          burstRef.current.snapshot = null;
        }
        burstRef.current.timer = null;
      }, UNDO_DEBOUNCE_MS);
      onBlocksChange(next);
    },
    [onBlocksChange],
  );

  const tryUndo = useCallback((): boolean => {
    if (burstRef.current.timer) {
      clearTimeout(burstRef.current.timer);
      burstRef.current.timer = null;
    }
    if (burstRef.current.snapshot) {
      const s0 = burstRef.current.snapshot;
      const s1 = cloneMarkdownBlocks(blocksRef.current);
      burstRef.current.snapshot = null;
      if (!blocksEqual(s0, s1)) {
        futureRef.current.push(s1);
        skipHistoryRef.current = true;
        onBlocksChange(cloneMarkdownBlocks(s0));
        skipHistoryRef.current = false;
        return true;
      }
    }
    if (pastRef.current.length === 0) return false;
    const prev = pastRef.current.pop()!;
    const cur = cloneMarkdownBlocks(blocksRef.current);
    futureRef.current.push(cur);
    skipHistoryRef.current = true;
    onBlocksChange(prev);
    skipHistoryRef.current = false;
    return true;
  }, [onBlocksChange]);

  const tryRedo = useCallback((): boolean => {
    if (futureRef.current.length === 0) return false;
    const next = futureRef.current.pop()!;
    const cur = cloneMarkdownBlocks(blocksRef.current);
    pastRef.current.push(cur);
    skipHistoryRef.current = true;
    onBlocksChange(next);
    skipHistoryRef.current = false;
    return true;
  }, [onBlocksChange]);

  const mdComponents = useMemo(
    () =>
      nodeMarkdownPreviewComponents("var(--foreground)", "var(--muted-foreground)"),
    [],
  );

  useEffect(() => {
    if (activeLineId && !blocks.some((b) => b.id === activeLineId)) {
      setActiveLineId(null);
    }
  }, [blocks, activeLineId]);

  useEffect(() => {
    if (!activeLineId) return;
    const onDocDown = (e: MouseEvent) => {
      if (rootRef.current?.contains(e.target as Node)) return;
      setActiveLineId(null);
    };
    document.addEventListener("mousedown", onDocDown, true);
    return () => document.removeEventListener("mousedown", onDocDown, true);
  }, [activeLineId]);

  useEffect(() => {
    if (!activeLineId) return;
    const id = requestAnimationFrame(() => {
      const el = lineRefs.current.get(activeLineId);
      if (!el) return;
      el.focus();
      const meta = focusCaretRef.current;
      if (meta?.id === activeLineId) {
        const p = Math.min(meta.pos, el.value.length);
        el.setSelectionRange(p, p);
        focusCaretRef.current = null;
      } else {
        el.setSelectionRange(el.value.length, el.value.length);
      }
    });
    return () => cancelAnimationFrame(id);
  }, [activeLineId]);

  const setLineRef = useCallback((lineId: string) => {
    return (el: HTMLTextAreaElement | null) => {
      if (el) lineRefs.current.set(lineId, el);
      else lineRefs.current.delete(lineId);
    };
  }, []);

  const lineTextareaClass = `w-full resize-none overflow-hidden bg-transparent px-2 py-1 text-foreground/90 outline-none placeholder:text-muted-foreground placeholder:opacity-50 select-text ${NODE_MD_BODY_TYPO}`;
  const focusActiveOrLastLine = useCallback(() => {
    if (activeLineId) {
      const ta = lineRefs.current.get(activeLineId);
      if (ta) {
        ta.focus();
        const pos = ta.value.length;
        ta.setSelectionRange(pos, pos);
        return;
      }
    }
    const list = blocksRef.current;
    const target = list[list.length - 1];
    if (!target) return;
    focusCaretRef.current = { id: target.id, pos: target.text.length };
    setActiveLineId(target.id);
  }, [activeLineId]);
  return (
    <div
      ref={rootRef}
      data-node-markdown-root={nodeId}
      className="min-h-0 min-w-0 w-full flex-1 overflow-y-auto overflow-x-hidden text-foreground/90 select-none"
      onPointerDown={(e) => {
        e.stopPropagation();
        const target = e.target as HTMLElement | null;
        if (!target) return;
        if (
          target.closest(
            "textarea, input, button, a, [contenteditable='true'], [data-md-hl-toolbar], [data-md-link-popover], [data-mdx-inline-popover]",
          )
        ) {
          return;
        }
        // Клік у порожню область редактора: одразу активуємо останній рядок для вводу.
        focusActiveOrLastLine();
      }}
    >
      {(() => {
        const rows: ReactNode[] = [];
        let i = 0;
        while (i < blocks.length) {
          const line = blocks[i]!;
          const idx = i;
          if (activeLineId === line.id) {
            rows.push(
              <LineEditor
                key={line.id}
                line={line}
                idx={idx}
                blocks={blocks}
                blocksRef={blocksRef}
                lineTextareaClass={lineTextareaClass}
                setLineRef={setLineRef}
                onBlocksChange={commitBlocks}
                tryUndo={tryUndo}
                tryRedo={tryRedo}
                setActiveLineId={setActiveLineId}
                focusCaretRef={focusCaretRef}
                uploadPasteImageRef={uploadPasteImageRef}
                selectionEditorMode={selectionEditorMode}
              />,
            );
            i++;
            continue;
          }

          const lineEmpty = !line.text.trim();
          if (!lineEmpty && isOrderedListLineMarkdown(line.text)) {
            const run: NodeMarkdownBlock[] = [];
            let j = i;
            while (j < blocks.length) {
              const b = blocks[j]!;
              if (activeLineId === b.id) break;
              if (!b.text.trim()) break;
              if (!isOrderedListLineMarkdown(b.text)) break;
              run.push(b);
              j++;
            }
            if (run.length > 1) {
              rows.push(
                <div key={`ol-run-${run[0]!.id}`} className="md-node-ol-run">
                  {run.map((bl) => (
                    <InactiveMarkdownLineRow
                      key={bl.id}
                      line={bl}
                      mdComponents={mdComponents}
                      onActivate={() => {
                        focusCaretRef.current = {
                          id: bl.id,
                          pos: bl.text.length,
                        };
                        setActiveLineId(bl.id);
                      }}
                    />
                  ))}
                </div>,
              );
              i = j;
              continue;
            }
          }

          rows.push(
            <InactiveMarkdownLineRow
              key={line.id}
              line={line}
              mdComponents={mdComponents}
              onActivate={() => {
                focusCaretRef.current = { id: line.id, pos: line.text.length };
                setActiveLineId(line.id);
              }}
            />,
          );
          i++;
        }
        return rows;
      })()}
    </div>
  );
}

interface LineEditorProps {
  line: NodeMarkdownBlock;
  idx: number;
  blocks: NodeMarkdownBlock[];
  blocksRef: MutableRefObject<NodeMarkdownBlock[]>;
  lineTextareaClass: string;
  setLineRef: (id: string) => (el: HTMLTextAreaElement | null) => void;
  onBlocksChange: (blocks: NodeMarkdownBlock[]) => void;
  tryUndo: () => boolean;
  tryRedo: () => boolean;
  setActiveLineId: (id: string | null) => void;
  focusCaretRef: MutableRefObject<{ id: string; pos: number } | null>;
  uploadPasteImageRef: MutableRefObject<
    ((file: File) => Promise<string>) | undefined
  >;
  selectionEditorMode: "toolbar" | "mdx";
}

function LineEditor({
  line,
  idx,
  blocks,
  blocksRef,
  lineTextareaClass,
  setLineRef,
  onBlocksChange,
  tryUndo,
  tryRedo,
  setActiveLineId,
  focusCaretRef,
  uploadPasteImageRef,
  selectionEditorMode,
}: LineEditorProps) {
  const taRef = useRef<HTMLTextAreaElement | null>(null);
  const hlSelRef = useRef<{ start: number; end: number } | null>(null);
  const [hlBar, setHlBar] = useState<{
    open: boolean;
    x: number;
    y: number;
    placement: "above" | "below";
  }>({ open: false, x: 0, y: 0, placement: "below" });

  const [linkPopover, setLinkPopover] = useState<{
    x: number;
    y: number;
    placement: "above" | "below";
  } | null>(null);
  const [linkNonce, setLinkNonce] = useState(0);
  const mdxRangeRef = useRef<{ start: number; end: number } | null>(null);
  const [mdxMarkdown, setMdxMarkdown] = useState("");

  useTextareaAutosize(taRef, line.text);

  const bindRef = useCallback(
    (el: HTMLTextAreaElement | null) => {
      taRef.current = el;
      setLineRef(line.id)(el);
    },
    [line.id, setLineRef],
  );

  const syncHlBar = useCallback(() => {
    const ta = taRef.current;
    if (!ta) return;
    const ae = document.activeElement;
    if (
      ae instanceof Element &&
      ae.closest("[data-md-hl-toolbar]") &&
      ae !== ta
    ) {
      return;
    }
    if (ae instanceof Element && ae.closest("[data-md-link-popover]")) {
      return;
    }
    if (ae instanceof Element && ae.closest("[data-mdx-inline-popover]")) {
      return;
    }
    if (ae !== ta) {
      setHlBar((s) => (s.open ? { ...s, open: false } : s));
      return;
    }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    if (start === end) {
      hlSelRef.current = null;
      mdxRangeRef.current = null;
      setHlBar((s) => ({ ...s, open: false }));
      return;
    }
    if (selectionIntersectsFencedCode(line.text, start, end)) {
      hlSelRef.current = null;
      mdxRangeRef.current = null;
      setHlBar((s) => ({ ...s, open: false }));
      return;
    }
    const lo = Math.min(start, end);
    const hi = Math.max(start, end);
    const slice = line.text.slice(lo, hi);
    if (/[<>]/.test(slice)) {
      hlSelRef.current = null;
      mdxRangeRef.current = null;
      setHlBar((s) => ({ ...s, open: false }));
      return;
    }
    hlSelRef.current = { start: lo, end: hi };
    const rangeRect = getTextareaRangeClientRect(ta, lo, hi);
    const r = ta.getBoundingClientRect();
    let centerX: number;
    let y: number;
    let placement: "above" | "below";
    if (
      rangeRect &&
      (rangeRect.width > 0 || rangeRect.height > 0) &&
      Number.isFinite(rangeRect.top)
    ) {
      centerX = rangeRect.left + rangeRect.width / 2;
      placement = rangeRect.top > 150 ? "above" : "below";
      y = placement === "above" ? rangeRect.top - 8 : rangeRect.bottom + 8;
    } else {
      centerX = r.left + r.width / 2;
      placement = r.top > 150 ? "above" : "below";
      y = placement === "above" ? r.top - 8 : r.bottom + 8;
    }
    setHlBar({ open: true, x: centerX, y, placement });
  }, [line.text]);

  useEffect(() => {
    if (selectionEditorMode !== "mdx" || !hlBar.open) return;
    if (mdxRangeRef.current) return;
    const saved = hlSelRef.current;
    if (!saved) return;
    mdxRangeRef.current = { start: saved.start, end: saved.end };
    setMdxMarkdown(line.text.slice(saved.start, saved.end));
  }, [hlBar.open, line.id, selectionEditorMode]);

  const applyTaggedHtml = useCallback(
    (openTag: string, closeTag: string) => {
      const ta = taRef.current;
      const saved = hlSelRef.current;
      if (!ta || !saved) return;
      let { start, end } = saved;
      if (start > end) [start, end] = [end, start];
      const text = line.text;
      if (selectionIntersectsFencedCode(text, start, end)) return;
      const sel = text.slice(start, end);
      if (/[<>]/.test(sel)) return;
      const next =
        text.slice(0, start) + openTag + sel + closeTag + text.slice(end);
      onBlocksChange(
        blocks.map((b) => (b.id === line.id ? { ...b, text: next } : b)),
      );
      const caret = start + openTag.length + sel.length + closeTag.length;
      hlSelRef.current = null;
      setHlBar((s) => ({ ...s, open: false }));
      requestAnimationFrame(() => {
        ta.focus();
        ta.setSelectionRange(caret, caret);
      });
    },
    [blocks, line.id, line.text, onBlocksChange],
  );

  const applyHl = useCallback(
    (kind: NodeMdHlKind) => {
      const { open: o, close: c } = NODE_MD_HL[kind];
      applyTaggedHtml(o, c);
    },
    [applyTaggedHtml],
  );

  const applyAlign = useCallback(
    (kind: NodeMdAlignKind) => {
      const { open: o, close: c } = NODE_MD_ALIGN[kind];
      applyTaggedHtml(o, c);
    },
    [applyTaggedHtml],
  );

  const applyFont = useCallback(
    (kind: NodeMdFontKind) => {
      const { open: o, close: c } = NODE_MD_FONT[kind];
      applyTaggedHtml(o, c);
    },
    [applyTaggedHtml],
  );

  const openLinkPopover = useCallback(() => {
    const ta = taRef.current;
    const saved = hlSelRef.current;
    if (!ta || !saved) return;
    let { start, end } = saved;
    if (start > end) [start, end] = [end, start];
    const text = line.text;
    if (selectionIntersectsFencedCode(text, start, end)) return;
    const sel = text.slice(start, end);
    if (/[<>]/.test(sel)) return;

    const rangeRect = getTextareaRangeClientRect(ta, start, end);
    const r = ta.getBoundingClientRect();
    let centerX: number;
    let y: number;
    let placement: "above" | "below";
    if (
      rangeRect &&
      (rangeRect.width > 0 || rangeRect.height > 0) &&
      Number.isFinite(rangeRect.top)
    ) {
      centerX = rangeRect.left + rangeRect.width / 2;
      placement = rangeRect.top > 150 ? "above" : "below";
      y = placement === "above" ? rangeRect.top - 8 : rangeRect.bottom + 8;
    } else {
      centerX = r.left + r.width / 2;
      placement = r.top > 150 ? "above" : "below";
      y = placement === "above" ? r.top - 8 : r.bottom + 8;
    }

    setLinkNonce((n) => n + 1);
    setLinkPopover({ x: centerX, y, placement });
    setHlBar((s) => ({ ...s, open: false }));
  }, [line.text]);

  const dismissLinkPopover = useCallback(() => {
    setLinkPopover(null);
    const ta = taRef.current;
    const saved = hlSelRef.current;
    requestAnimationFrame(() => {
      if (!ta || !saved) return;
      ta.focus();
      ta.setSelectionRange(saved.start, saved.end);
    });
  }, []);

  const commitLink = useCallback(
    (hrefRaw: string) => {
      const ta = taRef.current;
      const saved = hlSelRef.current;
      if (!ta || !saved) {
        setLinkPopover(null);
        return;
      }
      let { start, end } = saved;
      if (start > end) [start, end] = [end, start];
      const text = line.text;
      if (selectionIntersectsFencedCode(text, start, end)) {
        setLinkPopover(null);
        return;
      }
      const sel = text.slice(start, end);
      if (/[<>]/.test(sel)) {
        setLinkPopover(null);
        return;
      }
      const html = buildMarkdownLinkHtml(hrefRaw, sel);
      if (!html) return;

      const next = text.slice(0, start) + html + text.slice(end);
      onBlocksChange(
        blocks.map((b) => (b.id === line.id ? { ...b, text: next } : b)),
      );
      const caret = start + html.length;
      hlSelRef.current = null;
      setHlBar((s) => ({ ...s, open: false }));
      setLinkPopover(null);
      requestAnimationFrame(() => {
        ta.focus();
        ta.setSelectionRange(caret, caret);
      });
    },
    [blocks, line.id, line.text, onBlocksChange],
  );

  useEffect(() => {
    const onSel = () => syncHlBar();
    document.addEventListener("selectionchange", onSel);
    return () => document.removeEventListener("selectionchange", onSel);
  }, [syncHlBar]);

  useEffect(() => {
    if (!hlBar.open && !linkPopover) return;
    const close = (e: MouseEvent) => {
      const t = e.target;
      if (!(t instanceof Node)) return;
      if (t instanceof Element) {
        if (t.closest("[data-md-hl-toolbar]")) return;
        if (t.closest("[data-md-link-popover]")) return;
        if (t.closest("[data-mdx-inline-popover]")) return;
        if (t.closest("[data-radix-popper-content-wrapper]")) return;
      }
      const ta = taRef.current;
      if (ta?.contains(t)) {
        if (linkPopover) {
          setLinkPopover(null);
          const saved = hlSelRef.current;
          requestAnimationFrame(() => {
            if (ta && saved) ta.setSelectionRange(saved.start, saved.end);
          });
        }
        return;
      }
      setHlBar((s) => ({ ...s, open: false }));
      setLinkPopover(null);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [hlBar.open, linkPopover]);

  return (
    <div className="relative">
      <MarkdownLineHighlightToolbar
        open={selectionEditorMode === "toolbar" && hlBar.open}
        anchorX={hlBar.x}
        anchorY={hlBar.y}
        placement={hlBar.placement}
        onHl={applyHl}
        onAlign={applyAlign}
        onFont={applyFont}
        onLink={openLinkPopover}
      />
      <MarkdownLinkUrlPopover
        key={linkNonce}
        open={selectionEditorMode === "toolbar" && linkPopover !== null}
        anchorX={linkPopover?.x ?? 0}
        anchorY={linkPopover?.y ?? 0}
        placement={linkPopover?.placement ?? "above"}
        onApply={commitLink}
        onDismiss={dismissLinkPopover}
      />
      {selectionEditorMode === "mdx" && hlBar.open ? (
        typeof document !== "undefined"
          ? createPortal(
              <div
                data-mdx-inline-popover
                className="fixed z-[10010] w-[min(42rem,90vw)] overflow-visible rounded-xl border border-zinc-700/50 bg-zinc-950/95 shadow-[0_18px_45px_-18px_rgba(0,0,0,0.8)] backdrop-blur-sm"
                style={{
                  left: Math.max(24, Math.min(window.innerWidth - 24, hlBar.x)),
                  top: hlBar.y,
                  transform:
                    hlBar.placement === "above"
                      ? "translate(-50%, calc(-100% - 10px))"
                      : "translate(-50%, 10px)",
                }}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <div className="p-2">
                  <MDXEditor
                    className="mdx-inline-toolbar-only"
                    markdown={mdxMarkdown}
                    plugins={INLINE_MDX_PLUGINS}
                    contentEditableClassName="m-0 h-0 max-h-0 overflow-hidden border-0 p-0 opacity-0 pointer-events-none"
                    onChange={(nextMarkdown) => {
                      const range = mdxRangeRef.current;
                      if (!range) return;
                      const nextStart = range.start;
                      const nextEnd = range.end;
                      setMdxMarkdown(nextMarkdown);
                      onBlocksChange(
                        blocks.map((b) =>
                          b.id === line.id
                            ? {
                                ...b,
                                text:
                                  b.text.slice(0, nextStart) +
                                  nextMarkdown +
                                  b.text.slice(nextEnd),
                              }
                            : b,
                        ),
                      );
                      mdxRangeRef.current = {
                        start: nextStart,
                        end: nextStart + nextMarkdown.length,
                      };
                    }}
                  />
                </div>
              </div>,
              document.body,
            )
          : null
      ) : null}
      <textarea
        ref={bindRef}
        value={line.text}
        rows={1}
        onChange={(e) => {
          setHlBar((s) => ({ ...s, open: false }));
          hlSelRef.current = null;
          const v = e.target.value;
          if (!v.includes("\n")) {
            onBlocksChange(
              blocks.map((b) => (b.id === line.id ? { ...b, text: v } : b)),
            );
            return;
          }
        if (isFenceDrivenBlock(v)) {
          onBlocksChange(
            blocks.map((b) => (b.id === line.id ? { ...b, text: v } : b)),
          );
          return;
        }
        const idxLocal = blocks.findIndex((b) => b.id === line.id);
        if (idxLocal < 0) return;
        const parts = v.split("\n");
        const next = [
          ...blocks.slice(0, idxLocal),
          ...parts.map((t, j) => ({
            id: j === 0 ? line.id : newMarkdownBlockId(),
            text: t,
          })),
          ...blocks.slice(idxLocal + 1),
        ];
        onBlocksChange(next);
        const lastId = parts.length > 1 ? next[idxLocal + parts.length - 1]!.id : line.id;
        const lastText = next.find((b) => b.id === lastId)!.text;
        focusCaretRef.current = { id: lastId, pos: lastText.length };
        setActiveLineId(lastId);
      }}
      onPaste={(e) => {
        const upload = uploadPasteImageRef.current;
        const items = e.clipboardData?.items;
        if (upload && items?.length) {
          for (let ii = 0; ii < items.length; ii++) {
            const it = items[ii];
            if (it?.kind === "file" && it.type.startsWith("image/")) {
              const file = it.getAsFile();
              if (file) {
                e.preventDefault();
                const lineId = line.id;
                void (async () => {
                  try {
                    const httpsUrl = await upload(file);
                    const md = `![](<${httpsUrl}>)`;
                    const cur = blocksRef.current;
                    const curIdx = cur.findIndex((b) => b.id === lineId);
                    if (curIdx < 0) return;
                    const curLine = cur[curIdx]!;
                    const lineIsBlank = !curLine.text.trim();

                    // Для pasted image не перетираємо поточний markdown:
                    // вставляємо окремий markdown-блок із зображенням після активного рядка.
                    let nextBlocks: NodeMarkdownBlock[];
                    let nextActiveId: string;
                    let caret = 0;
                    if (lineIsBlank) {
                      nextActiveId = lineId;
                      caret = md.length;
                      nextBlocks = cur.map((b) =>
                        b.id === lineId ? { ...b, text: md } : b,
                      );
                    } else {
                      nextActiveId = newMarkdownBlockId();
                      nextBlocks = [
                        ...cur.slice(0, curIdx + 1),
                        { id: nextActiveId, text: md },
                        ...cur.slice(curIdx + 1),
                      ];
                      caret = md.length;
                    }

                    onBlocksChange(nextBlocks);
                    focusCaretRef.current = { id: nextActiveId, pos: caret };
                    setActiveLineId(nextActiveId);
                    requestAnimationFrame(() => {
                      const ta = taRef.current;
                      if (!ta) return;
                      ta.focus();
                      ta.setSelectionRange(caret, caret);
                    });
                  } catch (err) {
                    console.error(
                      "[Node writer] Не вдалося вставити зображення в markdown",
                      err,
                    );
                  }
                })();
                return;
              }
            }
          }
        }

        const clip = e.clipboardData.getData("text/plain");
        if (!clip.includes("\n")) return;
        const el = e.currentTarget;
        const start = el.selectionStart;
        const end = el.selectionEnd;
        const before = line.text.slice(0, start);
        const after = line.text.slice(end);
        const normalized = clip.replace(/\r\n/g, "\n");
        const trimmedStart = normalized.trimStart();
        e.preventDefault();

        const idxLocal = blocks.findIndex((b) => b.id === line.id);
        if (idxLocal < 0) return;

        // Вставка fenced-блоку коду як є (один блок)
        if (/^```[\w-]*/.test(trimmedStart)) {
          const inserted = `${before}${normalized}${after}`;
          onBlocksChange(
            blocks.map((b) => (b.id === line.id ? { ...b, text: inserted } : b)),
          );
          const pos = inserted.length - after.length;
          focusCaretRef.current = { id: line.id, pos };
          setActiveLineId(line.id);
          return;
        }

        const merged = `${before}${normalized}${after}`;
        if (isFenceDrivenBlock(merged)) {
          onBlocksChange(
            blocks.map((b) => (b.id === line.id ? { ...b, text: merged } : b)),
          );
          const pos = before.length + normalized.length;
          focusCaretRef.current = { id: line.id, pos };
          setActiveLineId(line.id);
          return;
        }

        const parts = merged.split("\n");
        const next = [
          ...blocks.slice(0, idxLocal),
          ...parts.map((t, j) => ({
            id: j === 0 ? line.id : newMarkdownBlockId(),
            text: t,
          })),
          ...blocks.slice(idxLocal + 1),
        ];
        onBlocksChange(next);
        const lastId =
          parts.length > 1 ? next[idxLocal + parts.length - 1]!.id : line.id;
        const lastText = next.find((b) => b.id === lastId)!.text;
        focusCaretRef.current = { id: lastId, pos: lastText.length };
        setActiveLineId(lastId);
      }}
      onMouseUp={syncHlBar}
      onKeyUp={syncHlBar}
      onKeyDown={(e) => {
        const mod = e.ctrlKey || e.metaKey;
        if (mod && e.code === "KeyZ") {
          if (e.shiftKey) {
            if (tryRedo()) {
              e.preventDefault();
              return;
            }
          } else if (tryUndo()) {
            e.preventDefault();
            return;
          }
        }
        if (mod && e.code === "KeyY" && !e.shiftKey && tryRedo()) {
          e.preventDefault();
          return;
        }

        const el = e.currentTarget;
        const start = el.selectionStart;
        const end = el.selectionEnd;
        const insideFence = inFencedCodeAt(line.text, start);

        if (
          (e.code === "Enter" || e.code === "NumpadEnter") &&
          !e.shiftKey
        ) {
          if (insideFence) {
            return;
          }
          e.preventDefault();
          const before = line.text.slice(0, start);
          const after = line.text.slice(end);
          const newId = newMarkdownBlockId();
          const next = [
            ...blocks.slice(0, idx),
            { ...line, text: before },
            { id: newId, text: after },
            ...blocks.slice(idx + 1),
          ];
          onBlocksChange(next);
          focusCaretRef.current = { id: newId, pos: 0 };
          setActiveLineId(newId);
          return;
        }

        if (e.code === "Backspace" && start === 0 && end === 0 && idx > 0) {
          e.preventDefault();
          const prev = blocks[idx - 1]!;
          const mergedText = prev.text + line.text;
          const next = [
            ...blocks.slice(0, idx - 1),
            { ...prev, text: mergedText },
            ...blocks.slice(idx + 1),
          ];
          onBlocksChange(next);
          focusCaretRef.current = { id: prev.id, pos: prev.text.length };
          setActiveLineId(prev.id);
          return;
        }

        if (e.code === "ArrowUp" && start === 0 && idx > 0) {
          e.preventDefault();
          const prev = blocks[idx - 1]!;
          focusCaretRef.current = { id: prev.id, pos: prev.text.length };
          setActiveLineId(prev.id);
          return;
        }

        if (
          e.code === "ArrowDown" &&
          start === line.text.length &&
          idx < blocks.length - 1
        ) {
          e.preventDefault();
          const nxt = blocks[idx + 1]!;
          focusCaretRef.current = { id: nxt.id, pos: 0 };
          setActiveLineId(nxt.id);
          return;
        }
      }}
      placeholder="Markdown…"
      className={lineTextareaClass}
      spellCheck={false}
    />
    </div>
  );
}

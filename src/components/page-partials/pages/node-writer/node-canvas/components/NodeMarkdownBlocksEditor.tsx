import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import { $createParagraphNode } from "lexical";
import type { Components } from "react-markdown";
import {
  BoldItalicUnderlineToggles,
  type CodeBlockEditorProps,
  CodeMirrorEditor,
  CodeToggle,
  CreateLink,
  InsertCodeBlock,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  ListsToggle,
  MDXEditor,
  StrikeThroughSupSubToggles,
  UndoRedo,
  activePlugins$,
  allowedHeadingLevels$,
  codeBlockPlugin,
  codeBlockLanguages$,
  codeMirrorPlugin,
  convertSelectionToNode$,
  currentBlockType$,
  headingsPlugin,
  imagePlugin,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  quotePlugin,
  tablePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
  useCellValue,
  useCodeBlockEditorContext,
  usePublisher,
} from "@mdxeditor/editor";
import { EditorView } from "@codemirror/view";
import "@mdxeditor/editor/style.css";
import { CodeBlock } from "@/components/ui-abc/code/code-block";
import { Check, Copy } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import type { NodeMarkdownBlock } from "../../types/types";
import { newMarkdownBlockId } from "../utils/node-ids";
import { MarkdownResolvingImg } from "./MarkdownResolvingImg";
import { NODE_MD_BODY_TYPO } from "../constants";
import { normalizeMultiLineListItems } from "../utils/normalize-list-lines";
import { clearNodeWriterMarkdownSelection } from "../utils/clear-markdown-selection";

function markdownToBlocks(
  markdown: string,
  prevBlocks: NodeMarkdownBlock[],
): NodeMarkdownBlock[] {
  const lines = markdown.split("\n");
  const safeLines = lines.length > 0 ? lines : [""];
  return safeLines.map((text, index) => ({
    id: prevBlocks[index]?.id ?? newMarkdownBlockId(),
    text,
  }));
}

const MDX_PORTAL_INTERACTION_SELECTOR = [
  ".nw-global-mdx-toolbar",
  "[data-radix-popper-content-wrapper]",
  "[class*='_toolbarNodeKindSelectContainer_']",
  "[class*='_toolbarButtonDropdownContainer_']",
  "[class*='_toolbarCodeBlockLanguageSelectContent_']",
  "[class*='_toolbarCodeBlockLanguageSelectTrigger_']",
  "[class*='_selectContainer_']",
  "[class*='_selectContent_']",
  "[class*='_selectTrigger_']",
  "[class*='_popoverContent_']",
  "[role='listbox']",
].join(", ");

const MDX_SELECT_TRIGGER_SELECTOR = [
  "[class*='_toolbarNodeKindSelectTrigger_']",
  "[class*='_toolbarButtonSelectTrigger_']",
  "[class*='_toolbarCodeBlockLanguageSelectTrigger_']",
  "[class*='_selectTrigger_']",
  "[role='combobox']",
].join(", ");

function markMdxPortalInteraction() {
  if (typeof document === "undefined") return;
  document.body.dataset.nwMdxPortalInteraction = "true";
  window.setTimeout(() => {
    if (document.body.dataset.nwMdxPortalInteraction === "true") {
      delete document.body.dataset.nwMdxPortalInteraction;
    }
  }, 250);
}

function isMdxPortalInteractionTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    !!target.closest(MDX_PORTAL_INTERACTION_SELECTOR)
  );
}

function isMdxSelectTriggerTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    !!target.closest(MDX_SELECT_TRIGGER_SELECTOR)
  );
}

const MDX_EMPTY_CODE_LANGUAGE_VALUE = "__EMPTY_VALUE__";

function NodeBlockTypeSelect() {
  const convertSelectionToNode = usePublisher(convertSelectionToNode$);
  const currentBlockType = useCellValue(currentBlockType$);
  const activePlugins = useCellValue(activePlugins$);
  const allowedHeadingLevels = useCellValue(allowedHeadingLevels$);
  const hasQuote = activePlugins.includes("quote");
  const hasHeadings = activePlugins.includes("headings");

  if (!hasQuote && !hasHeadings) return null;

  const items = [
    { label: "Paragraph", value: "paragraph" },
    ...(hasQuote ? [{ label: "Quote", value: "quote" }] : []),
    ...(hasHeadings
      ? allowedHeadingLevels.map((level) => ({
          label: `Heading ${level}`,
          value: `h${level}`,
        }))
      : []),
  ];

  const handleChange = (blockType: string) => {
    switch (blockType) {
      case "paragraph":
        convertSelectionToNode(() => $createParagraphNode());
        break;
      case "quote":
        convertSelectionToNode(() => $createQuoteNode());
        break;
      case "":
        break;
      default:
        if (blockType.startsWith("h")) {
          convertSelectionToNode(() => $createHeadingNode(blockType as never));
        }
    }
  };

  return (
    <select
      className="nw-mdx-native-select nw-mdx-block-select"
      aria-label="Select block type"
      value={currentBlockType}
      onPointerDown={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
      onChange={(event) => handleChange(event.target.value)}
    >
      {items.map((item) => (
        <option key={item.value} value={item.value}>
          {item.label}
        </option>
      ))}
    </select>
  );
}

function NodeCodeLanguageSelect({ language }: { language: string }) {
  const { setLanguage } = useCodeBlockEditorContext();
  const codeBlockLanguages = useCellValue(codeBlockLanguages$);
  const value = codeBlockLanguages.keyMap[language] ?? language;

  return (
    <select
      className="nw-mdx-native-select nw-cm-language-select"
      aria-label="Select code block language"
      value={value}
      onPointerDown={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
      onChange={(event) => {
        const next = event.target.value;
        setLanguage(next === MDX_EMPTY_CODE_LANGUAGE_VALUE ? "" : next);
      }}
    >
      {codeBlockLanguages.items.map((item) => (
        <option key={item.value} value={item.value}>
          {item.label}
        </option>
      ))}
    </select>
  );
}

function GlobalInlineMdxToolbar({ active }: { active: boolean }) {
  const [host, setHost] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let el = document.getElementById("nw-mdx-global-toolbar-host");
    if (!el) {
      el = document.createElement("div");
      el.id = "nw-mdx-global-toolbar-host";
      document.body.appendChild(el);
    }
    setHost(el);
  }, []);

  if (!active || !host) return null;

  return createPortal(
    <div
      className="nw-global-mdx-toolbar"
      data-nw-mdx-portal-interaction="true"
      onPointerDownCapture={() => {
        markMdxPortalInteraction();
      }}
      onPointerDown={(e) => {
        e.stopPropagation();
      }}
      onMouseDownCapture={() => {
        markMdxPortalInteraction();
      }}
      onMouseDown={(e) => {
        const isSelectTrigger = isMdxSelectTriggerTarget(e.target);
        e.stopPropagation();
        // Keep editor selection active while clicking toolbar controls.
        if (!isSelectTrigger && !(e.target instanceof HTMLInputElement)) {
          e.preventDefault();
        }
      }}
    >
      <div className="nw-custom-toolbar" data-nw-custom-toolbar>
        <div className="nw-custom-toolbar-group">
          <UndoRedo />
        </div>
        <div className="nw-custom-toolbar-sep" />
        <div className="nw-custom-toolbar-group">
          <BoldItalicUnderlineToggles />
          <StrikeThroughSupSubToggles options={["Strikethrough", "Sub", "Sup"]} />
          <CodeToggle />
        </div>
        <div className="nw-custom-toolbar-sep" />
        <div className="nw-custom-toolbar-group">
          <ListsToggle options={["bullet", "number", "check"]} />
        </div>
        <div className="nw-custom-toolbar-sep" />
        <div className="nw-custom-toolbar-group">
          <NodeBlockTypeSelect />
        </div>
        <div className="nw-custom-toolbar-sep" />
        <div className="nw-custom-toolbar-group">
          <CreateLink />
          <InsertImage />
          <InsertTable />
        </div>
        <div className="nw-custom-toolbar-sep" />
        <div className="nw-custom-toolbar-group">
          <InsertThematicBreak />
          <InsertCodeBlock />
        </div>
      </div>
    </div>,
    host,
  );
}

const CODE_BLOCK_LANGUAGES = {
  txt: "Plain text",
  ts: "TypeScript",
  tsx: "TypeScript JSX",
  js: "JavaScript",
  jsx: "JavaScript JSX",
  json: "JSON",
  md: "Markdown",
  bash: "Bash",
  css: "CSS",
  html: "HTML",
} as const;

const SUPPORTED_CODE_BLOCK_LANGS = new Set<string>(
  Object.keys(CODE_BLOCK_LANGUAGES),
);

function CodeMirrorEditorWithCopy(props: CodeBlockEditorProps) {
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(props.code ?? "");
      setCopied(true);
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
      copyTimerRef.current = window.setTimeout(() => {
        setCopied(false);
        copyTimerRef.current = null;
      }, 1400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="nw-cm-editor-with-copy">
      <CodeMirrorEditor {...props} />
      <NodeCodeLanguageSelect language={props.language ?? ""} />
      <button
        type="button"
        className="nw-cm-copy-btn"
        aria-label="Copy code"
        title="Copy code"
        onPointerDown={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
        onMouseDown={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
        onClick={handleCopy}
      >
        {copied ? <Check size={13} strokeWidth={2} /> : <Copy size={13} strokeWidth={2} />}
      </button>
    </div>
  );
}

const lightCodeMirrorTheme = EditorView.theme(
  {
    "&": {
      backgroundColor: "#ffffff",
      color: "#0f172a",
    },
    ".cm-scroller": {
      fontFamily: "var(--font-mono-code, ui-monospace, monospace)",
      lineHeight: "1.58",
    },
    ".cm-content": {
      caretColor: "#0f172a",
    },
    ".cm-cursor, .cm-dropCursor": {
      borderLeftColor: "#0f172a",
    },
    ".cm-gutters": {
      backgroundColor: "#f8fafc",
      color: "#64748b",
      border: "0",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "#eef2ff",
      color: "#334155",
    },
    ".cm-selectionBackground, ::selection": {
      backgroundColor: "rgba(59, 130, 246, 0.24)",
    },
  },
  { dark: false },
);

const darkCodeMirrorTheme = EditorView.theme(
  {
    "&": {
      backgroundColor: "#0b1020",
      color: "#e5e7eb",
    },
    ".cm-scroller": {
      fontFamily: "var(--font-mono-code, ui-monospace, monospace)",
      lineHeight: "1.58",
    },
    ".cm-content": {
      caretColor: "#e5e7eb",
    },
    ".cm-cursor, .cm-dropCursor": {
      borderLeftColor: "#e5e7eb",
    },
    ".cm-gutters": {
      backgroundColor: "#101725",
      color: "#8b97ad",
      border: "0",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "#172038",
      color: "#cbd5e1",
    },
    ".cm-selectionBackground, ::selection": {
      backgroundColor: "rgba(96, 165, 250, 0.28)",
    },
  },
  { dark: true },
);

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
    ul: ({ children, ...props }) => (
      <ul
        {...props}
        className={`my-0 list-disc pl-4 ${NODE_MD_BODY_TYPO} ${props.className ?? ""}`.trim()}
      >
        {children}
      </ul>
    ),
    ol: ({ children, ...props }) => (
      <ol
        {...props}
        className={`my-0 list-decimal pl-4 ${NODE_MD_BODY_TYPO} ${props.className ?? ""}`.trim()}
      >
        {children}
      </ol>
    ),
    li: ({ children, ...props }) => (
      <li {...props} className={`my-0 ${props.className ?? ""}`.trim()}>
        {children}
      </li>
    ),
    input: ({ checked, type }) => {
      if (type !== "checkbox") return <input type={type} checked={checked} readOnly />;

      return (
        <Checkbox
          checked={checked === true}
          aria-readonly="true"
          tabIndex={-1}
          className="nw-md-task-checkbox pointer-events-none size-5"
          onCheckedChange={() => {}}
        />
      );
    },
    blockquote: ({ children }) => (
      <blockquote
        className={`my-0 border-l-2 pl-2 italic opacity-90 ${NODE_MD_BODY_TYPO}`}
        style={{ borderColor: fgMuted }}
      >
        {children}
      </blockquote>
    ),
    table: ({ children, ...props }) => (
      <div className="nw-md-table-wrap my-2 overflow-x-auto">
        <table
          {...props}
          className={`nw-md-table w-full border-collapse text-[0.85rem] ${props.className ?? ""}`.trim()}
        >
          {children}
        </table>
      </div>
    ),
    thead: ({ children, ...props }) => (
      <thead {...props} className={`nw-md-table-head ${props.className ?? ""}`.trim()}>
        {children}
      </thead>
    ),
    tbody: ({ children, ...props }) => (
      <tbody {...props} className={`nw-md-table-body ${props.className ?? ""}`.trim()}>
        {children}
      </tbody>
    ),
    tr: ({ children, ...props }) => (
      <tr {...props} className={`nw-md-table-row ${props.className ?? ""}`.trim()}>
        {children}
      </tr>
    ),
    th: ({ children, ...props }) => (
      <th
        {...props}
        className={`nw-md-table-th px-3 py-2 text-left font-semibold ${NODE_MD_BODY_TYPO} ${props.className ?? ""}`.trim()}
      >
        {children}
      </th>
    ),
    td: ({ children, ...props }) => (
      <td
        {...props}
        className={`nw-md-table-td px-3 py-2 align-top ${NODE_MD_BODY_TYPO} ${props.className ?? ""}`.trim()}
      >
        {children}
      </td>
    ),
    code: ({ className, children, node }) => (
      <CodeBlock className={className} node={node} variant="embedded">
        {children}
      </CodeBlock>
    ),
    pre: ({ children }) => <>{children}</>,
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
      <hr className="my-1 border-0 border-t" style={{ borderColor: fgMuted }} />
    ),
    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
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

interface NodeMarkdownBlocksEditorProps {
  nodeId: string;
  blocks: NodeMarkdownBlock[];
  onBlocksChange: (blocks: NodeMarkdownBlock[]) => void;
  selectionEditorMode?: "toolbar" | "mdx";
  uploadPasteImage?: (file: File) => Promise<string>;
  isDarkMode?: boolean;
  /** Чи редактор належить поточно виділеній ноді (для показу глобальної панелі). */
  isSelectionOwner?: boolean;
}

export function NodeMarkdownBlocksEditor(props: NodeMarkdownBlocksEditorProps) {
  const {
    nodeId,
    blocks,
    onBlocksChange,
    uploadPasteImage,
    isDarkMode,
    isSelectionOwner = true,
  } = props;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const currentMarkdown = useMemo(
    () => blocks.map((b) => b.text ?? "").join("\n"),
    [blocks],
  );
  const [markdown, setMarkdown] = useState(currentMarkdown);
  const [isToolbarActive, setIsToolbarActive] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    if (typeof document === "undefined") return false;
    const html = document.documentElement;
    const body = document.body;
    return (
      html.classList.contains("dark") ||
      body.classList.contains("dark") ||
      html.dataset.theme === "dark" ||
      body.dataset.theme === "dark"
    );
  });
  const effectiveDarkTheme = isDarkMode ?? isDarkTheme;
  const blocksRef = useRef(blocks);
  blocksRef.current = blocks;

  useEffect(() => {
    setMarkdown(currentMarkdown);
  }, [currentMarkdown, nodeId]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const syncActiveState = () => {
      if (!isSelectionOwner) {
        clearNodeWriterMarkdownSelection(root);
        setIsToolbarActive(false);
        return;
      }
      const editable = root.querySelector<HTMLElement>(".node-mdx-editor-content");
      if (!editable) {
        setIsToolbarActive(false);
        return;
      }
      const selection = window.getSelection();
      const anchorNode = selection?.anchorNode ?? null;
      const inEditorBySelection = !!anchorNode && editable.contains(anchorNode);
      const activeEl = document.activeElement;
      const inEditorByFocus = !!activeEl && editable.contains(activeEl);
      const inToolbarOrPopup =
        document.body.dataset.nwMdxPortalInteraction === "true" ||
        (activeEl instanceof HTMLElement &&
          !!activeEl.closest(MDX_PORTAL_INTERACTION_SELECTOR));
      // Keep toolbar visible while caret is in editor OR while interacting with toolbar/dropdowns.
      const next = inEditorByFocus || inEditorBySelection || inToolbarOrPopup;
      setIsToolbarActive((prev) => (prev === next ? prev : next));
    };

    const scheduleSync = () => {
      requestAnimationFrame(syncActiveState);
    };

    const handleDocumentPointerDown = (event: PointerEvent) => {
      if (isMdxPortalInteractionTarget(event.target)) {
        markMdxPortalInteraction();
      }
      scheduleSync();
    };

    root.addEventListener("focusin", scheduleSync);
    root.addEventListener("focusout", scheduleSync);
    root.addEventListener("keyup", scheduleSync, true);
    root.addEventListener("mouseup", scheduleSync, true);
    document.addEventListener("selectionchange", scheduleSync);
    document.addEventListener("pointerdown", handleDocumentPointerDown, true);

    scheduleSync();

    return () => {
      root.removeEventListener("focusin", scheduleSync);
      root.removeEventListener("focusout", scheduleSync);
      root.removeEventListener("keyup", scheduleSync, true);
      root.removeEventListener("mouseup", scheduleSync, true);
      document.removeEventListener("selectionchange", scheduleSync);
      document.removeEventListener("pointerdown", handleDocumentPointerDown, true);
    };
  }, [isSelectionOwner]);

  useEffect(() => {
    if (isSelectionOwner) return;
    clearNodeWriterMarkdownSelection(rootRef.current);
    setIsToolbarActive(false);
  }, [isSelectionOwner, nodeId]);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const updateTheme = () => {
      const next =
        html.classList.contains("dark") ||
        body.classList.contains("dark") ||
        html.dataset.theme === "dark" ||
        body.dataset.theme === "dark";
      setIsDarkTheme((prev) => (prev === next ? prev : next));
    };

    const observer = new MutationObserver(updateTheme);
    observer.observe(html, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });
    observer.observe(body, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });
    updateTheme();
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const body = document.body;
    const owner = `node-mdx-${nodeId}`;

    body.dataset.nwMdxThemeOwner = owner;
    body.dataset.nwMdxTheme = effectiveDarkTheme ? "dark" : "light";

    return () => {
      if (body.dataset.nwMdxThemeOwner === owner) {
        delete body.dataset.nwMdxThemeOwner;
        delete body.dataset.nwMdxTheme;
      }
    };
  }, [effectiveDarkTheme, nodeId]);

  const plugins = useMemo(
    () => [
      headingsPlugin(),
      listsPlugin(),
      quotePlugin(),
      thematicBreakPlugin(),
      linkPlugin(),
      linkDialogPlugin(),
      tablePlugin(),
      codeBlockPlugin({
        defaultCodeBlockLanguage: "js",
        codeBlockEditorDescriptors: [
          {
            priority: 1,
            match: (language, meta) => {
              if (meta) return false;
              const normalized = (language ?? "").trim().toLowerCase();
              return (
                normalized.length === 0 ||
                SUPPORTED_CODE_BLOCK_LANGS.has(normalized)
              );
            },
            Editor: CodeMirrorEditorWithCopy,
          },
        ],
      }),
      codeMirrorPlugin({
        codeBlockLanguages: CODE_BLOCK_LANGUAGES,
        codeMirrorExtensions: [
          effectiveDarkTheme ? darkCodeMirrorTheme : lightCodeMirrorTheme,
        ],
      }),
      imagePlugin({
        imageUploadHandler: uploadPasteImage,
        imagePlaceholder: null,
      }),
      markdownShortcutPlugin(),
      toolbarPlugin({
        toolbarContents: () => <GlobalInlineMdxToolbar active={isToolbarActive} />,
      }),
    ],
    [uploadPasteImage, isToolbarActive, effectiveDarkTheme],
  );

  return (
    <div
      ref={rootRef}
      data-node-markdown-root={nodeId}
      data-nw-fixed-toolbar={isToolbarActive ? "true" : "false"}
      data-nw-selection-owner={isSelectionOwner ? "true" : "false"}
      data-nw-theme={effectiveDarkTheme ? "dark" : "light"}
      className="relative min-h-0 min-w-0 w-full flex-1 overflow-visible text-foreground/90"
      onPointerDown={(event) => {
        if (isSelectionOwner) {
          event.stopPropagation();
        }
      }}
      onMouseDown={(event) => {
        if (isSelectionOwner) {
          event.stopPropagation();
        }
      }}
    >
      <MDXEditor
        className="node-mdx-editor-basic"
        markdown={markdown}
        plugins={plugins}
        contentEditableClassName="node-mdx-editor-content"
        onChange={(nextMarkdown) => {
          const normalized = normalizeMultiLineListItems(nextMarkdown);
          setMarkdown(normalized);
          onBlocksChange(markdownToBlocks(normalized, blocksRef.current));
        }}
      />
    </div>
  );
}

import { ThemeType } from "@/config/theme-colors.config";
import { cn } from "@/lib/utils";
import { codeFenceLangAccentClasses } from "@/utils/code-fence-lang-accent";
import { useThemeStore } from "@/storage/themeStore";
import {
  extractMarkdownCodeChildrenText,
  highlightMarkdownFenceToHtml,
  normalizeMarkdownCodeLang,
  rawLangFromCodeClassName,
  type ShikiGithubTheme,
} from "@/utils/shiki-markdown-code";
import { useEffect, useState, type ComponentPropsWithoutRef } from "react";
import type { Components } from "react-markdown";
import SoundHoverElement from "../sound-hover-element";
import { HoverStyleElement, SoundTypeElement } from "@/types/sound";
import { Check, Copy } from "lucide-react";

const DEFAULT_FENCE_LANG_LABEL = "js";

export type CodeBlockProps = ComponentPropsWithoutRef<"code"> & {
  node?: unknown;
  /** `embedded` — компактні відступи для прев’ю в картках (node writer). */
  variant?: "default" | "embedded";
};

function MacWindowDots({ isDark }: { isDark: boolean }) {
  if (isDark) {
    return (
      <div className="flex items-center gap-[6px]" aria-hidden>
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
      </div>
    );
  }
  return (
    <div className="flex items-center gap-[6px]" aria-hidden>
      <span className="h-2.5 w-2.5 rounded-full border border-neutral-300/80 bg-neutral-200/90" />
      <span className="h-2.5 w-2.5 rounded-full border border-neutral-300/80 bg-neutral-200/90" />
      <span className="h-2.5 w-2.5 rounded-full border border-neutral-300/80 bg-neutral-200/90" />
    </div>
  );
}

export const CodeBlock = (({
  variant = "default",
  className,
  children,
  node,
  ...props
}: CodeBlockProps) => {
  void node;
  const [html, setHtml] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const selectedTheme = useThemeStore((state) => state.selectedTheme);
  const isDarkChrome = selectedTheme === ThemeType.DARK;
  const isBlock = className?.includes("language-");
  const rawFenceLang = rawLangFromCodeClassName(className);
  const langLabel = rawFenceLang ?? DEFAULT_FENCE_LANG_LABEL;
  const normalizedLang = normalizeMarkdownCodeLang(rawFenceLang);
  const codeText = extractMarkdownCodeChildrenText(children).replace(/\n$/, "");

  useEffect(() => {
    if (!isBlock || !codeText) return;

    const theme: ShikiGithubTheme =
      selectedTheme === ThemeType.DARK ? "github-dark" : "github-light";

    let cancelled = false;
    void highlightMarkdownFenceToHtml(codeText, normalizedLang, theme).then(
      (out) => {
        if (!cancelled) setHtml(out);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [codeText, isBlock, normalizedLang, selectedTheme]);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const isEmbedded = variant === "embedded";

  const shellClass = cn(
    "relative isolate z-0 overflow-hidden",
    isEmbedded ? "font-[family-name:var(--font-mono-code)]" : "font-mono",
    isEmbedded
      ? "my-2 rounded-[10px] text-xs"
      : "mt-7 mb-3 rounded-xl text-sm",
    isDarkChrome
      ? "border border-neutral-800/80 bg-[#0f0f0f] text-neutral-200 shadow-[0_12px_40px_-10px_rgba(0,0,0,0.55)]"
      : "border border-neutral-200/95 bg-neutral-50 text-neutral-900 shadow-[0_12px_40px_-10px_rgba(0,0,0,0.1)]",
  );

  const titleBarClass = cn(
    "relative flex shrink-0 items-center px-3",
    isEmbedded ? "h-8" : "h-9",
    isDarkChrome
      ? "border-b border-white/[0.06] bg-[#141414]"
      : "border-b border-neutral-200/90 bg-[#ececec]",
  );

  const langCenterClass =
    "pointer-events-none absolute inset-x-0 flex justify-center items-center";
  const langBadgeClass = codeFenceLangAccentClasses(
    langLabel.toLowerCase(),
    isDarkChrome,
  );

  const copyBtnClass = cn(
    "z-[40] shrink-0 rounded-md p-1 transition-colors",
    isDarkChrome
      ? "text-neutral-500 hover:bg-white/[0.06] hover:text-neutral-300"
      : "text-neutral-500 hover:bg-black/[0.05] hover:text-neutral-800",
    copied && (isDarkChrome ? "text-emerald-400/90" : "text-emerald-600"),
  );

  const codeAreaClass = cn(
    "min-w-0 [&_pre]:!m-0 [&_pre]:!bg-transparent [&_pre]:!p-0 [&_pre]:!shadow-none [&_code]:!bg-transparent",
    isEmbedded
      ? "font-[family-name:var(--font-mono-code)] word-break break-all [&_code]:whitespace-pre-wrap"
      : "font-mono word-break break-all [&_code]:whitespace-pre-wrap",
    isEmbedded ? "px-3 py-3" : "px-5 py-4",
    isDarkChrome ? "bg-[#0c0c0c]" : "bg-white",
  );

  const copyIconSize = isEmbedded ? 13 : 15;

  if (isBlock) {
    return (
      <div className={shellClass}>
        <div className={titleBarClass}>
          <div className="relative z-[1] w-14 shrink-0">
            <MacWindowDots isDark={isDarkChrome} />
          </div>
          <div className={langCenterClass}>
            <span
              className={cn(
                "rounded-md px-2 py-0.5 font-sans lowercase tracking-wide",
                isEmbedded ? "text-[10px]" : "text-[11px]",
                langBadgeClass,
              )}
            >
              {langLabel}
            </span>
          </div>
          <div className="relative z-[40] ml-auto flex w-14 justify-end">
            <SoundHoverElement
              as="button"
              hoverTypeElement={SoundTypeElement.SELECT_2}
              hoverStyleElement={HoverStyleElement.none}
              onClick={copyToClipboard}
              animValue={1}
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              className={copyBtnClass}
              aria-label="Скопіювати код"
            >
              {copied ? (
                <Check size={copyIconSize} strokeWidth={2} />
              ) : (
                <Copy size={copyIconSize} strokeWidth={2} />
              )}
            </SoundHoverElement>
          </div>
        </div>

        {html ? (
          <div
            className={codeAreaClass}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <div className={codeAreaClass}>
            <pre
              className={cn(
                "min-w-full overflow-x-auto whitespace-pre-wrap",
                isEmbedded
                  ? "font-[family-name:var(--font-mono-code)]"
                  : "font-mono",
              )}
            >
              <code className={className}>{children}</code>
            </pre>
          </div>
        )}
      </div>
    );
  }

  if (isEmbedded) {
    return (
      <code
        className="node-md-inline-code rounded px-1 py-0.5 text-[11px] text-foreground/95 border-0"
        {...props}
      >
        {children}
      </code>
    );
  }

  return (
    <code
      className="bg-muted/40 text-foreground px-2 py-1 rounded-md text-sm font-mono border-0 ring-1 ring-border/40"
      {...props}
    >
      {children}
    </code>
  );
}) satisfies Components["code"];

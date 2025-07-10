import { ThemeType } from "@/config/theme-colors.config";
import { useThemeStore } from "@/storage/themeStore";
import { useEffect, useState } from "react";
import type { Components } from "react-markdown";
import { codeToHtml } from "shiki";
import SoundHoverElement from "../sound-hover-element";
import { HoverStyleElement, SoundTypeElement } from "@/types/sound";
import { Check, Copy } from "lucide-react";

export const CodeBlock: Components["code"] = ({
  className,
  children,
  ...props
}) => {
  const [html, setHtml] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const selectedTheme = useThemeStore((state) => state.selectedTheme);
  const isBlock = className?.includes("language-");
  const lang = className?.replace("language-", "") || "tsx";
  const codeText = typeof children === "string" ? children.trim() : "";

  useEffect(() => {
    if (!isBlock || !codeText) return;

    const load = async () => {
      const html = await codeToHtml(codeText, {
        lang: lang === "terminal" ? "bash" : lang,
        theme:
          selectedTheme === ThemeType.DARK ? "github-dark" : "github-light",
      });
      setHtml(html);
    };

    load();
  }, [codeText, isBlock, lang, selectedTheme]);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (isBlock && html) {
    return (
      <div className="relative mt-7 mb-3 rounded-md text-sm font-mono bg-card text-foreground border border-muted-foreground/20">
        <div className="absolute -top-4 left-0 bg-card/0 backdrop-blur-sm border border-foreground/40 rounded-md px-3 py-0.5 z-50">
          <h6 className="text-primary/90">{lang}:</h6>
        </div>
        {/* Верхня градієнтна лінія */}
        <div
          className={`${
            copied ? "w-full" : "w-0"
          } absolute top-0 left-0 h-1 transition-all bg-gradient-to-r from-highlight via-secondary to-primary duration-300`}
        />

        {/* Кнопка копіювання */}
        <SoundHoverElement
          as="button"
          hoverTypeElement={SoundTypeElement.SELECT_2}
          hoverStyleElement={HoverStyleElement.none}
          onClick={copyToClipboard}
          animValue={1}
          className={`${
            copied ? "bg-accent text-background" : "bg-card text-foreground"
          } absolute top-2 right-2  text-xs p-1 rounded hover:bg-accent hover:text-background transition`}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </SoundHoverElement>

        {/* Код */}
        <div
          className="[&_pre]:!bg-transparent [&_code]:!bg-transparent p-4 font-mono word-break break-all [&_pre]:min-w-full [&_code]:whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    );
  }

  // Inline-код
  return (
    <code
      className="bg-card text-foreground px-2 py-1 rounded shadow-md shadow-muted-foreground/30 text-sm font-mono border border-foreground/30"
      {...props}
    >
      {children}
    </code>
  );
};

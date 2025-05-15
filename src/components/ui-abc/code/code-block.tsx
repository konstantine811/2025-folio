import { ThemeType } from "@/config/theme-colors.config";
import { useThemeStore } from "@/storage/themeStore";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Components } from "react-markdown";
import { codeToHtml } from "shiki";

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
  const [t] = useTranslation();
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
      <div className="relative my-6 rounded-md overflow-hidden text-sm font-mono bg-background-alt text-fg border border-background-alt">
        {/* Верхня градієнтна лінія */}
        <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-accent via-highlight to-success" />

        {/* Кнопка копіювання */}
        <button
          onClick={copyToClipboard}
          className="absolute top-2 right-2 bg-background-alt text-fg text-xs px-2 py-1 rounded hover:bg-fg hover:text-background transition"
        >
          {copied ? t("copied") : t("copy")}
        </button>

        {/* Код */}
        <div
          className="[&_pre]:!bg-transparent [&_code]:!bg-transparent p-4 font-mono"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    );
  }

  // Inline-код
  return (
    <code
      className="bg-background-alt text-fg px-2 py-1 rounded text-sm font-mono"
      {...props}
    >
      {children}
    </code>
  );
};

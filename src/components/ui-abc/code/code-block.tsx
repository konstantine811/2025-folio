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
  const selctedTheme = useThemeStore((state) => state.selectedTheme);
  const isBlock = className?.includes("language-");
  const lang = className?.replace("language-", "") || "tsx";
  const [t] = useTranslation();
  const codeText = typeof children === "string" ? children.trim() : "";
  useEffect(() => {
    if (!isBlock || !codeText) return;

    const load = async () => {
      const html = await codeToHtml(codeText, {
        lang: lang === "terminal" ? "bash" : lang,
        theme: selctedTheme === ThemeType.DARK ? "min-dark" : "min-light",
      });
      setHtml(html);
    };

    load();
  }, [codeText, isBlock, lang, selctedTheme]);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (isBlock && html) {
    return (
      <div className="relative p-4 rounded-lg text-sm bg-background-alt text-accent">
        {/* Кнопка копіювання */}
        <button
          onClick={copyToClipboard}
          className="absolute top-2 right-2 bg-background-alt text-accent text-xs px-2 py-1 rounded hover:bg-accent hover:text-background-alt transition"
        >
          {copied ? t("copied") : t("copy")}
        </button>

        {/* Код */}
        <div
          className="[&_pre]:!bg-transparent [&_code]:!bg-transparent"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    );
  }

  // Inline-код
  return (
    <code
      className="bg-background-alt text-accent px-2 py-1 rounded text-sm"
      {...props}
    >
      {children}
    </code>
  );
};

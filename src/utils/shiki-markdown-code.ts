import type { ReactNode } from "react";
import { codeToHtml } from "shiki";

const LANG_ALIASES: Record<string, string> = {
  npm: "bash",
  yarn: "bash",
  pnpm: "bash",
  npx: "bash",
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  brew: "bash",
  terminal: "bash",
  console: "bash",
  js: "javascript",
  jsx: "jsx",
  mjs: "javascript",
  cjs: "javascript",
  ts: "typescript",
  tsx: "tsx",
  md: "markdown",
  mdwn: "markdown",
  yml: "yaml",
  py: "python",
  python3: "python",
  rb: "ruby",
  rs: "rust",
  htm: "html",
  jsonc: "jsonc",
};

export type ShikiGithubTheme = "github-dark" | "github-light";

/** Maps common markdown fence tags (```npm, ```js) to Shiki language ids. */
export function normalizeMarkdownCodeLang(
  tag: string | undefined,
): string | undefined {
  if (!tag?.trim()) return undefined;
  const t = tag.trim().toLowerCase();
  return LANG_ALIASES[t] ?? t;
}

/** Language id from react-markdown `code` className (`language-foo`). */
export function rawLangFromCodeClassName(
  className?: string,
): string | undefined {
  const m = className?.match(/language-([\w.+-]*)/);
  if (!m) return undefined;
  const raw = m[1];
  return raw?.trim() ? raw : undefined;
}

/**
 * When the fence has no language tag, infer a reasonable Shiki grammar from the snippet.
 * Falls back to `undefined` so callers can default to `javascript`.
 */
export function guessShikiLangFromSnippet(code: string): string | undefined {
  const t = code.trimStart();
  if (!t) return undefined;
  if (/^#!/.test(t)) return "bash";
  if (/^#{1,6}\s/.test(t)) return "markdown";
  if (/^<\?xml/i.test(t)) return "xml";
  if (/^<!DOCTYPE\s+html/i.test(t) || /^<html[\s>]/i.test(t)) return "html";
  const head = t.slice(0, 400);
  if (/^[[{]/.test(t) && /"[^"]+"\s*:/m.test(head)) return "json";
  if (/^import\s+/.test(t) || /^export\s+(default\s+)?/m.test(head))
    return "typescript";
  if (/^(const|let|var)\s+\w+/m.test(head) && /=>/.test(head)) return "typescript";
  return undefined;
}

/** Flatten react-markdown `code` children (often nested elements, not a plain string). */
export function extractMarkdownCodeChildrenText(node: ReactNode): string {
  if (node == null) return "";
  if (typeof node === "string" || typeof node === "number")
    return String(node);
  if (Array.isArray(node)) return node.map(extractMarkdownCodeChildrenText).join("");
  if (typeof node === "object" && node !== null && "props" in node) {
    const p = (node as { props?: { children?: ReactNode } }).props;
    if (p?.children != null)
      return extractMarkdownCodeChildrenText(p.children);
  }
  return "";
}

/**
 * Shared Shiki path for blog `CodeBlock` and node-writer preview.
 * Uses explicit fence lang when present; otherwise guesses from content, else `javascript`.
 */
export async function highlightMarkdownFenceToHtml(
  codeText: string,
  normalizedLang: string | undefined,
  theme: ShikiGithubTheme,
): Promise<string | null> {
  if (!codeText) return null;
  const tryLang = (l: string) => codeToHtml(codeText, { lang: l, theme });
  const primary =
    normalizedLang ??
    guessShikiLangFromSnippet(codeText) ??
    "javascript";
  const candidates = Array.from(
    new Set([primary, "bash", "typescript", "shell"]),
  );
  for (const l of candidates) {
    try {
      return await tryLang(l);
    } catch {
      /* try next bundled grammar */
    }
  }
  return null;
}

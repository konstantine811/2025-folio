/** HTML-обгортки для прев’ю (rehype-raw), стилі в index.css — `.markdown-node-preview` */

export const NODE_MD_HL = {
  border: {
    open: '<span class="md-hl-border">',
    close: "</span>",
  },
  accent: {
    open: '<span class="md-hl-accent">',
    close: "</span>",
  },
  green: {
    open: '<span class="md-hl-green">',
    close: "</span>",
  },
} as const;

export type NodeMdHlKind = keyof typeof NODE_MD_HL;

export const NODE_MD_ALIGN = {
  left: { open: '<span class="md-align md-align-l">', close: "</span>" },
  center: { open: '<span class="md-align md-align-c">', close: "</span>" },
  right: { open: '<span class="md-align md-align-r">', close: "</span>" },
} as const;

export type NodeMdAlignKind = keyof typeof NODE_MD_ALIGN;

export const NODE_MD_FONT = {
  italic: { open: '<span class="md-font md-font-italic">', close: "</span>" },
  mono: { open: '<span class="md-font md-font-mono">', close: "</span>" },
  bold: { open: '<span class="md-font md-font-bold">', close: "</span>" },
  thin: { open: '<span class="md-font md-font-thin">', close: "</span>" },
} as const;

export type NodeMdFontKind = keyof typeof NODE_MD_FONT;

/** Текст всередині HTML-тега */
export function escapeMdHtmlText(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Значення атрибута href */
export function escapeMdHtmlAttr(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

export function normalizeMarkdownLinkHref(input: string): string | null {
  const t = input.trim();
  if (!t) return null;
  const lower = t.toLowerCase();
  if (lower.startsWith("javascript:") || lower.startsWith("data:")) return null;
  if (
    t.startsWith("/") ||
    t.startsWith("./") ||
    t.startsWith("../") ||
    t.startsWith("#")
  ) {
    return t;
  }
  try {
    new URL(t);
    return t;
  } catch {
    if (/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(t)) return null;
    return `https://${t}`;
  }
}

export function buildMarkdownLinkHtml(
  href: string,
  innerText: string,
): string | null {
  const h = normalizeMarkdownLinkHref(href);
  if (!h) return null;
  const safeInner = escapeMdHtmlText(innerText);
  const safeHref = escapeMdHtmlAttr(h);
  return `<a href="${safeHref}" target="_blank" rel="noopener noreferrer">${safeInner}</a>`;
}

/** Парсинг #rgb або #rrggbb → [r,g,b] 0–255. */
export function parseHexRgb(hex: string): [number, number, number] | null {
  const h = hex.trim().replace(/^#/, "");
  if (!/^[0-9a-fA-F]{3}$/.test(h) && !/^[0-9a-fA-F]{6}$/.test(h)) {
    return null;
  }
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Відносна яскравість sRGB (WCAG) — залишено для можливих перевірок поза UI тексту. */
export function relativeLuminance(r: number, g: number, b: number): number {
  const lin = [r, g, b].map((v) => {
    const x = v / 255;
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * lin[0]! + 0.7152 * lin[1]! + 0.0722 * lin[2]!;
}

export interface NodeAccentTextTheme {
  /** Завжди тема додатку — без автоконтрасту до фону ноди. */
  fg: string;
  fgMuted: string;
  fgSubtle: string;
  /** Ледь помітні лінії з відтінком accent. */
  border: string;
  dragBg: string;
  headerRule: string;
  footerRule: string;
}

/**
 * Кольори рамок/розділювачів під accent; текст лишається `foreground` теми додатку
 * (світла/темна), без перемикання чорний/білий відносно яскравості фону ноди.
 */
export function nodeTextThemeFromAccent(hex: string): NodeAccentTextTheme {
  const rgb = parseHexRgb(hex) ?? [100, 116, 139];
  const [r, g, b] = rgb;
  const border = `rgba(${r},${g},${b},0.1)`;
  const dragBg = `rgba(${r},${g},${b},0.05)`;
  const headerRule = `rgba(${r},${g},${b},0.08)`;
  const footerRule = headerRule;
  return {
    fg: "var(--foreground)",
    fgMuted: "var(--muted-foreground)",
    fgSubtle: "var(--muted-foreground)",
    border,
    dragBg,
    headerRule,
    footerRule,
  };
}

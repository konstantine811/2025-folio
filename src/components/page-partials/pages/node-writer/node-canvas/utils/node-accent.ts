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

/** Відносна яскравість sRGB (WCAG). */
export function relativeLuminance(r: number, g: number, b: number): number {
  const lin = [r, g, b].map((v) => {
    const x = v / 255;
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * lin[0]! + 0.7152 * lin[1]! + 0.0722 * lin[2]!;
}

export interface NodeAccentTextTheme {
  fg: string;
  fgMuted: string;
  fgSubtle: string;
  border: string;
  dragBg: string;
  headerRule: string;
  footerRule: string;
}

/** Контрастний текст і допоміжні кольори під фон ноди (#rrggbb). Некоректний hex → нейтральний сірий. */
export function nodeTextThemeFromAccent(hex: string): NodeAccentTextTheme {
  const rgb = parseHexRgb(hex) ?? [100, 116, 139];
  const [r, g, b] = rgb;
  const L = relativeLuminance(r, g, b);
  const dark = "#0f172a";
  const light = "#f8fafc";
  const fg = L > 0.45 ? dark : light;
  const fgMuted = L > 0.45 ? "rgba(15,23,42,0.62)" : "rgba(248,250,252,0.68)";
  const fgSubtle = L > 0.45 ? "rgba(15,23,42,0.4)" : "rgba(248,250,252,0.45)";
  const border = L > 0.45 ? "rgba(15,23,42,0.22)" : "rgba(248,250,252,0.25)";
  const dragBg = L > 0.45 ? "rgba(15,23,42,0.07)" : "rgba(248,250,252,0.1)";
  const headerRule = L > 0.45 ? "rgba(15,23,42,0.14)" : "rgba(248,250,252,0.16)";
  const footerRule = headerRule;
  return { fg, fgMuted, fgSubtle, border, dragBg, headerRule, footerRule };
}

type ActiveListKind = "bullet" | "check" | "ordered";

type ActiveListState = {
  kind: ActiveListKind;
  indent: string;
  bulletMarker?: "-" | "+" | "*";
  checked?: " " | "x" | "X";
  orderedDelimiter?: "." | ")";
  nextOrdered?: number;
};

const CODE_FENCE_RE = /^\s*```/;
const ORDERED_LIST_RE = /^(\s*)(\d+)([.)])\s+(.*)$/;
const CHECK_LIST_RE = /^(\s*)([-+*])\s+\[( |x|X)\]\s+(.*)$/;
const BULLET_LIST_RE = /^(\s*)([-+*])\s+(.*)$/;

function parseListItem(line: string): ActiveListState | null {
  const ordered = line.match(ORDERED_LIST_RE);
  if (ordered) {
    const indent = ordered[1] ?? "";
    const start = Number(ordered[2] ?? "1");
    const delimiter = (ordered[3] as "." | ")") ?? ".";
    return {
      kind: "ordered",
      indent,
      orderedDelimiter: delimiter,
      nextOrdered: Number.isFinite(start) ? start + 1 : 2,
    };
  }

  const check = line.match(CHECK_LIST_RE);
  if (check) {
    return {
      kind: "check",
      indent: check[1] ?? "",
      bulletMarker: (check[2] as "-" | "+" | "*") ?? "-",
      checked: (check[3] as " " | "x" | "X") ?? " ",
    };
  }

  const bullet = line.match(BULLET_LIST_RE);
  if (bullet) {
    return {
      kind: "bullet",
      indent: bullet[1] ?? "",
      bulletMarker: (bullet[2] as "-" | "+" | "*") ?? "-",
    };
  }

  return null;
}

function toListLine(active: ActiveListState, content: string): string {
  if (active.kind === "ordered") {
    const n = active.nextOrdered ?? 1;
    active.nextOrdered = n + 1;
    return `${active.indent}${n}${active.orderedDelimiter ?? "."} ${content}`;
  }
  if (active.kind === "check") {
    return `${active.indent}${active.bulletMarker ?? "-"} [${active.checked ?? " "}] ${content}`;
  }
  return `${active.indent}${active.bulletMarker ?? "-"} ${content}`;
}

function isPromotablePlainLine(line: string, active: ActiveListState): boolean {
  if (!line.trim()) return false;
  if (CODE_FENCE_RE.test(line)) return false;
  if (/^\s*>/.test(line)) return false;
  if (/^\s*#/.test(line)) return false;
  if (/^\s*[-*_]{3,}\s*$/.test(line)) return false;
  if (/^\s*\|/.test(line)) return false;
  if (!line.startsWith(active.indent)) return false;

  const rest = line.slice(active.indent.length);
  if (!rest.trim()) return false;
  // Lexical can emit "lazy continuation" lines inside a single list item:
  // e.g. "  next line" (1-3 leading spaces). Treat them as separate items too.
  // Keep >=4 spaces untouched (likely code block / explicit indent block).
  const leadingSpaces = (rest.match(/^ +/)?.[0].length ?? 0);
  if (leadingSpaces >= 4 || rest.startsWith("\t")) return false;
  if (parseListItem(line)) return false;
  return true;
}

/**
 * MDXEditor після toggle list для багаторядкового plain-text інколи
 * створює один list item з "lazy continuation". Тут розкладаємо такі рядки
 * на окремі пункти списку (bullet / number / check), як у live demo.
 */
export function normalizeMultiLineListItems(markdown: string): string {
  const normalizedInput = markdown
    .replace(/\r\n/g, "\n")
    .replace(/<br\s*\/?>/gi, "\n");

  if (!normalizedInput.includes("\n")) return normalizedInput;

  const lines = normalizedInput.split("\n");
  const out: string[] = [];
  let active: ActiveListState | null = null;
  let inCodeFence = false;

  for (const line of lines) {
    if (CODE_FENCE_RE.test(line)) {
      inCodeFence = !inCodeFence;
      out.push(line);
      active = null;
      continue;
    }

    if (inCodeFence) {
      out.push(line);
      continue;
    }

    const asList = parseListItem(line);
    if (asList) {
      out.push(line);
      active = asList;
      continue;
    }

    if (!line.trim()) {
      out.push(line);
      active = null;
      continue;
    }

    if (active && isPromotablePlainLine(line, active)) {
      const rest = line.slice(active.indent.length);
      const content = rest.replace(/^ {1,3}/, "").trim();
      out.push(toListLine(active, content));
      continue;
    }

    out.push(line);
    active = null;
  }

  return out.join("\n");
}

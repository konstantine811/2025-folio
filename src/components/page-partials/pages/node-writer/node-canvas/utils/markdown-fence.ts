/** Рядок, який відкриває/закриває fenced-блок (``` або ```ts). */
function isFenceDelimiterLine(line: string): boolean {
  return /^```[\w-]*\s*$/.test(line);
}

/** Кількість «перемикачів» ``` до позиції offset (по рядках). */
export function fencedCodeToggleCountBefore(source: string, offset: number): number {
  const before = source.slice(0, offset);
  const lines = before.split("\n");
  let n = 0;
  for (const line of lines) {
    if (isFenceDelimiterLine(line)) n++;
  }
  return n;
}

/** Курсор всередині незакритого fenced code (між ``` … ```). */
export function inFencedCodeAt(source: string, offset: number): boolean {
  return fencedCodeToggleCountBefore(source, offset) % 2 === 1;
}

/** Якщо є ``` — тримаємо весь текст одним логічним блоком (без розбиття по \\n у onChange). */
export function isFenceDrivenBlock(text: string): boolean {
  return text.includes("```");
}

/** Чи потрапляє виділення хоча б однією позицією всередину fenced code. */
export function selectionIntersectsFencedCode(
  source: string,
  start: number,
  end: number,
): boolean {
  let a = start;
  let b = end;
  if (a > b) [a, b] = [b, a];
  for (let i = a; i < b; i++) {
    if (inFencedCodeAt(source, i)) return true;
  }
  return false;
}

const vocab: Record<string, number> = {
  "<pad>": 0,
  додай: 1,
  створи: 2,
  постав: 3,
  куб: 4,
  сфера: 5,
  сферу: 5,
  кулю: 5,
  червоний: 6,
  червону: 6,
  синю: 7,
  синій: 7,
  зелену: 8,
  "зелену,": 8,
  радіус: 9,
  праворуч: 10,
  вгорі: 11,
  на: 12,
  позиції: 13,
  "(": 14,
  ")": 15,
};

export const MAX_TOKENS = Object.keys(vocab).length - 1;

export function tokenizeToIds(text: string): number[] {
  const tokens = text.toLowerCase().replace(/[,]/g, "").split(/\s+/);

  const ids: number[] = tokens.map((w) => vocab[w] ?? 0);

  if (ids.length > MAX_TOKENS) {
    return ids.slice(0, MAX_TOKENS);
  } else {
    const padded = [...ids];
    while (padded.length < MAX_TOKENS) {
      padded.push(0);
    }
    return padded;
  }
}

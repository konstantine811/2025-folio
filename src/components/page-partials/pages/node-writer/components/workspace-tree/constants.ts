/** localStorage: масив id вузлів дерева (`fol:…`), розгорнутих у дашборді node-writer. */
export const DASHBOARD_TREE_OPEN_IDS_STORAGE_KEY =
  "nw-dashboard-tree-open-folder-ids-v1";

export function loadDashboardTreeOpenIdsFromStorage(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(DASHBOARD_TREE_OPEN_IDS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === "string");
  } catch {
    return [];
  }
}

export function saveDashboardTreeOpenIdsToStorage(
  ids: ReadonlyArray<string | number>,
): void {
  try {
    localStorage.setItem(
      DASHBOARD_TREE_OPEN_IDS_STORAGE_KEY,
      JSON.stringify(ids.map(String)),
    );
  } catch {
    /* quota / приватний режим */
  }
}

export const treeRowIconBtn =
  "inline-flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/90 hover:text-foreground";

export const treeRowIconBtnDanger = `${treeRowIconBtn} hover:text-destructive`;

export const TREE_ROW_BASE_PAD = 10;
export const TREE_ROW_INDENT = 16;

/** Затримка одиночного кліку, щоб подвійний клік встиг скасувати відкриття/згортання. */
export const ROW_CLICK_DELAY_MS = 280;

export const PRESET_FOLDER_TITLE_COLORS = [
  "#f87171",
  "#fb923c",
  "#facc15",
  "#a3e635",
  "#4ade80",
  "#2dd4bf",
  "#38bdf8",
  "#818cf8",
  "#c084fc",
  "#f472b6",
  "#e5e5e5",
  "#94a3b8",
] as const;

export const COLOR_INPUT_DEFAULT = "#94a3b8";

export function hexForColorInput(value: string | null | undefined): string {
  if (value && /^#[0-9A-Fa-f]{6}$/.test(value)) return value;
  return COLOR_INPUT_DEFAULT;
}

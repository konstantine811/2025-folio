/** Зображення на полотні (вставка з буфера тощо), логічні координати як у нод. */
export interface CanvasImageItem {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  /**
   * Співвідношення сторін оригіналу (naturalWidth / naturalHeight).
   * Для збереження пропорцій при зміні розміру картки; без поля — width/height.
   */
  aspectRatio?: number;
  /** Зазвичай blob: URL; при видаленні викликати URL.revokeObjectURL. */
  url: string;
  /** Заголовок картки; за замовчуванням порожній. */
  title?: string;
}

/** Рівень заголовка ноди на полотні (h1 — найбільший, h6 — найменший). */
export type NodeHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

/** Папка в архіві документів (вкладені проєкти). */
export interface WorkspaceFolder {
  id: string;
  parentId: string | null;
  title: string;
  /**
   * Порядок серед усіх дочірніх елементів батька (папки + документи).
   * Менше — вище в списку.
   */
  sortOrder: number;
  /** Колір назви папки в дереві (`#rrggbb`); без поля — колір теми. */
  titleColor?: string | null;
}

export interface Project {
  id: string;
  title: string;
  content: string;
  nodes: NodeData[];
  links: LinkData[];
  /** Картинки на канвасі (окремо від нод). */
  canvasImages: CanvasImageItem[];
  slides: Slide[];
  images: Asset[];
  lastModified: number;
  /** Батьківська папка; `null` / відсутнє — корінь робочої області. */
  folderId?: string | null;
  /**
   * Порядок серед дочірніх елементів батька разом із папками (`sortOrder` у папок).
   */
  workspaceOrder?: number;
}

/**
 * Один логічний блок markdown (гібрид: активний — сирий текст, інші — preview).
 * Зазвичай один візуальний рядок; у `text` можуть бути переноси для fenced-коду (``` … ```).
 */
export interface NodeMarkdownBlock {
  id: string;
  text: string;
}

export interface NodeData {
  id: string;
  label: string;
  /** Рівень заголовка (розмір/ієрархія); без поля — як h2 у старих даних. */
  headingLevel?: NodeHeadingLevel;
  description?: string;
  /** Рядки markdown; `description` синхронізується як `join("\\n")`. */
  markdownBlocks?: NodeMarkdownBlock[];
  imageUrl?: string;
  type: "concept" | "resource" | "activity";
  x?: number;
  y?: number;
  /** Явна ширина ноди (px); інакше дефолт канвасу. */
  width?: number;
  /** Явна висота ноди (px). */
  height?: number;
  /** Колір фону картки (#rrggbb); текст підбирається контрастним автоматично. */
  accentColor?: string;
  fx?: number | null;
  fy?: number | null;
}

/** Порт ноди: північ, схід, південь, захід (край для звʼязку). */
export type NodePort = "n" | "e" | "s" | "w";

export interface LinkData {
  source: string;
  target: string;
  sourcePort?: NodePort;
  targetPort?: NodePort;
  /** Кінець звʼязку — елемент `canvasImages`, а не нода. */
  sourceIsCanvasImage?: boolean;
  targetIsCanvasImage?: boolean;
  /**
   * Нумерований слот на боці `sourcePort` (n/e/s/w): порядок дочірніх / груп.
   * Якщо задано, `sourcePort` — край виходу; без слота — точка по центру цього боку (legacy).
   * Лише для джерела-ноди (не для зображення на полотні).
   */
  sourceChildSlot?: number;
}

/** Поява блоку на слайді (CSS animate-in). */
export type SlideEntranceKind =
  | "none"
  | "fade"
  | "slide-up"
  | "slide-left"
  | "zoom";

/** Усі блоки разом або один за одним (затримка по порядку). */
export type SlideBlockAnimationTiming = "together" | "sequential";

/** Вертикальний стовпчик або вільне положення на полотні (у %). */
export type SlideLayoutMode = "stack" | "canvas";

/** Пресет шрифту для заголовка/тексту на слайді. */
export type SlideFontPreset = "theme" | "sans" | "serif" | "mono";

/** Вирівнювання тексту в межах блоку. */
export type SlideTextAlign = "left" | "center" | "right";

export interface SlideBlockHeading {
  id: string;
  kind: "heading";
  order: number;
  text: string;
  sourceNodeId?: string;
  /** Множник до базового заголовка слайда (1 = за замовчуванням). */
  scale?: number;
  entrance?: SlideEntranceKind;
  fontPreset?: SlideFontPreset;
  textAlign?: SlideTextAlign;
  /** У режимі `canvas`: позиція та ширина блоку (0–100). */
  leftPct?: number;
  topPct?: number;
  widthPct?: number;
}

export interface SlideBlockText {
  id: string;
  kind: "text";
  order: number;
  text: string;
  sourceNodeId?: string;
  markdownBlockId?: string;
  /** Відносно візуального розміру заголовка на слайді (~0.35–0.5 типові для підзаголовка). */
  scale?: number;
  entrance?: SlideEntranceKind;
  fontPreset?: SlideFontPreset;
  textAlign?: SlideTextAlign;
  leftPct?: number;
  topPct?: number;
  widthPct?: number;
}

export interface SlideBlockImage {
  id: string;
  kind: "image";
  order: number;
  url: string;
  caption?: string;
  sourceNodeId?: string;
  sourceCanvasImageId?: string;
  entrance?: SlideEntranceKind;
  leftPct?: number;
  topPct?: number;
  /** Ширина картки зображення на слайді (0–100). */
  widthPct?: number;
}

export type SlideBlock = SlideBlockHeading | SlideBlockText | SlideBlockImage;

export interface Slide {
  id: string;
  title: string;
  /** Легасі: до міграції в blocks */
  content?: string;
  visualType?: "text" | "image" | "bullets";
  blocks?: SlideBlock[];
  blockAnimationTiming?: SlideBlockAnimationTiming;
  /** `stack` — колонка; `canvas` — абсолютне позиціонування у відсотках. */
  slideLayout?: SlideLayoutMode;
}

export interface Asset {
  id: string;
  url: string;
  prompt: string;
}

export type AppView =
  | "dashboard"
  /** Усі медіа по всіх документах робочої області. */
  | "workspaceAssets"
  | "editor"
  | "nodes"
  | "presentation"
  | "assets";

export type ProjectPatchFn = (prev: Project) => Project;

export interface User {
  name: string;
  email: string;
  avatar: string;
}

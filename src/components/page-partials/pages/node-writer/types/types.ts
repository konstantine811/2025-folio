/** Зображення на полотні (вставка з буфера тощо), логічні координати як у нод. */
export interface CanvasImageItem {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
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

export interface Slide {
  id: string;
  title: string;
  content: string;
  visualType: "text" | "image" | "bullets";
}

export interface Asset {
  id: string;
  url: string;
  prompt: string;
}

export type AppView =
  | "dashboard"
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

import type { NodeHeadingLevel, NodePort } from "../types/types";

export const CANVAS_MIN_W = 1600;
export const CANVAS_MIN_H = 1200;

/** Мінімальний «запас» під прокрутку/панораму, якщо в’юпорт вищий за базове полотно. */
export const CANVAS_VIEW_SCROLL_SLACK = 320;

/** Крок сітки крапок у логічних одиницях полотна (масштабується з zoom). */
export const CANVAS_DOT_GRID_STEP = 22;

export const DEFAULT_NODE_W = 220;
export const DEFAULT_NODE_H = 180;

/** Якщо в даних немає `headingLevel`, поводимось як h2. */
export const LEGACY_NODE_HEADING_LEVEL: NodeHeadingLevel = 2;

export function resolveNodeHeadingLevel(
  level: NodeHeadingLevel | undefined,
): NodeHeadingLevel {
  if (
    level === 1 ||
    level === 2 ||
    level === 3 ||
    level === 4 ||
    level === 5 ||
    level === 6
  ) {
    return level;
  }
  return LEGACY_NODE_HEADING_LEVEL;
}

/** Класи для поля заголовка ноди за рівнем h1…h6 (h1 суттєво більший за h2). */
export const NODE_HEADING_LABEL_CLASSES: Record<NodeHeadingLevel, string> = {
  1: "text-[40px] leading-[1.05] tracking-tight",
  2: "text-[26px] leading-tight",
  3: "text-[21px] leading-snug",
  4: "text-[18px] leading-snug",
  5: "text-[16px] leading-snug",
  6: "text-[14px] leading-snug",
};
export const MIN_NODE_W = 140;
export const MIN_NODE_H = 88;
/** Мінімальний розмір жесту малювання ноди (у CSS px на екрані, не в логічних координатах полотна). */
export const MIN_DRAW_RECT = 40;

/** Межі розміру зображення з буфера (логічні px полотна). */
export const PASTED_IMAGE_MAX_SIDE = 420;
export const PASTED_IMAGE_MIN_SIDE = 80;

export const CANVAS_ZOOM_MIN = 0.35;
export const CANVAS_ZOOM_MAX = 2.25;

/** Відступ навколо bbox при підгонці вигляду (/). Логічні одиниці полотна. */
export const FIT_VIEW_PADDING_LOGICAL = 80;
/** Мінімальний розмір «вікна» підгонки, якщо всі ноди майже в одній точці. */
export const FIT_VIEW_MIN_BOX_LOGICAL = 200;

/** Текст довідки полотна (підказка біля іконки «Документ»). */
export const NODE_CANVAS_HELP_TEXT =
  "Малюйте прямокутник — нова нода. На кожному боці ноди — нумеровані слоти 1, 2, 3… (окремий порядок зверху, справа, знизу, зліва). Тягніть зі слота — знімає цей звʼязок. Кут — розмір. Ctrl або ⌘ + коліщатко — масштаб. Клавіша / — підігнати масштаб і прокрутку під усі ноди. Затисніть Tab і тягніть тло — рух по полотну (у полі вводу Tab лишається як завжди). Ctrl+V — вставити зображення з буфера на полотно; з ребра зображення або ноди можна вести звʼязок до іншої ноди або зображення.";

/** Підказка внизу картки ноди (іконка «i» у футері). */
export const NODE_MARKDOWN_EDITOR_HELP_TEXT =
  "⋮⋮ рух · кут — розмір · з усіх боків 1, 2… — порядок дітей · Markdown: Enter — наступний блок · у ``` — Enter лишає рядок усередині коду ·\n↑↓ між блоками · виділення тексту — панель стилів над рядком";

export const PORT_LABELS: Record<NodePort, string> = {
  n: "зверху",
  e: "справа",
  s: "знизу",
  w: "зліва",
};

export const PORT_HANDLE_POSITION: Record<NodePort, string> = {
  n: "left-1/2 top-0 -translate-x-1/2 -translate-y-1/2",
  s: "left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2",
  w: "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2",
  e: "right-0 top-1/2 translate-x-1/2 -translate-y-1/2",
};

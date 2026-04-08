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

/**
 * Заголовок ноди: sentence case, геометричний sans (Inter через `font-sans`).
 * Розміри підписові, без «крикливого» масштабу all-caps.
 */
export const NODE_HEADING_LABEL_CLASSES: Record<NodeHeadingLevel, string> = {
  1: "text-[2rem] leading-tight tracking-normal",
  2: "text-[1.375rem] leading-snug tracking-normal",
  3: "text-[1.125rem] leading-snug tracking-normal",
  4: "text-[1rem] leading-snug tracking-normal",
  5: "text-[0.9375rem] leading-snug tracking-normal",
  6: "text-[0.8125rem] leading-snug tracking-normal",
};

/** Markdown у ноді: прев’ю, textarea та read-only блок. */
export const NODE_MD_BODY_TYPO =
  "font-sans text-[14px] leading-relaxed antialiased";
export const MIN_NODE_W = 140;
export const MIN_NODE_H = 88;
/** Мінімальний розмір жесту малювання ноди (у CSS px на екрані, не в логічних координатах полотна). */
export const MIN_DRAW_RECT = 40;
/** Мінімальний розмір рамки Shift-виділення (px контенту скролу), щоб не спрацьовувало випадково. */
export const MIN_MARQUEE_SELECT_RECT = 10;

/** Мінімальна відстань між точками контуру ножа (px контенту скролу). */
export const MIN_LINK_KNIFE_SAMPLE_PX = 4;
/** Мінімум вершин у замкненому полігоні ножа. */
export const MIN_LINK_KNIFE_POLYGON_VERTICES = 3;
/** Мінімальний периметр контуру (px скролу), щоб випадковий клік не різав. */
export const MIN_LINK_KNIFE_PATH_LENGTH_PX = 24;

/** Межі розміру зображення з буфера (логічні px полотна). */
export const PASTED_IMAGE_MAX_SIDE = 420;
export const PASTED_IMAGE_MIN_SIDE = 80;

export const CANVAS_ZOOM_MIN = 0.05;
export const CANVAS_ZOOM_MAX = 200.25;

/** Відступ навколо bbox при підгонці вигляду (/). Логічні одиниці полотна. */
export const FIT_VIEW_PADDING_LOGICAL = 80;
/** Мінімальний розмір «вікна» підгонки, якщо всі ноди майже в одній точці. */
export const FIT_VIEW_MIN_BOX_LOGICAL = 200;

/** Текст довідки полотна (підказка біля іконки «Документ»). */
export const NODE_CANVAS_HELP_TEXT =
  "Малюйте прямокутник — нова нода. Shift+прямокутник по полотну — додати до групи всі ноди, що потрапили в рамку. Затисніть K (на укр. — клавіша «л») і ведіть довільний замкнений контур — ріжуться звʼязки, що перетинають область або її межу; зʼявляться ножиці. Shift+клік по ⋮⋮ — додати/прибрати ноду з групи; тягніть ⋮⋮ — рух однієї ноди або всієї виділеної групи. На кожному боці ноди — слоти 1, 2, 3… Тягніть зі слота — знімає звʼязок. Кут ноди — розмір. Ctrl або ⌘ + коліщатко — масштаб. / — підігнати вигляд. Tab + тягти тло — панорама. Ctrl/⌘+V на полотні — зображення; у тексті ноди — картинка в markdown. З ребра зображення або ноди — звʼязок до іншої ноди або зображення.";

/** Режим лише перегляду полотна (гості). */
export const NODE_CANVAS_HELP_TEXT_VIEW_ONLY =
  "Лише перегляд: ноди та звʼязки не можна змінювати. Ctrl або ⌘ + коліщатко — масштаб. Клавіша / — підігнати вигляд під усі ноди. Затисніть Tab і тягніть тло — рух по полотну.";

/** Підказка внизу картки ноди (іконка «i» у футері). */
export const NODE_MARKDOWN_EDITOR_HELP_TEXT =
  "⋮⋮ рух · кут — розмір · з усіх боків 1, 2… — порядок дітей · Markdown: Enter — наступний блок · у ``` — Enter лишає рядок усередині коду ·\n↑↓ між блоками · виділення тексту — панель стилів над рядком · Ctrl/⌘+V у рядку — вставити зображення з буфера (завантаження в хмару)";

export const PORT_LABELS: Record<NodePort, string> = {
  n: "зверху",
  e: "справа",
  s: "знизу",
  w: "зліва",
};

/**
 * Відступ портів від краю картки (0 — кружечки впритул до ребра).
 * Геометрія звʼязків у `geometry.ts` використовує те саме значення.
 */
export const NODE_PORT_EDGE_INSET = 0;
/** Відстань між центрами сусідніх слотів на одному боці. */
export const NODE_PORT_SLOT_GAP = 14;
/** Візуальний розмір кнопки-порту (px); gap = NODE_PORT_SLOT_GAP − це значення. */
export const NODE_PORT_HANDLE_PX = 12;

export const PORT_HANDLE_POSITION: Record<NodePort, string> = {
  n: "left-1/2 top-0 -translate-x-1/2 flex flex-row",
  s: "left-1/2 bottom-0 -translate-x-1/2 flex flex-row",
  w: "left-0 top-1/2 -translate-y-1/2 flex flex-col",
  e: "right-0 top-1/2 -translate-y-1/2 flex flex-col",
};

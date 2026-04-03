import type { CanvasImageItem, NodeData } from "../../types/types";
import {
  CANVAS_ZOOM_MAX,
  CANVAS_ZOOM_MIN,
  FIT_VIEW_MIN_BOX_LOGICAL,
  FIT_VIEW_PADDING_LOGICAL,
} from "../constants";
import { getCanvasContentBoundsLogical } from "./nodes-bounds";

/** Підганяє scale і scroll так, щоб ноди та зображення на полотні влізли у в’юпорт. */
export function runFitViewToNodes(
  getScrollEl: () => HTMLElement | null,
  nodes: NodeData[],
  layouts: Map<string, { w: number; h: number }>,
  canvasImages: CanvasImageItem[],
  setScale: (next: number) => void,
): void {
  const scrollEl = getScrollEl();
  if (!scrollEl) return;
  const bounds = getCanvasContentBoundsLogical(nodes, layouts, canvasImages);
  if (!bounds) return;

  const pad = FIT_VIEW_PADDING_LOGICAL;
  let bw = bounds.R - bounds.L + 2 * pad;
  let bh = bounds.B - bounds.T + 2 * pad;
  bw = Math.max(bw, FIT_VIEW_MIN_BOX_LOGICAL);
  bh = Math.max(bh, FIT_VIEW_MIN_BOX_LOGICAL);

  const vw = scrollEl.clientWidth;
  const vh = scrollEl.clientHeight;
  if (vw <= 0 || vh <= 0) return;

  const sNew = Math.min(
    CANVAS_ZOOM_MAX,
    Math.max(CANVAS_ZOOM_MIN, Math.min(vw / bw, vh / bh)),
  );

  const cx = (bounds.L + bounds.R) / 2;
  const cy = (bounds.T + bounds.B) / 2;

  setScale(sNew);

  const scrollAfterLayout = () => {
    const root = getScrollEl();
    if (!root?.isConnected) return;
    const vw2 = root.clientWidth;
    const vh2 = root.clientHeight;
    const cxS = cx * sNew;
    const cyS = cy * sNew;
    const maxL = Math.max(0, root.scrollWidth - vw2);
    const maxT = Math.max(0, root.scrollHeight - vh2);
    root.scrollLeft = Math.max(0, Math.min(maxL, cxS - vw2 / 2));
    root.scrollTop = Math.max(0, Math.min(maxT, cyS - vh2 / 2));
  };

  requestAnimationFrame(() => {
    requestAnimationFrame(scrollAfterLayout);
  });
}

import type { CanvasImageItem } from "../../types/types";

/** naturalWidth / naturalHeight; для resize і відображення без спотворень. */
export function resolveCanvasImageAspectRatio(item: CanvasImageItem): number {
  const a = item.aspectRatio;
  if (a != null && Number.isFinite(a) && a > 0) return a;
  if (item.width > 0 && item.height > 0) return item.width / item.height;
  return 1;
}

/**
 * Зміна розміру з нижнього правого кута: єдиний масштаб з геометричного середнього sx/sy,
 * потім підгонка під aspect (w/h).
 */
export function computeCanvasImageResize(
  originW: number,
  originH: number,
  dx: number,
  dy: number,
  aspectWOverH: number,
  minW: number,
  minH: number,
): { w: number; h: number } {
  const ow = Math.max(1, originW);
  const oh = Math.max(1, originH);
  const sx = (originW + dx) / ow;
  const sy = (originH + dy) / oh;
  const s = Math.sqrt(Math.max(0.0001, sx * sy));
  let nw = Math.max(minW, originW * s);
  let nh = Math.round(nw / aspectWOverH);
  if (nh < minH) {
    nh = minH;
    nw = Math.max(minW, Math.round(nh * aspectWOverH));
  }
  return { w: nw, h: nh };
}

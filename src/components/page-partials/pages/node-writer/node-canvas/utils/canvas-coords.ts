/** Координати події в просторі прокручуваного полотна. */
export function clientToCanvas(
  clientX: number,
  clientY: number,
  scrollEl: HTMLElement | null,
): { x: number; y: number } {
  if (!scrollEl) return { x: clientX, y: clientY };
  const r = scrollEl.getBoundingClientRect();
  return {
    x: clientX - r.left + scrollEl.scrollLeft,
    y: clientY - r.top + scrollEl.scrollTop,
  };
}

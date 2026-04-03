/** Пікселі всередині прокручуваного контенту (як для SVG прев’ю на весь спейсер). */
export function clientToScrollContent(
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

/** Координати події в логічному просторі полотна (до scale; з урахуванням scroll). */
export function clientToCanvas(
  clientX: number,
  clientY: number,
  scrollEl: HTMLElement | null,
  scale = 1,
): { x: number; y: number } {
  const { x, y } = clientToScrollContent(clientX, clientY, scrollEl);
  const s = scale > 0 ? scale : 1;
  return { x: x / s, y: y / s };
}

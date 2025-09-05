export function easeOutSine(
  t: number,
  b: number,
  c: number,
  d: number
): number {
  return c * Math.sin((t / d) * (Math.PI / 2)) + b;
}

export function easeOutQuad(
  t: number,
  b: number,
  c: number,
  d: number
): number {
  t /= d;
  return -c * t * (t - 2) + b;
}

export function easeInOutQuad(
  t: number,
  b: number,
  c: number,
  d: number
): number {
  t /= d / 2;
  if (t < 1) return (c / 2) * t * t + b;
  t--;
  return (-c / 2) * (t * (t - 2) - 1) + b;
}

import { Matrix4, Vector2 } from "three";

export function matricesToPointsXZ(
  matrices: Matrix4[][] | Matrix4[]
): Vector2[] {
  const flat = Array.isArray(matrices[0])
    ? (matrices as Matrix4[][]).flat()
    : (matrices as Matrix4[]);
  const pts: Vector2[] = [];
  for (const m of flat) {
    const e = m.elements;
    pts.push(new Vector2(e[12], e[14])); // X, Z
  }
  return pts;
}

export function convexHull(points: Vector2[]): Vector2[] {
  if (points.length <= 3) return points.slice();

  const pts = points
    .slice()
    .sort((a, b) => (a.x === b.x ? a.y - b.y : a.x - b.x));
  const cross = (o: Vector2, a: Vector2, b: Vector2) =>
    (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);

  const lower: Vector2[] = [];
  for (const p of pts) {
    while (
      lower.length >= 2 &&
      cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0
    ) {
      lower.pop();
    }
    lower.push(p);
  }
  const upper: Vector2[] = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (
      upper.length >= 2 &&
      cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0
    ) {
      upper.pop();
    }
    upper.push(p);
  }
  upper.pop();
  lower.pop();
  return lower.concat(upper);
}

export function pointInPolygon(p: Vector2, poly: Vector2[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x,
      yi = poly[i].y;
    const xj = poly[j].x,
      yj = poly[j].y;
    const intersect =
      yi > p.y !== yj > p.y &&
      p.x < ((xj - xi) * (p.y - yi)) / Math.max(1e-12, yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

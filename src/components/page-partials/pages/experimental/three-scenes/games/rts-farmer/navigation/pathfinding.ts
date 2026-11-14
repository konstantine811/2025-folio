export type Point = { x: number; z: number };
export type Obstacle = { x: number; z: number; hx: number; hz: number };
export const TREES = [[-14, -5], [-12, 6], [12, -5], [14, 7], [-52, 10], [52, -4], [2, 8], [-5, -6], [51, 40], [-50, 40], [50, -42], [-50, -42]];
const clearance = 0.65;
const key = (p: Point) => `${p.x},${p.z}`;
export function walkable(p: Point, obstacles: Obstacle[]) {
  return Math.abs(p.x) < 58 && Math.abs(p.z) < 48 && obstacles.every(o => Math.abs(p.x - o.x) > o.hx + clearance || Math.abs(p.z - o.z) > o.hz + clearance);
}
export function sidewalk(p: Point) {
  return (Math.abs(Math.abs(p.z) - 15) < 1.6 && Math.abs(p.x) <= 32) || (Math.abs(Math.abs(p.x) - 31) < 1.6 && Math.abs(p.z) <= 25);
}
export function segmentClear(a: Point, b: Point, obstacles: Obstacle[]) {
  const n = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.z - a.z) * 4));
  for (let i = 0; i <= n; i++) if (!walkable({ x: a.x + (b.x - a.x) * i / n, z: a.z + (b.z - a.z) * i / n }, obstacles)) return false;
  return true;
}
// Weighted A*: pavement is preferred, grass remains available for commands and detours.
export function findPath(start: Point, target: Point, obstacles: Obstacle[]): Point[] {
  if (!walkable(start, obstacles) || !walkable(target, obstacles)) return [];
  const snap = (p: Point) => {
    const candidates: Point[] = [];
    for (let x = Math.round(p.x) - 2; x <= Math.round(p.x) + 2; x++)
      for (let z = Math.round(p.z) - 2; z <= Math.round(p.z) + 2; z++)
        if (segmentClear(p, { x, z }, obstacles)) candidates.push({ x, z });
    return candidates.sort((a, b) => Math.hypot(a.x - p.x, a.z - p.z) - Math.hypot(b.x - p.x, b.z - p.z))[0];
  };
  const source = snap(start), goal = snap(target);
  if (!source || !goal) return [];
  const open = new Map<string, Point>([[key(source), source]]);
  const costs = new Map<string, number>([[key(source), 0]]);
  const parents = new Map<string, Point>();
  const closed = new Set<string>();
  const heuristic = (p: Point) => Math.hypot(p.x - goal.x, p.z - goal.z);
  while (open.size) {
    let current = source, best = Infinity;
    for (const p of open.values()) {
      const score = costs.get(key(p))! + heuristic(p);
      if (score < best) { best = score; current = p; }
    }
    const id = key(current);
    if (id === key(goal)) {
      const path = [target, goal];
      let p = current;
      while (parents.has(key(p))) { p = parents.get(key(p))!; path.push(p); }
      return path.reverse();
    }
    open.delete(id); closed.add(id);
    for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) {
      if (!dx && !dz) continue;
      const next = { x: current.x + dx, z: current.z + dz }, nextId = key(next);
      if (closed.has(nextId) || !segmentClear(current, next, obstacles)) continue;
      const cost = costs.get(id)! + Math.hypot(dx, dz) * (sidewalk(next) ? 1 : 3.5);
      if (cost >= (costs.get(nextId) ?? Infinity)) continue;
      costs.set(nextId, cost); parents.set(nextId, current); open.set(nextId, next);
    }
  }
  return [];
}

export function avoid(direction: Point, position: Point, others: (Point & { radius: number })[], side: number): Point {
  let x = direction.x, z = direction.z;
  for (const other of others) {
    const dx = position.x - other.x, dz = position.z - other.z;
    const distance = Math.hypot(dx, dz), safe = other.radius + 0.5;
    if (distance > safe + 1.7) continue;
    const nx = distance > 0.001 ? dx / distance : side;
    const nz = distance > 0.001 ? dz / distance : 0;
    const pressure = Math.max(0, (safe + 1.7 - distance) / 1.7);
    x += nx * pressure * 1.8; z += nz * pressure * 1.8;
    // Everyone passes on their right; head-on encounters choose complementary lanes.
    if (direction.x * -nx + direction.z * -nz > 0.2) {
      x += direction.z * pressure; z -= direction.x * pressure;
    }
  }
  const length = Math.hypot(x, z);
  return length > 1 ? { x: x / length, z: z / length } : { x, z };
}

import type { Place } from "../economy/simulation";
import { findPath, segmentClear, walkable, type Point } from "./pathfinding";
import { obstacles, servicePoint } from "./world";
export const RESIDENTS = [
  { name: "Ірина", role: "Покупчиня", route: ["shop", "bakery", "garage"], spawn: [-18, 15], wait: 8 },
  { name: "Тарас", role: "Постачальник", route: ["farm", "mill", "bakery", "shop"], spawn: [18, -15], wait: 12 },
  { name: "Оксана", role: "Працівниця", route: ["bakery", "mill"], spawn: [31, 10], wait: 25 },
  { name: "Петро", role: "Покупець", route: ["bakery", "shop", "farm"], spawn: [-31, -5], wait: 7 },
] satisfies { name: string; role: string; route: Place[]; spawn: number[]; wait: number }[];
export type Command = { type: "routine" | "follow" | "stop" | "talk" } | { type: "go"; place: Place };
export type SteeringMemory = { id: number; direction: Point };
export type Agent = Point & {
  passing?: SteeringMemory;
  id: number; command: Command; route: number; phase: "travel" | "queue" | "service" | "leave" | "chat";
  remaining: number; cooldown: number; partner: number | null; bubble: string; status: string;
  path: Point[]; waypoint: number; replan: number; stalled: number; target: Point; velocity: Point;
  visits: number; conversations: number; ticket: number; progressTime: number; progressDistance: number;
};
export function isResidentStationary(a: Pick<Agent, "phase" | "command">) {
  return a.phase === "chat" || a.phase === "service" || a.phase === "queue" || a.command.type === "stop" || a.command.type === "talk";
}
const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.z - b.z);
export class ResidentCrowd {
  agents: Agent[] = RESIDENTS.map((p, id) => ({
    id, x: p.spawn[0], z: p.spawn[1], command: { type: "routine" }, route: id % p.route.length,
    phase: "travel", remaining: 0, cooldown: 15 + id * 7, partner: null, bubble: "", status: "У дорозі",
    path: [], waypoint: 0, replan: 0, stalled: 0, target: { x: p.spawn[0], z: p.spawn[1] }, velocity: { x: 0, z: 0 },
    visits: 0, conversations: 0, ticket: id, progressTime: 0, progressDistance: Infinity,
  }));
  private previousPlayer?: Point;
  private ticket = RESIDENTS.length;
  place(a: Agent): Place { return a.command.type === "go" ? a.command.place : RESIDENTS[a.id].route[a.route]; }
  command(id: number, command: Command) {
    const a = this.agents[id];
    if (!a) return;
    this.endChat(a);
    a.passing = undefined; a.velocity = { x: 0, z: 0 };
    a.command = command; a.phase = "travel"; a.remaining = 0; a.path = []; a.replan = 0; a.stalled = 0; a.ticket = this.ticket++;
  }
  private endChat(a: Agent) {
    const partner = a.partner === null ? undefined : this.agents[a.partner];
    for (const p of partner ? [a, partner] : [a]) {
      p.partner = null; p.bubble = ""; p.cooldown = 35; p.phase = "travel"; p.path = []; p.replan = 0;
    }
  }
  private setTarget(a: Agent, target: Point) {
    if (distance(a.target, target) > 0.35) { a.target = target; a.path = []; a.replan = 0; a.progressTime = 0; a.progressDistance = distance(a, target); }
  }
  step(dt: number, player: Point, vehicle?: Point) {
    const playerVelocity = this.previousPlayer ? { x: (player.x - this.previousPlayer.x) / dt, z: (player.z - this.previousPlayer.z) / dt } : { x: 0, z: 0 };
    const playerSpeed = Math.hypot(playerVelocity.x, playerVelocity.z);
    if (playerSpeed > 12) { playerVelocity.x *= 12 / playerSpeed; playerVelocity.z *= 12 / playerSpeed; }
    this.previousPlayer = { ...player };
    for (const a of this.agents) {
      a.cooldown -= dt; a.replan -= dt;
      if (a.phase === "chat") {
        a.remaining -= dt;
        a.status = a.partner === null ? "Розмовляє з вами" : `Розмовляє: ${RESIDENTS[a.partner].name}`;
        a.bubble = a.remaining > 3 ? (a.partner === null ? "Вітаю! Чим можу допомогти?" : a.id < a.partner ? "Привіт! Як справи на роботі?" : "Добре! Прямую у своїх справах.") : "До зустрічі! Гарного дня!";
        if (a.remaining <= 0 || (a.partner === null && distance(a, player) > 5)) {
          this.endChat(a);
          if (a.command.type === "talk") a.command = { type: "routine" };
        }
        continue;
      }
      if (a.command.type === "talk") {
        if (distance(a, player) < 3.5) { a.phase = "chat"; a.partner = null; a.remaining = 6; a.conversations++; }
        else { a.status = "Підійдіть ближче для розмови"; this.setTarget(a, a); }
        continue;
      }
      if (a.command.type === "stop") { this.setTarget(a, a); a.status = "Очікує команди"; continue; }
      if (a.command.type === "follow") {
        const angle = a.id * Math.PI / 2;
        const target = { x: player.x + Math.cos(angle) * 3, z: player.z + Math.sin(angle) * 3 };
        this.setTarget(a, walkable(target, obstacles) ? target : a);
        a.status = "Слідує за вами"; continue;
      }
      if (a.phase === "leave") {
        a.status = "Звільняє прохід";
        if (distance(a, a.target) < 0.5) {
          a.route = (a.route + 1) % RESIDENTS[a.id].route.length; a.phase = "travel"; a.ticket = this.ticket++; a.path = []; a.replan = 0;
        }
        continue;
      }
      const place = this.place(a);
      const queue = this.agents.filter(b => (b.command.type === "routine" || b.command.type === "go") && b.phase !== "leave" && b.phase !== "chat" && this.place(b) === place).sort((x, y) => x.ticket - y.ticket);
      const slot = queue.indexOf(a);
      this.setTarget(a, servicePoint(place, slot));
      const arrived = distance(a, a.target) < 0.45;
      if (arrived && slot === 0) {
        if (a.phase !== "service") { a.phase = "service"; a.remaining = RESIDENTS[a.id].wait; }
        a.remaining -= dt;
        a.status = `${a.command.type === "go" ? "На місці" : a.id === 1 ? "Передає товар" : a.id === 2 ? "Працює" : "Купує"} · ${Math.max(0, Math.ceil(a.remaining))} с`;
        if (a.remaining <= 0) {
          a.visits++; a.phase = "leave";
          // Leave sideways before the next visitor takes the service position.
          this.setTarget(a, { x: a.target.x + Math.sign(a.target.x || 1) * 6, z: a.target.z + (a.target.z < 0 ? 2 : -2) });
          if (a.command.type === "go") a.command = { type: "routine" };
        }
      } else { a.phase = arrived ? "queue" : "travel"; a.status = arrived ? `У черзі · ${slot + 1}` : "У дорозі"; }
    }
    // Conversations happen away from entrances, at most one partner, and always expire.
    for (const a of this.agents) for (const b of this.agents) {
      if (a.id >= b.id || a.cooldown > 0 || b.cooldown > 0 || a.command.type !== "routine" || b.command.type !== "routine" || a.phase !== "travel" || b.phase !== "travel") continue;
      if (distance(a, b) < 2.8 && distance(a, b) > 1.5 && distance(a, servicePoint(this.place(a))) > 9 && distance(b, servicePoint(this.place(b))) > 9 && segmentClear(a, b, obstacles)) {
        for (const [p, partner] of [[a, b], [b, a]]) { p.phase = "chat"; p.partner = partner.id; p.remaining = 6; p.conversations++; p.velocity = { x: 0, z: 0 }; }
      }
    }
    const snapshot = this.agents.map(a => ({ x: a.x, z: a.z, radius: 0.72, id: a.id, velocity: a.velocity }));
    for (const a of this.agents) {
      const stationary = isResidentStationary(a);
      a.progressTime += dt;
      if (!stationary && a.progressTime > 2) {
        const remaining = distance(a, a.target);
        if (a.progressDistance - remaining < 0.5) a.stalled = 2;
        a.progressDistance = remaining; a.progressTime = 0;
      }
      if (!stationary && a.replan <= 0 && (!a.path.length || a.stalled > 1.3)) {
        const blockers = snapshot.filter(b => b.id !== a.id && (isResidentStationary(this.agents[b.id]) || a.stalled > 1.3) && distance(a, b) > 1.3 && distance(b, a.target) > 1.8).map(b => ({ x: b.x, z: b.z, hx: 0.6, hz: 0.6 }));
        a.path = findPath(a, a.target, [...obstacles, ...blockers]);
        if (!a.path.length && blockers.length) a.path = findPath(a, a.target, obstacles);
        a.waypoint = a.path.length > 1 && segmentClear(a, a.path[1], obstacles) ? 1 : 0; a.replan = 1;
      }
      // Skip grid points only where the entire segment is visible (no corner cutting).
      while (a.waypoint < a.path.length) {
        const point = a.path[a.waypoint], following = a.path[a.waypoint + 1];
        const passed = following && (a.x - point.x) * (following.x - point.x) + (a.z - point.z) * (following.z - point.z) > 0;
        if (distance(a, point) < 0.35 || (passed && distance(a, point) < 2.5 && segmentClear(a, following, obstacles))) a.waypoint++;
        else break;
      }
      // Look ahead along visible segments instead of steering back to a grid node.
      const limit = Math.min(a.path.length, a.waypoint + 6);
      for (let i = a.waypoint + 1; i < limit; i++) {
        if (distance(a, a.path[i]) < 2.5 && segmentClear(a, a.path[i], obstacles)) a.waypoint = i;
      }
      const next = stationary ? undefined : a.path[a.waypoint];
      const neighbors = [...snapshot.filter(b => b.id !== a.id), { ...player, radius: 0.85, id: -1, velocity: playerVelocity }, ...(vehicle ? [{ ...vehicle, radius: 2.7, id: -2 }] : [])];
      if (next && Math.hypot(a.velocity.x, a.velocity.z) < 0.3) a.stalled += dt; else a.stalled = Math.max(0, a.stalled - dt);
      a.velocity = chooseVelocity(a, next, neighbors, dt);
      if (!stationary && !a.path.length) a.status = "Шукає вільний прохід";
    }
  }
}
// Sample feasible velocities instead of adding forces that cancel out at a doorway.
export function chooseVelocity(a: Point & { id: number; stalled: number; velocity?: Point; passing?: SteeringMemory }, next: Point | undefined, others: (Point & { radius: number; id: number; velocity?: Point })[], dt: number): Point {
  if (!next) { a.passing = undefined; return { x: 0, z: 0 }; }
  let heading = Math.atan2(next.z - a.z, next.x - a.x);
  const nearby = others.filter(b => distance(a, b) < b.radius + 4);
  const forward = { x: Math.cos(heading), z: Math.sin(heading) };
  const passing = a.passing && nearby.find(b => b.id === a.passing!.id);
  if (passing && (distance(a, passing) > passing.radius + 2.5 || ((passing.x - a.x) * a.passing!.direction.x + (passing.z - a.z) * a.passing!.direction.z < -0.5 && distance(a, passing) > passing.radius + 1))) a.passing = undefined;
  if (!passing) a.passing = undefined;
  if (!a.passing) {
    const threat = nearby.filter(b => (b.x - a.x) * forward.x + (b.z - a.z) * forward.z > 0 && distance(a, b) < b.radius + (b.id === -1 ? 4 : 2.5) && Math.abs((b.x - a.x) * forward.z - (b.z - a.z) * forward.x) < b.radius + 1.3).sort((b, c) => distance(a, b) - distance(a, c))[0];
    if (threat) a.passing = { id: threat.id, direction: forward };
  }
  const threat = a.passing && nearby.find(b => b.id === a.passing!.id);
  if (threat?.id === -1 && a.passing) {
    const dir = a.passing.direction, right = { x: dir.z, z: -dir.x };
    const lateral = (a.x - threat.x) * right.x + (a.z - threat.z) * right.z;
    const clearance = threat.radius + 1.1;
    const sideways = Math.max(0, Math.min(1.5, (clearance - lateral) * 1.5));
    // Keep progressing along the original corridor while opening a passing lane.
    const guide = { x: dir.x * 0.8 + right.x * sideways, z: dir.z * 0.8 + right.z * sideways };
    heading = Math.atan2(guide.z, guide.x);
    forward.x = Math.cos(heading); forward.z = Math.sin(heading);
  }
  let best = -Infinity, result = { x: 0, z: 0 };
  for (let i = 0; i < 24; i++) {
    const angle = heading + i * Math.PI / 12;
    const speed = a.passing?.id === -1 ? 2.3 : Math.min(2.3, distance(a, next) * 3);
    const desired = { x: Math.cos(angle) * speed, z: Math.sin(angle) * speed };
    const previous = a.velocity ?? { x: 0, z: 0 };
    const change = Math.hypot(desired.x - previous.x, desired.z - previous.z);
    const blend = nearby.some(b => b.id === -1) ? Math.min(1, 8 * dt / Math.max(change, 0.0001)) : 1;
    const v = { x: previous.x + (desired.x - previous.x) * blend, z: previous.z + (desired.z - previous.z) * blend };
    const p = { x: a.x + v.x * dt, z: a.z + v.z * dt };
    if (!segmentClear(a, p, obstacles)) continue;
    if (!nearby.length && i === 0) return v;
    let score = (v.x * forward.x + v.z * forward.z) / 2.3 * 2;
    let valid = true;
    for (const b of nearby) {
      const before = distance(a, b), after = distance(p, b), safe = b.radius + 0.72;
      if (after < safe && after < before - 0.00001) { valid = false; break; }
      score += Math.min(0, after - before) * 10;
      if (before < safe + 0.3) score += (after - before) * (b.id === -1 ? 10 : 100);
      const rx = b.x - a.x, rz = b.z - a.z;
      const vx = v.x - (b.velocity?.x ?? 0), vz = v.z - (b.velocity?.z ?? 0);
      const time = Math.max(0, Math.min(0.8, (rx * vx + rz * vz) / Math.max(0.001, vx * vx + vz * vz)));
      const closest = Math.hypot(rx - vx * time, rz - vz * time);
      if (b.id === -1) score -= Math.max(0, safe + 0.25 - closest) * 5;
      else {
        const ahead = { x: a.x + v.x * 0.6, z: a.z + v.z * 0.6 };
        score -= Math.max(0, safe + 0.15 - distance(ahead, b)) * 3;
      }
    }
    if (a.passing) {
      const turn = a.passing.direction.x * v.z - a.passing.direction.z * v.x;
      score += turn < -0.05 ? 0.45 : turn > 0.05 ? -0.9 : 0;
    }
    const previousSpeed = a.velocity ? Math.hypot(a.velocity.x, a.velocity.z) : 0;
    if (a.velocity && previousSpeed > 0.3) score += 0.45 * (v.x * a.velocity.x + v.z * a.velocity.z) / (Math.max(0.01, Math.hypot(v.x, v.z)) * previousSpeed);
    // Fixed right-hand preference resolves symmetric head-on encounters.
    if (a.passing) score += Math.sin(angle - heading) * -0.15;
    if (valid && score > best) { best = score; result = v; }
  }
  return best > -Infinity ? result : { x: 0, z: 0 };
}

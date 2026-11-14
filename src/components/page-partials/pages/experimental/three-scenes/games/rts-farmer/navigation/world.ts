import { RESIDENT_GROUND_CENTER } from "../ground";
import { PLACES, type Place } from "../economy/simulation";
import { TREES, type Point } from "./pathfinding";
export const obstacles = [
  ...Object.values(PLACES).map(p => ({ x: p.building[0], z: p.building[1], hx: 6, hz: 4.6 })),
  ...TREES.map(([x, z]) => ({ x, z, hx: 2.1, hz: 2.1 })),
  ...Object.entries(PLACES).map(([place, p]) => ({ x: p.point[0] + (place === "garage" ? 5 : p.point[0] < 0 ? -4.5 : 4.5), z: p.point[1], hx: 0.4, hz: 0.4 })),
  { x: 0, z: 0, hx: 2, hz: 2 },
];
// Service point is outside the door collider; the queue runs away from the facade.
export function servicePoint(place: Place, slot = 0): Point {
  const [x, z] = PLACES[place].building;
  return { x: x + (slot % 2 ? -2 : 2), z: z + Math.sign(-z) * (7.5 + Math.floor(slot / 2) * 2.4) };
}

// This district has a flat ground at y=0. Keep the capsule above it even if a
// grazing Rapier shape cast loses floor contact for a frame.
export function residentTranslation(position: Point & { y: number }, movement: Point & { y: number }) {
  return { x: position.x + movement.x, y: Math.max(RESIDENT_GROUND_CENTER, position.y + movement.y), z: position.z + movement.z };
}

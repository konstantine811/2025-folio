export const DISTRICT_GROUND_Y = 0;
export const PLAYER_SPAWN_Y = 1.3;
export const RESIDENT_HALF_HEIGHT = 0.7;
export const RESIDENT_RADIUS = 0.55;
export const RESIDENT_GROUND_CENTER = DISTRICT_GROUND_Y + RESIDENT_HALF_HEIGHT + RESIDENT_RADIUS + 0.03;

/** Preserve progress and horizontal position when recovering an underground save. */
export function safePlayerSpawn(position: readonly number[]): [number, number, number] {
  return [
    Number.isFinite(position[0]) ? Math.max(-57, Math.min(57, position[0])) : -4,
    Number.isFinite(position[1]) ? Math.max(PLAYER_SPAWN_Y, Math.min(20, position[1])) : PLAYER_SPAWN_Y,
    Number.isFinite(position[2]) ? Math.max(-47, Math.min(47, position[2])) : -20,
  ];
}

/**
 * Temporary debug: flat grid arena (no grass — rebuild in `grass/`).
 * Set `enabled` to false to restore landscape / terrain pipeline.
 */
export const FLAT_GRID_DEBUG_ARENA = {
  enabled: true,
  /** Visual + physics floor extent (meters, full width). */
  arenaSize: 220,
  tileSize: 8,
  /** Small crosses per column edge (inside each tile). */
  crossesPerTile: 12,
  /** X line thickness in meters. */
  crossStrokeMeters: 0.014,
  /** X size from center in meters. */
  crossReachMeters: 0.2,
  /** Grid overlay radius in tiles around focus (landscape mode). */
  gridRadiusTiles: 4,
  flatGroundY: 0,
} as const;

export function isFlatGridDebugArena() {
  return FLAT_GRID_DEBUG_ARENA.enabled;
}

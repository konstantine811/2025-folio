/** Wheel-track flags (grass imprint removed — debug ribbons only for now). */
export const TRACK_SIMPLE_MODE = {
  /**
   * Master switch — false disables wheel history and debug ribbons.
   */
  enabled: true,
  /** Reserved for next grass rebuild. */
  grassImprintFromGroundData: false,
  groundDataTrailRender: false,
  /** Colored debug ribbons when "Wheel track debug" is on in GUI. */
  debugRibbonTrails: true,
  /** Only Rapier wheelContactPoint when in contact — no raycast / smoothing. */
  rawWheelContactsOnly: true,
  /** Debug ribbon opacity = contact alpha only (no UV tail fade). */
  debugOpacityMinimal: true,
} as const;

export function areWheelTracksEnabled() {
  return TRACK_SIMPLE_MODE.enabled;
}

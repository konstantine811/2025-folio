export const CABLE_NEON_ORB_COUNT = 8;

export const cableNeonOrbDefaults = {
  enabled: true,
  orbsPerCable: 3,
  speed: 0.03,
  radius: 0.02,
  color: "#3c39db",
  emissiveIntensity: 12,
  spawnFade: 0.08,
  absorbFade: 0.04,
} as const;

export const cableNeonOrbMaxPerCable = 6;

export const cableNeonOrbInstanceCount =
  CABLE_NEON_ORB_COUNT * cableNeonOrbMaxPerCable;

/** Slight size variation so orbs are not identical. */
export const cableNeonOrbSizeFactors = [0.85, 1, 1.15, 0.9, 1.05, 1.2] as const;

export function getCableNeonOrbSizeFactor(orbIndex: number) {
  return cableNeonOrbSizeFactors[orbIndex % cableNeonOrbSizeFactors.length];
}

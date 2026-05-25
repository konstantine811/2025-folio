export const CABLE_NEON_ORB_COUNT = 8;

export const cableNeonOrbDefaults = {
  enabled: true,
  orbsPerCable: 3,
  speed: 0.03,
  radius: 0.02,
  color: "#3c39db",
  emissiveIntensity: 12,
  spawnFade: 0.08,
  absorbFade: 0.18,
} as const;

export const cableNeonOrbMaxPerCable = 6;

export const cableNeonOrbInstanceCount =
  CABLE_NEON_ORB_COUNT * cableNeonOrbMaxPerCable;

export const CABLE_NEON_ORB_COUNT = 8;

export const cableNeonOrbDefaults = {
  enabled: true,
  orbsPerCable: 3,
  speed: 0.14,
  radius: 0.024,
  color: "#00e8ff",
  emissiveIntensity: 4,
  spawnFade: 0.07,
  absorbFade: 0.08,
} as const;

export const cableNeonOrbMaxPerCable = 6;

export const cableNeonOrbInstanceCount =
  CABLE_NEON_ORB_COUNT * cableNeonOrbMaxPerCable;

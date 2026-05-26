export const earthConfig = {
  position: [-60, -70, -200] as [number, number, number],
  radius: 100,
  /** Cloud shell sits slightly above the surface (Three.js Journey style). */
  cloudLayerScale: 1.001,
  shader: {
    atmosphereDayColor: "#3e547c",
    atmosphereTwilightColor: "#4a6f4c",
    bakedTint: "#f7f7f7",
    sunPhi: 1.68,
    sunTheta: 1.93,
    /** Earth angular speed (rad/s). */
    rotationSpeed: 0.005,
    /**
     * Cloud speed relative to Earth, opposite spin direction.
     * 0.78 → clouds rotate at 78% of Earth speed, backwards.
     */
    cloudSpeed: 0.3,
    /** Base 3D noise evolution multiplier. */
    cloudEvolution: 10.95,
    /**
     * Sin phase speed (rad/s). Full breathe cycle ≈ 2π / speed seconds.
     * e.g. 0.8 → ~8s, 4.15 → ~1.5s. Never saturates — oscillates min↔max spread.
     */
    cloudEvolutionSpeed: 0.8,
    /**
     * Spread amplitude at sin peak (drift + edge erosion).
     * ~4 is clearly visible; lower for subtle haze breathing.
     */
    cloudSpreadStrength: 0.5,
    /**
     * Desync spread phase per region (0 = all clouds pulse together, 1 = full random offset).
     */
    cloudSpreadSpatialVariance: 50,
    /** Fake volumetric shell thickness (world units). */
    cloudVolumeDepth: 10.6,
    cloudShadowStrength: 0.43,
    cloudDisplacement: 0.25,
    cloudNormalStrength: 1,
    cloudSharpness: 0.1,
  },
} as const;

export const earthShaderDefaults = {
  ...earthConfig.shader,
  cloudDriftRatio: earthConfig.shader.cloudSpeed,
};

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
    cloudSpeed: 0.05,
    cloudShadowStrength: 0.13,
    /** Multiplier for cloud layer alpha (0–1). */
    cloudOpacity: 0.33,
    cloudDisplacement: 0.25,
    cloudNormalStrength: 1,
    cloudSharpness: 0.1,
  },
} as const;

export const earthShaderDefaults = {
  ...earthConfig.shader,
  cloudDriftRatio: earthConfig.shader.cloudSpeed,
};

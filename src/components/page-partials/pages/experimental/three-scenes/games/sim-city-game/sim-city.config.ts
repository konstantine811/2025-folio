export const simCityMapAssets = {
  terrain: "/maps/sim-city/terrain.png",
  resources: "/maps/sim-city/resources.png",
} as const;

export const simCityMapEditorConfig = {
  size: 256,
  maxBrushSize: 8,
} as const;

export const simCityRenderConfig = {
  /** Blur terrain color edges (tile → smooth texture). */
  terrainBlurRadius: 2,
  /** Blur water mask for smooth river banks. */
  waterMaskBlurRadius: 3,
  /** Blur river bank transition (non-water tiles only). */
  riverCarveBlurRadius: 8,
  /** River bed elevation — negative = visible groove below flat ground. */
  riverBedHeight: -1.2,
  /** Widen flat river corridor beyond painted water tiles. */
  riverPlainDilateRadius: 2,
  /** Mountain tile clusters blur — higher = wider foothills. */
  mountainDensityBlurRadius: 12,
  /** Max terrain lift where mountain density is highest. */
  mountainMaxHeight: 12,
  /** Lower = taller foothills, higher = sharper peaks. */
  mountainPeakPower: 0.92,
  /** Terrain mesh subdivision for smooth hills. */
  terrainSegments: 128,
  /** Lift water mesh slightly above terrain to avoid z-fighting. */
  waterSurfaceOffset: 0.15,
  /** Base Y for displaced terrain and water meshes. */
  terrainGroundY: 0.08,
} as const;

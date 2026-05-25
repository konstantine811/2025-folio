import { struct } from "three/tsl";
import type { IndirectStorageBufferAttribute } from "three/webgpu";

/** Grass patch covers this square (meters), centered on snapped origin. */
export const GRASS_AREA_SIZE = 128;
export const BLADES_PER_AXIS = 192;
/** Sub-blades spawned inside each coarse grid cell (20 at density slider = 1). */
export const BLADES_PER_CELL = 20;
export const GRASS_BLADE_COUNT =
  BLADES_PER_AXIS * BLADES_PER_AXIS * BLADES_PER_CELL;
/** Blade-grid steps per streaming snap cell (False Earth uses 1; 8 ≈ 5.3 m steps). */
export const BLADE_STEPS_PER_CELL = 8;
export const BLADE_SPACING = GRASS_AREA_SIZE / BLADES_PER_AXIS;
export const GRASS_GRID_CELL_SIZE = BLADE_SPACING * BLADE_STEPS_PER_CELL;

export const grassStructure = struct({
  data0: "vec4",
  data1: "vec4",
  data2: "vec4",
  data3: "vec4",
});

export const drawIndirectStructure = struct({
  vertexCount: "uint",
  instanceCount: { type: "uint", atomic: true },
  firstVertex: "uint",
  firstInstance: "uint",
  offset: "uint",
});

export type LODSegmentsConfig = {
  segments: number;
  minDistance: number;
  maxDistance: number;
  debugColor?: [number, number, number];
};

/** False Earth-style LOD tiers: each ring uses [minDistance, maxDistance). */
export const DEFAULT_LOD_CONFIG: LODSegmentsConfig[] = [
  { segments: 8, minDistance: 0, maxDistance: 6, debugColor: [1, 0.2, 0.2] },
  { segments: 4, minDistance: 6, maxDistance: 20, debugColor: [0.2, 1, 0.2] },
  {
    segments: 2,
    minDistance: 20,
    maxDistance: Infinity,
    debugColor: [0.2, 0.4, 1],
  },
];

export type LODBufferConfig = LODSegmentsConfig & {
  indices: ReturnType<typeof import("three/tsl").instancedArray>;
  drawBuffer: IndirectStorageBufferAttribute;
  drawStorage: ReturnType<typeof import("three/tsl").storage>;
  vertexCount: number;
};

export type GrassUniforms = {
  compute: Record<string, ReturnType<typeof import("three/tsl").uniform>>;
  material: Record<string, ReturnType<typeof import("three/tsl").uniform>>;
};

export type GrassRuntimeConfig = {
  bladeHeightMin?: number;
  bladeHeightMax?: number;
  bladeWidthMin?: number;
  bladeWidthMax?: number;
  bendMin?: number;
  bendMax?: number;
  clumpSize?: number;
  clumpBlend?: number;
  density?: number;
  straightness?: number;
  heightVariation?: number;
  bladeRandomnessX?: number;
  bladeRandomnessY?: number;
  bladeRandomnessZ?: number;
  pushRadius?: number;
  pushAmount?: number;
  flattenAmount?: number;
  windSwayStrength?: number;
  windDirX?: number;
  windDirZ?: number;
  windScale?: number;
  windSpeed?: number;
  windStrength?: number;
  windFacing?: number;
  windDistanceStart?: number;
  windDistanceEnd?: number;
  terrainAmp?: number;
  terrainFreq?: number;
  terrainSeed?: number;
  colorNoiseScale?: number;
  colorNoiseSeed?: number;
  debugLod?: boolean;
};

export const DEFAULT_GRASS_RUNTIME: Required<GrassRuntimeConfig> = {
  bladeHeightMin: 0.28,
  bladeHeightMax: 0.62,
  bladeWidthMin: 0.045,
  bladeWidthMax: 0.11,
  bendMin: 0.15,
  bendMax: 0.55,
  clumpSize: 0.8,
  clumpBlend: 0.2,
  density: 1,
  straightness: 0.55,
  heightVariation: 0.85,
  bladeRandomnessX: 0.3,
  bladeRandomnessY: 0.3,
  bladeRandomnessZ: 0.2,
  pushRadius: 1.4,
  pushAmount: 0.32,
  flattenAmount: 0.5,
  windSwayStrength: 0.85,
  windDirX: 0.85,
  windDirZ: 0.35,
  windScale: 0.25,
  windSpeed: 0.6,
  windStrength: 2.8,
  windFacing: 0.6,
  windDistanceStart: 10,
  windDistanceEnd: 30,
  terrainAmp: 0.12,
  terrainFreq: 0.06,
  terrainSeed: 42,
  colorNoiseScale: 0.5,
  colorNoiseSeed: 107,
  debugLod: false,
};

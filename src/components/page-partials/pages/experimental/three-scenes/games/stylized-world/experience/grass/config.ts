import { struct } from "three/tsl";
import * as THREE from "three";

/** Grass patch covers this square (meters), centered on snapped origin. */
export const GRASS_AREA_SIZE = 64;
export const BLADES_PER_AXIS = 128;
export const BLADE_STEPS_PER_CELL = 16;
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
};

export const DEFAULT_LOD_CONFIG: LODSegmentsConfig[] = [
  { segments: 5, minDistance: 0, maxDistance: 18 },
  { segments: 2, minDistance: 18, maxDistance: Infinity },
];

export type LODBufferConfig = LODSegmentsConfig & {
  indices: ReturnType<typeof import("three/tsl").instancedArray>;
  drawBuffer: THREE.IndirectStorageBufferAttribute;
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
  pushRadius?: number;
  pushAmount?: number;
  flattenAmount?: number;
  windSwayStrength?: number;
  windDirX?: number;
  windDirZ?: number;
};

export const DEFAULT_GRASS_RUNTIME: Required<GrassRuntimeConfig> = {
  bladeHeightMin: 0.28,
  bladeHeightMax: 0.62,
  bladeWidthMin: 0.045,
  bladeWidthMax: 0.11,
  bendMin: 0.15,
  bendMax: 0.55,
  pushRadius: 1.4,
  pushAmount: 0.32,
  flattenAmount: 0.5,
  windSwayStrength: 0.1,
  windDirX: 0.85,
  windDirZ: 0.35,
};

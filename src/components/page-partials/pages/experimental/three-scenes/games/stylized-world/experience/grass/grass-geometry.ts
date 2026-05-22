import * as THREE from "three/webgpu";
import { instancedArray } from "three/tsl";
import { grassStructure } from "./config";

export function createBladeGeometry(segments = 5) {
  const bladeGeometry = new THREE.PlaneGeometry(1, 1, 1, segments);
  bladeGeometry.translate(0, 0.5, 0);
  return bladeGeometry;
}

export function createGrassData(grassBlades: number) {
  const grassStructSize = 16;
  const grassDataArray = new Float32Array(grassBlades * grassStructSize);
  return instancedArray(grassDataArray, grassStructure);
}

export function createVisibleIndicesBuffer(grassBlades: number) {
  const visibleIndicesArray = new Uint32Array(grassBlades);
  return instancedArray(visibleIndicesArray, "uint");
}

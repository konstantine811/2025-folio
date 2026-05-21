import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export const LEAF_MASK_PATH = "/textures/leavs.png";

let sharedPerlinTexture: THREE.DataTexture | null = null;

export function getPerlinTexture() {
  if (sharedPerlinTexture) {
    return sharedPerlinTexture;
  }

  const size = 256;
  const grid = 32;
  const lattice = Float32Array.from(
    { length: grid * grid },
    () => Math.random(),
  );

  const sample = (u: number, v: number) => {
    const x = u * (grid - 1);
    const y = v * (grid - 1);
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const x1 = Math.min(x0 + 1, grid - 1);
    const y1 = Math.min(y0 + 1, grid - 1);
    const tx = x - x0;
    const ty = y - y0;
    const v00 = lattice[y0 * grid + x0];
    const v10 = lattice[y0 * grid + x1];
    const v01 = lattice[y1 * grid + x0];
    const v11 = lattice[y1 * grid + x1];
    const a = v00 + (v10 - v00) * tx;
    const b = v01 + (v11 - v01) * tx;
    return a + (b - a) * ty;
  };

  const data = new Uint8Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      data[y * size + x] = Math.floor(sample(x / size, y / size) * 255);
    }
  }

  sharedPerlinTexture = new THREE.DataTexture(
    data,
    size,
    size,
    THREE.RedFormat,
  );
  sharedPerlinTexture.name = "bushPerlinWind";
  sharedPerlinTexture.wrapS = THREE.RepeatWrapping;
  sharedPerlinTexture.wrapT = THREE.RepeatWrapping;
  sharedPerlinTexture.colorSpace = THREE.NoColorSpace;
  sharedPerlinTexture.generateMipmaps = false;
  sharedPerlinTexture.minFilter = THREE.LinearFilter;
  sharedPerlinTexture.magFilter = THREE.LinearFilter;
  sharedPerlinTexture.needsUpdate = true;

  return sharedPerlinTexture;
}

export function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function tileSeed(tileX: number, tileZ: number, seed: number) {
  return (tileX * 73856093) ^ (tileZ * 19349663) ^ seed;
}

function setBrunoPlaneNormals(
  geometry: THREE.BufferGeometry,
  position: THREE.Vector3,
  normalMix: number,
) {
  const normal = position.clone().normalize();
  const positions = geometry.attributes.position;
  const normalArray = new Float32Array(positions.count * 3);

  for (let v = 0; v < positions.count; v++) {
    const i3 = v * 3;
    const vertexPosition = new THREE.Vector3(
      positions.array[i3],
      positions.array[i3 + 1],
      positions.array[i3 + 2],
    );
    const mixedNormal = vertexPosition.lerp(normal, normalMix);
    normalArray[i3] = mixedNormal.x;
    normalArray[i3 + 1] = mixedNormal.y;
    normalArray[i3 + 2] = mixedNormal.z;
  }

  geometry.setAttribute("normal", new THREE.BufferAttribute(normalArray, 3));
}

export function createBushGeometry(
  leafCount: number,
  bushRadius: number,
  normalMix: number,
  seed = 0,
) {
  const planes: THREE.BufferGeometry[] = [];
  const baseGeometry = new THREE.PlaneGeometry(1, 1);
  const position = new THREE.Vector3();
  const spherical = new THREE.Spherical();
  const rng = mulberry32(seed || 1);

  for (let i = 0; i < leafCount; i++) {
    const plane = baseGeometry.clone();

    spherical.set(
      bushRadius * (1 - Math.pow(rng(), 3)),
      Math.PI * 2 * rng(),
      Math.PI * rng(),
    );
    position.setFromSpherical(spherical);

    plane.rotateX(rng() * Math.PI * 2);
    plane.rotateY(rng() * Math.PI * 2);
    plane.rotateZ(rng() * Math.PI * 2);
    plane.translate(position.x, position.y, position.z);

    setBrunoPlaneNormals(plane, position, normalMix);
    planes.push(plane);
  }

  const merged = mergeGeometries(planes);
  baseGeometry.dispose();
  planes.forEach((p) => p.dispose());

  if (!merged) {
    throw new Error("Failed to merge bush geometries");
  }

  merged.translate(0, bushRadius, 0);
  merged.computeBoundingSphere();

  return merged;
}

export type BushConfig = {
  leafCount?: number;
  bushRadius?: number;
  windStrength?: number;
  windSpeed?: number;
  normalMix?: number;
  debug?: boolean;
};

export const DEFAULT_BUSH_CONFIG: Required<BushConfig> = {
  leafCount: 80,
  bushRadius: 1,
  windStrength: 0.12,
  windSpeed: 0.05,
  normalMix: 0.4,
  debug: false,
};

import * as THREE from "three";

/** Pixels in the 1D history buffer (128 past wheel contact samples). */
export const WHEEL_CONTACT_HISTORY_SIZE = 128;

export type WheelContactHistoryEntry = {
  /** Float RGBA — world X/Y/Z + contact (same data for grass + debug). */
  texture: THREE.DataTexture;
  data: Float32Array;
};

function configureHistoryTexture(texture: THREE.DataTexture, name: string) {
  texture.name = name;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.colorSpace = THREE.NoColorSpace;
  texture.flipY = false;
  texture.needsUpdate = true;
}

export function createWheelContactHistoryTexture(): WheelContactHistoryEntry {
  const data = new Float32Array(WHEEL_CONTACT_HISTORY_SIZE * 4);
  const texture = new THREE.DataTexture(
    data,
    WHEEL_CONTACT_HISTORY_SIZE,
    1,
    THREE.RGBAFormat,
    THREE.FloatType,
  );
  configureHistoryTexture(texture, "wheelContactHistory");

  return { texture, data };
}

/**
 * Shift history one pixel to the right, then write the newest sample at index 0.
 * R = X, G = Y, B = Z, A = 1 when the wheel touches a surface, else 0.
 */
export function shiftAndInsertWheelContact(
  data: Float32Array,
  x: number,
  y: number,
  z: number,
  inContact: boolean,
) {
  for (let i = WHEEL_CONTACT_HISTORY_SIZE - 1; i > 0; i -= 1) {
    const dst = i * 4;
    const src = dst - 4;
    data[dst] = data[src];
    data[dst + 1] = data[src + 1];
    data[dst + 2] = data[src + 2];
    data[dst + 3] = data[src + 3];
  }

  data[0] = x;
  data[1] = y;
  data[2] = z;
  data[3] = inContact ? 1 : 0;
}

export function recordWheelContactPoint(
  entry: WheelContactHistoryEntry,
  x: number,
  y: number,
  z: number,
  inContact: boolean,
) {
  shiftAndInsertWheelContact(entry.data, x, y, z, inContact);
  entry.texture.needsUpdate = true;
}

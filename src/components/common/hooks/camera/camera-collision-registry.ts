import { Mesh } from "three";

const includeMeshes = new Set<Mesh>();
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function registerCameraCollisionMesh(mesh: Mesh) {
  if (includeMeshes.has(mesh)) return;
  includeMeshes.add(mesh);
  notify();
}

export function unregisterCameraCollisionMesh(mesh: Mesh) {
  if (!includeMeshes.delete(mesh)) return;
  notify();
}

export function getCameraCollisionMeshes() {
  return includeMeshes;
}

export function subscribeCameraCollisionMeshes(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

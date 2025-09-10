import { Object3D } from "three";

export function updateWorldUpwards(obj: Object3D) {
  let root = obj as Object3D | null;
  while (root?.parent) root = root.parent;
  root?.updateMatrixWorld(true);
}

import { useLayoutEffect, type RefObject } from "react";
import { Mesh, Object3D } from "three";
import {
  registerCameraCollisionMesh,
  unregisterCameraCollisionMesh,
} from "./camera-collision-registry";

export function useRegisterCameraCollisionMeshes(
  rootRef: RefObject<Object3D | null>,
  deps: unknown[] = [],
) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const registered: Mesh[] = [];

    root.traverse((child) => {
      if (
        (child as Mesh).isMesh &&
        child.userData?.camIncludeCollision === true
      ) {
        registerCameraCollisionMesh(child as Mesh);
        registered.push(child as Mesh);
      }
    });

    return () => {
      registered.forEach(unregisterCameraCollisionMesh);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

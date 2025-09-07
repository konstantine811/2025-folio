import { useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import { BufferGeometry, Mesh, Object3D, SkinnedMesh } from "three";
import { prepareGeomtry } from "./prepareGeometry";

export function useGeometry(modelUrl: string, meshName?: string) {
  const { nodes, scene } = useGLTF(modelUrl);

  const baseGeom = useMemo(() => {
    if (meshName) {
      const node = nodes?.[meshName] as SkinnedMesh;
      if (!node || !node.geometry) {
        console.warn(
          `[Geometry] Не знайдено mesh "${meshName}" у GLTF. Буде використано перший mesh у сцені.`
        );
        return getFirstMeshGeometry(scene);
      }
      return node.geometry as BufferGeometry;
    }
    return getFirstMeshGeometry(scene);
  }, [meshName, scene, nodes]);

  return useMemo(() => prepareGeomtry(baseGeom), [baseGeom]);
}

function getFirstMeshGeometry(root: Object3D): BufferGeometry {
  let found: BufferGeometry | null = null;
  root.traverse((obj) => {
    if (!found && obj.type === "Mesh") {
      found = (obj as Mesh).geometry as BufferGeometry;
    }
  });
  if (!found) throw new Error("GLTF не містить Mesh із геометрією.");
  return found!;
}

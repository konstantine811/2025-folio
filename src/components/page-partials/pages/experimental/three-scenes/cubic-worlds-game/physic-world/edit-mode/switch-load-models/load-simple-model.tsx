import { useGLTF } from "@react-three/drei";
import { LoadModelProps, MeshData } from "./load.model";
import { useEffect, useMemo } from "react";
import {
  BufferGeometry,
  Material,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
} from "three";

function toLit(mat: Material) {
  if (mat.type === "MeshBasicMaterial") {
    return new MeshStandardMaterial({
      // metalness: 0.01,
      // roughness: 0.8,
      color: (mat as MeshBasicMaterial).color,
      map: (mat as MeshBasicMaterial).map ?? null,
    });
  }
  return mat;
}

const LoadSimpleModel = ({ modelUrl, onCreateModelGeom }: LoadModelProps) => {
  const { scene } = useGLTF(modelUrl);
  const sceneMesh = useMemo<MeshData>(() => {
    let geom: BufferGeometry | undefined;
    let mat: Material | undefined;

    scene.traverse((o: Object3D) => {
      if ((o as Mesh).isMesh && !geom) {
        const mesh = o as Mesh;

        geom = mesh.geometry;

        const m = mesh.material as Material | Material[];
        const base = Array.isArray(m) ? m[0] : m;

        // якщо unlit — замінюємо на стандартний
        const lit = toLit(base);
        mat = lit.clone(); // якщо потрібно мати свій інстанс матеріалу
      }
    });

    if (!geom || !mat) throw new Error("GLTF не містить Mesh/Material.");
    return { geometry: geom, material: mat };
  }, [scene]);

  useEffect(() => {
    onCreateModelGeom(sceneMesh.geometry, sceneMesh.material);
  }, [sceneMesh]);
  return null;
};

export default LoadSimpleModel;

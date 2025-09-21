import { useGLTF } from "@react-three/drei";
import { LoadModelProps, MeshData } from "./load.model";
import { useEffect, useMemo } from "react";
import { BufferGeometry, Material, Mesh, Object3D } from "three";

const LoadSimpleModel = ({ modelUrl, onCreateModelGeom }: LoadModelProps) => {
  const { scene } = useGLTF(modelUrl);
  const sceneMesh = useMemo<MeshData>(() => {
    let geom: BufferGeometry | undefined;
    let mat: Material | undefined;

    scene.traverse((o: Object3D) => {
      if ((o as Mesh).isMesh && !geom) {
        const mesh = o as Mesh;

        geom = mesh.geometry;

        // Матеріал у меша може бути або один, або масив (групи)
        const m = mesh.material as Material | Material[];

        mat = Array.isArray(m) ? m[0] : m;

        // якщо плануєш змінювати параметри — краще клонувати
        mat = mat.clone();
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

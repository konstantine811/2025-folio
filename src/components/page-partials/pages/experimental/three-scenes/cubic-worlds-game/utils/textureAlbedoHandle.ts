import { Mesh, Object3D, Texture, MeshBasicMaterial } from "three";
import { useGLTF } from "@react-three/drei";

export function useEmbeddedMaps(modelUrl: string, meshName?: string) {
  const gltf = useGLTF(modelUrl);
  let mesh: Mesh | null = null;

  if (meshName && gltf.nodes?.[meshName]) {
    mesh = gltf.nodes[meshName] as Mesh;
  } else {
    gltf.scene.traverse((o: Object3D) => {
      if (!mesh && (o as Mesh).isMesh) mesh = o as Mesh;
    });
  }

  let albedo: Texture | null = null;

  const mat = mesh?.material as unknown as MeshBasicMaterial;
  if (mat?.map) {
    albedo = mat.map as Texture;
    // три.js сам декодує sRGB, якщо текстура позначена sRGB і renderer.outputEncoding налаштований.
    albedo.anisotropy = 8;
  }
  // edge маску беремо з aoMap/alphaMap, якщо є

  return { albedo };
}

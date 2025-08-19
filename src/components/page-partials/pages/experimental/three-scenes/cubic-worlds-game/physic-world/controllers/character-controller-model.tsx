import { ActionName } from "./config/character.config";
import { Mesh } from "three";
import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";

const CharacterControllerModel = ({
  path,
  position,
  scale = 1,
}: {
  path: string;
  position?: [number, number, number];
  scale?: number;
  animation?: ActionName;
}) => {
  const { scene } = useGLTF(path);
  scene.traverse((child) => {
    if (child instanceof Mesh) {
      child.castShadow = true;
    }
  });

  useEffect(() => {
    useGLTF.preload(path);
  }, [path]);

  return <primitive object={scene} position={position} scale={scale} />;
};
export default CharacterControllerModel;

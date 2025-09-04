import { ActionName } from "./config/character.config";
import { Mesh } from "three";
import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";
import { useGameDataStore } from "./stores/game-data-store";

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
  const { scene, nodes } = useGLTF(path);
  const setCharacterNodes = useGameDataStore((s) => s.setCharacterNodes);
  scene.traverse((child) => {
    if (child instanceof Mesh) {
      child.castShadow = true;
    }
  });

  setCharacterNodes(nodes);
  useEffect(() => {
    useGLTF.preload(path);
  }, [path]);

  return <primitive object={scene} position={position} scale={scale} />;
};
export default CharacterControllerModel;

import { useEffect, useRef } from "react";
import { ActionName } from "./config/character.config";
import { Mesh } from "three";
import { useAnimations, useGLTF } from "@react-three/drei";

const CharacterModel = ({
  path,
  position,
  scale = 1,
  animation = ActionName.Idle,
}: {
  path: string;
  position: [number, number, number];
  scale?: number;
  animation?: ActionName;
}) => {
  const { scene, animations } = useGLTF(path);
  const ref = useRef<Mesh>(null!);
  const { actions } = useAnimations(animations, ref);

  useEffect(() => {
    actions[animation as ActionName]?.reset().fadeIn(0.1).play();
    return () => {
      actions[animation as ActionName]?.fadeOut(0.1);
    };
  }, [animation, actions]);
  // Додаємо castShadow для всіх мешів у моделі
  scene.traverse((child) => {
    if (child instanceof Mesh) {
      child.castShadow = true;
    }
  });
  return (
    <primitive ref={ref} object={scene} position={position} scale={scale} />
  );
};
export default CharacterModel;

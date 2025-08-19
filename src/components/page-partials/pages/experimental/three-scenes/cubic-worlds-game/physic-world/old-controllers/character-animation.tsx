import { useEffect, useRef } from "react";
import { Mesh } from "three";
import { useAnimations, useGLTF } from "@react-three/drei";
import { useGameStore } from "../controllers/stores/game-store";
import { AnimationSet } from "../controllers/config/character.config";

const CharacterAnimationModel = ({
  path,
  position,
  scale = 1,
}: {
  path: string;
  position: [number, number, number];
  scale?: number;
}) => {
  const { scene, animations } = useGLTF(path);
  const animation = useGameStore((state) => state.curAnimation);
  const ref = useRef<Mesh>(null!);
  const { actions } = useAnimations(animations, ref);

  useEffect(() => {
    actions[animation as keyof AnimationSet]?.reset().fadeIn(0.1).play();
    return () => {
      actions[animation as keyof AnimationSet]?.fadeOut(0.1);
    };
  }, [animation, actions]);
  // Додаємо castShadow для всіх мешів у моделі
  scene.traverse((child) => {
    if (child instanceof Mesh) {
      child.castShadow = true;
    }
  });
  return (
    <group dispose={null} userData={{ camExcludeCollision: true }}>
      <primitive ref={ref} object={scene} position={position} scale={scale} />
    </group>
  );
};
export default CharacterAnimationModel;

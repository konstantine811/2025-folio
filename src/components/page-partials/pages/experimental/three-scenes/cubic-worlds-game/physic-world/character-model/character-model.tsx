import { useEffect, useRef } from "react";
import { LoopOnce, Mesh } from "three";
import { useAnimations, useGLTF } from "@react-three/drei";
import { useGame } from "ecctrl";
import { animationSet } from "../controllers/character.config";

const CharacterModel = ({
  path,
  position,
  scale = 1,
}: {
  path: string;
  position?: [number, number, number];
  scale?: number;
}) => {
  const { scene, animations } = useGLTF(path);
  const ref = useRef<Mesh>(null!);
  const { actions } = useAnimations(animations, ref);
  const curAnimation = useGame((state) => state.curAnimation);
  const resetAnimation = useGame((state) => state.reset);
  const initializeAnimationSet = useGame(
    (state) => state.initializeAnimationSet
  );

  useEffect(() => {
    // Initialize animation set
    initializeAnimationSet(animationSet);
  }, [initializeAnimationSet]);

  useEffect(() => {
    // Play animation
    const action = actions[curAnimation ? curAnimation : animationSet.jumpIdle];
    console.log("Current Animation:", curAnimation);
    // For jump and jump land animation, only play once and clamp when finish
    if (action) {
      if (
        curAnimation === animationSet.jump ||
        curAnimation === animationSet.jumpLand
      ) {
        action.reset().fadeIn(0.2).setLoop(LoopOnce, 1).play();
        action.clampWhenFinished = true;
      } else {
        action.reset().fadeIn(0.2).play();
      }
    }
  }, [curAnimation, actions, resetAnimation]);
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

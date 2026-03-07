import { useAnimations, useGLTF } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import { Group, Mesh } from "three";
import { CharacterAnimations } from "../models/character-controller.model";

const CharacterModel = ({
  modelPath,
  animationType,
  isMoving,
  isSprinting,
  isGrounded,
}: {
  modelPath: string;
  isMoving?: boolean;
  isSprinting?: boolean;
  isGrounded?: boolean;
  animationType: CharacterAnimations;
}) => {
  const groupRef = useRef<Group>(null);
  const { scene, animations } = useGLTF(modelPath, true);
  const [currentAnimation, setCurrentAnimation] = useState<string | null>(null);
  const { actions } = useAnimations(animations, groupRef);

  scene.traverse((child) => {
    if (child instanceof Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;
      const mat = child.material;
      mat.depthWrite = true;
    }
  });

  useEffect(() => {
    let targetAnimation = animationType.idle;
    if (!isGrounded) {
      targetAnimation = animationType.jumpFalling;
    } else if (isMoving) {
      targetAnimation = isSprinting ? animationType.run : animationType.walk;
    }

    // if it's first animation or same animation, just play it
    if (!currentAnimation || currentAnimation === targetAnimation) {
      const action = actions[targetAnimation];
      if (action) {
        action.reset().play();
        setCurrentAnimation(targetAnimation);
      }
    }
    // Crossfade to new aniamtion
    if (currentAnimation) {
      const prevAction = actions[currentAnimation];
      const nextAction = actions[targetAnimation];

      if (prevAction && nextAction) {
        // Start new animation
        nextAction.reset().play();
        // Crossfade with the previos animation
        prevAction.crossFadeTo(nextAction, 0.15, true);
        setCurrentAnimation(targetAnimation);
      }
    }
  }, [
    actions,
    animationType,
    isMoving,
    isSprinting,
    isGrounded,
    currentAnimation,
  ]);

  return <primitive ref={groupRef} object={scene} />;
};

export default CharacterModel;

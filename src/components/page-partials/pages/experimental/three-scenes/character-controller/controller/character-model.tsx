import { useAnimations, useGLTF } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import { AnimationMixerEventMap, Group, LoopOnce, Mesh } from "three";
import { CharacterAnimations } from "../models/character-controller.model";
import { useControlStore } from "@/components/common/game-controller/store/control-game-store";

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

  // 1) читаємо стан ЛКМ зі стора
  const isPrimaryClick = useControlStore((s) => s.primaryClick);
  // 2) локальний прапор атаки (щоб атака дограла до кінця)
  const [isAttacking, setIsAttacking] = useState(false);
  const isStartAttack = useRef(false);
  const [isAttackDouble, setIsAttackDouble] = useState(false);
  // якщо натиснули ЛКМ – запускаємо атаку
  useEffect(() => {
    if (isPrimaryClick) {
      setIsAttacking(true);
    }
  }, [isPrimaryClick]);

  useEffect(() => {
    if (isPrimaryClick && isStartAttack.current) {
      setIsAttackDouble(true);
    }
  }, [isPrimaryClick, isStartAttack]);

  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        const mat = child.material;
        mat.depthWrite = true;
      }
    });
  }, [scene]);
  useEffect(() => {
    if (isAttackDouble && !isSprinting && !isMoving && isGrounded) {
      const attackName = animationType.attack; // має існувати в CharacterAnimations
      const attackAction = actions[attackName];
      if (!attackAction) return;
      const prev = currentAnimation ? actions[currentAnimation] : null;
      // граємо атаку один раз
      attackAction.enabled = true;
      attackAction.paused = false;
      attackAction.setLoop(LoopOnce, 1);
      attackAction.clampWhenFinished = true;
      attackAction.time = attackAction.getClip().duration / 1.2;
      attackAction.timeScale = -2;
      attackAction.play();
      if (prev && prev !== attackAction) {
        prev.crossFadeTo(attackAction, 0.3, true);
      }

      setCurrentAnimation(attackName);
      // коли анімація закінчилась – вимикаємо атаку
      const mixer = attackAction.getMixer();
      const onFinished = (e: AnimationMixerEventMap["finished"]) => {
        if (e.action === attackAction) {
          setIsAttackDouble(false);
          setIsAttacking(false);
          isStartAttack.current = false;
          mixer.removeEventListener("finished", onFinished);
        }
      };
      mixer.addEventListener("finished", onFinished);
      return;
    }
    if (isAttacking && !isSprinting && !isMoving && isGrounded) {
      const attackName = animationType.attack; // має існувати в CharacterAnimations
      const attackAction = actions[attackName];
      if (!attackAction) return;
      const prev = currentAnimation ? actions[currentAnimation] : null;
      // граємо атаку один раз
      attackAction.reset();
      attackAction.setLoop(LoopOnce, 1);
      attackAction.clampWhenFinished = true;
      attackAction.timeScale = 2;
      attackAction.play();
      if (prev && prev !== attackAction) {
        prev.crossFadeTo(attackAction, 0.3, true);
      }
      setTimeout(() => {
        isStartAttack.current = true;
      }, 1000);
      setCurrentAnimation(attackName);
      // коли анімація закінчилась – вимикаємо атаку
      const mixer = attackAction.getMixer();
      const onFinished = (e: AnimationMixerEventMap["finished"]) => {
        if (e.action === attackAction) {
          setIsAttacking(false);
          setIsAttackDouble(false);
          isStartAttack.current = false;
          mixer.removeEventListener("finished", onFinished);
        }
      };
      mixer.addEventListener("finished", onFinished);
      return;
    }

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
    isAttacking,
    isAttackDouble,
  ]);

  return <primitive ref={groupRef} object={scene} />;
};

export default CharacterModel;

import { MutableRefObject, useEffect } from "react";
import { AnimationAction } from "three";
import { CharacterAnimations } from "../models/character-controller.model";
import { playAttack } from "./play-action";

type ActionsMap = Record<string, AnimationAction | null>;

type UseCombatAnimationDriverParams = {
  enabled: boolean;

  actions: ActionsMap;
  currentActionRef: MutableRefObject<string | null>;
  isAttackingRef: MutableRefObject<boolean>;

  animationType: CharacterAnimations;

  isPrimaryClick: boolean;

  isMoving?: boolean;
  isSprinting?: boolean;
  isGrounded?: boolean;

  setPlayerAttacking: (value: boolean) => void;
};

export function useCombatAnimationDriver({
  enabled,
  actions,
  currentActionRef,
  isAttackingRef,
  animationType,
  isPrimaryClick,
  isMoving,
  isSprinting,
  isGrounded,
  setPlayerAttacking,
}: UseCombatAnimationDriverParams) {
  useEffect(() => {
    if (!enabled) return;
    if (!isPrimaryClick) return;

    if (isSprinting || isMoving || !isGrounded) return;

    playAttack(
      animationType,
      actions,
      currentActionRef,
      isAttackingRef,
      isGrounded,
      isMoving ?? false,
      isSprinting ?? false,
      setPlayerAttacking,
    );
  }, [
    enabled,
    isPrimaryClick,
    isMoving,
    isSprinting,
    isGrounded,
    actions,
    currentActionRef,
    isAttackingRef,
    animationType,
    setPlayerAttacking,
  ]);
}

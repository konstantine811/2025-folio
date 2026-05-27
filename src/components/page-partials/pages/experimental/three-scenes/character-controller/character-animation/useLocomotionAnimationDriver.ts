import { RefObject, useEffect } from "react";
import { AnimationAction } from "three";
import { CharacterAnimations } from "../models/character-controller.model";
import { animationConfig } from "../config/character-controller.config";
import { playAction, resolveLocomotionAnimation } from "./play-action";

type ActionsMap = Record<string, AnimationAction | null>;

type UseLocomotionAnimationDriverParams = {
  enabled: boolean;
  actions: ActionsMap;
  currentActionRef: RefObject<string | null>;
  animationType: CharacterAnimations;
  isMoving?: boolean;
  isSprinting?: boolean;
  isGrounded?: boolean;
};

export function useLocomotionAnimationDriver({
  enabled,
  actions,
  currentActionRef,
  animationType,
  isMoving,
  isSprinting,
  isGrounded,
}: UseLocomotionAnimationDriverParams) {
  const isActionsReady = Object.keys(actions).length > 0;

  useEffect(() => {
    if (!enabled || !isActionsReady) return;

    const idleAction = actions[animationType.idle];
    if (!idleAction) return;

    if (currentActionRef.current === null) {
      playAction(actions, currentActionRef, animationType.idle, animationConfig.locomotion);
    }
  }, [enabled, isActionsReady, actions, animationType, currentActionRef]);

  useEffect(() => {
    if (!enabled) return;
    if (!isActionsReady) return;
    const target = resolveLocomotionAnimation({
      isGrounded,
      isMoving,
      isSprinting,
      animationType,
    });

    const targetAction = actions[target];

    if (!targetAction) return;

    if (currentActionRef.current === target && targetAction.isRunning()) {
      return;
    }

    playAction(actions, currentActionRef, target, animationConfig.locomotion);
  }, [
    enabled,
    isActionsReady,
    actions,
    currentActionRef,
    animationType,
    isMoving,
    isSprinting,
    isGrounded,
  ]);
}

import type { RefObject } from "react";
import { AnimationAction, AnimationMixerEventMap, LoopOnce } from "three";
import {
  CharacterAnimations,
  PlayOptions,
} from "../models/character-controller.model";
import { animationConfig } from "../config/character-controller.config";

export function playAction(
  actions: { [x: string]: AnimationAction | null },
  currentActionRef: RefObject<string | null>,
  name: string,
  options: PlayOptions = {},
) {
  const {
    fadeDuration = 0.15,
    loopOnce = false,
    clampWhenFinished = false,
    timeScale = 1,
    startAt,
    transition = "fade",
    preserveTime = false,
  } = options;

  const next = actions[name];
  if (!next) return null;

  const prevName = currentActionRef.current;
  const prev = prevName ? actions[prevName] : null;

  const shouldPreserveCurrentTime = preserveTime && prev === next;
  const preservedTime = shouldPreserveCurrentTime ? next.time : undefined;

  if (!shouldPreserveCurrentTime) {
    next.stop();
    next.reset();
  }

  next.enabled = true;
  next.paused = false;
  next.clampWhenFinished = clampWhenFinished;
  next.setEffectiveWeight(1);
  next.timeScale = timeScale;
  next.setEffectiveTimeScale(timeScale);

  if (loopOnce) {
    next.setLoop(LoopOnce, 1);
  }

  if (typeof startAt === "number") {
    next.time = startAt;
  } else if (typeof preservedTime === "number") {
    next.time = preservedTime;
  } else if (!shouldPreserveCurrentTime) {
    next.time = timeScale < 0 ? next.getClip().duration - 0.001 : 0;
  }

  next.play();

  if (prev && prev !== next) {
    if (transition === "fade") {
      prev.crossFadeTo(next, fadeDuration, true);
    } else {
      prev.stop();
    }
  }

  currentActionRef.current = name;
  return next;
}

export function resolveLocomotionAnimation({
  isGrounded,
  isMoving,
  isSprinting,
  animationType,
}: {
  isGrounded?: boolean;
  isMoving?: boolean;
  isSprinting?: boolean;
  animationType: CharacterAnimations;
}) {
  if (!isGrounded) return animationType.jumpFalling;
  if (isMoving) return isSprinting ? animationType.run : animationType.walk;
  return animationType.idle;
}

export const playAttack = (
  reverse = false,
  animationType: CharacterAnimations,
  actions: { [x: string]: AnimationAction | null },
  currentActionRef: RefObject<string | null>,
  isAttackingRef: RefObject<boolean>,
  isGrounded: boolean,
  isMoving: boolean,
  isSprinting: boolean,
) => {
  const attackName = animationType.attack;
  const attackAction = actions[attackName];
  if (!attackAction) return;

  let action: AnimationAction | null = null;

  if (!isAttackingRef.current) {
    action = playAction(actions, currentActionRef, attackName, {
      ...animationConfig.attack_1,
      clampWhenFinished: true,
      timeScale: 2,
      startAt: undefined,
      transition: "stop",
    });
  }

  if (!action) return;

  const mixer = action.getMixer();
  const clipDuration = action.getClip().duration;
  const timeScale = Math.abs(action.timeScale || 1);

  // Наприклад, за 0.12 сек до кінця
  const earlyTriggerOffset = 0.12;

  // Реальна тривалість з урахуванням timeScale
  const realDuration = clipDuration / timeScale;

  const timeoutMs = Math.max((realDuration - earlyTriggerOffset) * 800, 0);

  const earlyTransitionTimeout = window.setTimeout(() => {
    // тут можна дозволити наступну атаку ще ДО finished
    isAttackingRef.current = false;
  }, timeoutMs);

  const onFinished = (e: AnimationMixerEventMap["finished"]) => {
    if (e.action !== action) return;

    window.clearTimeout(earlyTransitionTimeout);

    isAttackingRef.current = false;

    const locomotion = resolveLocomotionAnimation({
      isGrounded,
      isMoving,
      isSprinting,
      animationType,
    });

    playAction(
      actions,
      currentActionRef,
      locomotion,
      animationConfig.locomotion,
    );

    mixer.removeEventListener("finished", onFinished);
  };

  mixer.addEventListener("finished", onFinished);
  isAttackingRef.current = true;
};

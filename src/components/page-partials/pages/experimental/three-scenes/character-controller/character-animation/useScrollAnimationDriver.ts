import { RefObject, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AnimationAction,
  AnimationMixer,
  Group,
  LoopOnce,
  LoopRepeat,
} from "three";
import { normalizeRange } from "@/utils/math/normalize";

type ActionsMap = Record<string, AnimationAction | null>;

type UseScrollAnimationDriverParams = {
  enabled: boolean;

  actions: ActionsMap;
  mixer: AnimationMixer;

  modelRootRef: RefObject<Group | null>;

  scrollProgressRef: RefObject<number>;

  sitToStandAnimation: string;
  walkAnimation: string;

  standScrollEnd: number;
  walkScrollStart: number;
  walkScrollEnd: number;

  walkDistance: number;
  walkCycles: number;
};

export function useScrollAnimationDriver({
  enabled,
  actions,
  mixer,
  modelRootRef,
  scrollProgressRef,
  sitToStandAnimation,
  walkAnimation,
  standScrollEnd,
  walkScrollStart,
  walkScrollEnd,
  walkDistance,
  walkCycles,
}: UseScrollAnimationDriverParams) {
  useEffect(() => {
    if (!enabled) return;

    const sitToStand = actions[sitToStandAnimation];
    const walk = actions[walkAnimation];

    if (!sitToStand || !walk) return;

    sitToStand.reset().setLoop(LoopOnce, 1).play();
    sitToStand.clampWhenFinished = true;

    walk.reset().setLoop(LoopRepeat, Infinity).play();

    return () => {
      sitToStand.stop();
      walk.stop();
    };
  }, [enabled, actions, sitToStandAnimation, walkAnimation]);

  useFrame(() => {
    if (!enabled) return;

    const sitToStand = actions[sitToStandAnimation];
    const walk = actions[walkAnimation];

    if (!sitToStand || !walk || !modelRootRef.current) return;

    const scrollOffset = scrollProgressRef.current ?? 0;

    const standProgress = normalizeRange(scrollOffset, 0, standScrollEnd);

    const walkProgress = normalizeRange(
      scrollOffset,
      walkScrollStart,
      walkScrollEnd,
    );

    const transitionToWalk = normalizeRange(
      scrollOffset,
      walkScrollStart,
      standScrollEnd,
    );

    sitToStand.time = sitToStand.getClip().duration * standProgress;
    sitToStand.setEffectiveWeight(1 - transitionToWalk);

    const walkDuration = walk.getClip().duration;

    walk.time = (walkDuration * walkProgress * walkCycles) % walkDuration;
    walk.setEffectiveWeight(transitionToWalk);

    modelRootRef.current.position.z = -walkDistance * walkProgress;

    mixer.update(0);
  });
}

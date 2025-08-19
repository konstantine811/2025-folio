import { useGLTF, useAnimations } from "@react-three/drei";
import { useEffect, useRef, Suspense } from "react";
import { useGameStore } from "./stores/game-store";
import {
  AnimationAction,
  AnimationMixer,
  AnimationMixerEventMap,
  Group,
  LoopOnce,
} from "three";
import { AnimationSet } from "./config/character.config";

export type CharacterControllerAnimationProps = {
  characterURL: string;
  animationSet: AnimationSet;
  children: React.ReactNode;
};

export default function CharacterControllerAnimation(
  props: CharacterControllerAnimationProps
) {
  // Change the character src to yours
  const group = useRef<Group | null>(null);
  const { animations } = useGLTF(props.characterURL);
  const { actions } = useAnimations(animations, group);

  /**
   * Character animations setup
   */
  const curAnimation = useGameStore((state) => state.curAnimation);
  const resetAnimation = useGameStore((state) => state.resetAnimation);
  const initializeAnimationSet = useGameStore(
    (state) => state.initializeAnimationSet
  );

  useEffect(() => {
    // Initialize animation set
    initializeAnimationSet(props.animationSet);
  }, [initializeAnimationSet, props.animationSet]);

  useEffect(() => {
    // вибираємо дію
    const key = curAnimation ?? props.animationSet.jumpIdle;
    const action: AnimationAction | undefined = key
      ? actions[key] ?? undefined
      : undefined;
    if (!action) return;
    // налаштовуємо відтворення
    const isPlayOnce =
      curAnimation === props.animationSet.jump ||
      curAnimation === props.animationSet.jumpLand ||
      curAnimation === props.animationSet.action1 ||
      curAnimation === props.animationSet.action2 ||
      curAnimation === props.animationSet.action3 ||
      curAnimation === props.animationSet.action4;

    if (isPlayOnce) {
      action.reset().fadeIn(0.2).setLoop(LoopOnce, 0).play();
      action.clampWhenFinished = true;
    } else {
      action.reset().fadeIn(0.2).play();
    }

    // --- БЕЗ any: слухач на міксері дії
    const mixer: AnimationMixer = action.getMixer();
    const onFinished = (e: AnimationMixerEventMap["finished"]) => {
      // на випадок, якщо в міксері кілька дій — фільтруємо саме нашу
      if (e.action === action) resetAnimation();
    };

    mixer.addEventListener("finished", onFinished);

    return () => {
      action.fadeOut(0.2);
      mixer.removeEventListener("finished", onFinished);
    };
  }, [curAnimation, props.animationSet, group, actions, resetAnimation]);

  return (
    <Suspense fallback={null}>
      <group
        ref={group}
        dispose={null}
        userData={{ camExcludeCollision: true }}
      >
        {/* Replace character model here */}
        {props.children}
      </group>
    </Suspense>
  );
}

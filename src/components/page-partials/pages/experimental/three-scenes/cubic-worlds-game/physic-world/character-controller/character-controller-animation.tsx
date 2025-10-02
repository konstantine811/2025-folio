import { useGLTF, useAnimations } from "@react-three/drei";
import { useEffect, useRef, Suspense, useCallback } from "react";
import { useGameStore } from "./stores/game-store";
import {
  AnimationAction,
  AnimationMixer,
  AnimationMixerEventMap,
  Group,
  LoopOnce,
  LoopRepeat,
  MathUtils,
} from "three";
import { animationSet, AnimationSet } from "./config/character.config";
import { useGameDataStore } from "./stores/game-data-store";
import useCharacterSfx from "./hooks/useCharacterSfx";
import { useThree } from "@react-three/fiber";
import { useEditModeStore } from "../../store/useEditModeStore";

export type CharacterControllerAnimationProps = {
  characterURL: string;
  animationSet: AnimationSet;
  children: React.ReactNode;
};

function playFromFraction(action: AnimationAction, frac = 0.5, fade = 0.06) {
  const clip = action.getClip();
  const t = MathUtils.clamp(frac, 0, 0.99) * clip.duration; // 0..duration
  action.stop(); // скинь попередній програш
  action.enabled = true;
  action.setLoop(LoopOnce, 0);
  action.time = t; // СТАРТ З СЕРЕДИНИ
  action.setEffectiveWeight(1).fadeIn(fade).play();
  action.clampWhenFinished = false; // щоб не «зависав» на останньому кадрі
}

const CharacterControllerAnimation = (
  props: CharacterControllerAnimationProps
) => {
  // Change the character src to yours
  const group = useRef<Group | null>(null);
  const { animations } = useGLTF(props.characterURL);
  const { actions, mixer } = useAnimations(animations, group);
  const setCharacterAnim = useGameDataStore((state) => state.setCharacterAnim);
  const isEditMode = useEditModeStore((s) => s.isEditMode);
  useCharacterSfx();
  const { gl } = useThree();

  /**
   * Character animations setup
   */
  const curAnimation = useGameStore((state) => state.curAnimation);
  const action1 = useGameStore((state) => state.action1);
  const resetAnimation = useGameStore((state) => state.resetAnimation);
  const isDisableTriggerAnim = useGameStore(
    (state) => state.isDisableTriggerAnim
  );

  const initializeAnimationSet = useGameStore(
    (state) => state.initializeAnimationSet
  );

  useEffect(() => {
    if (group.current) {
      setCharacterAnim({
        group: group.current as Group,
        mixer: mixer ?? null,
        actions:
          (actions as unknown as Record<string, AnimationAction>) ?? null,
      });
    }
  }, [group, mixer, actions, setCharacterAnim]);

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
    if (curAnimation === props.animationSet.jump) {
      group.current?.position.setY(-0.3);
    } else {
      group.current?.position.setY(0);
    }

    if (isPlayOnce) {
      if (curAnimation === props.animationSet.action1) {
        action.timeScale = 1.5;
        playFromFraction(action, 0.2, 0.06);
        // action.reset().setLoop(LoopOnce, 0).play();
      } else {
        action.reset().fadeIn(0.2).setLoop(LoopOnce, 0).play();
      }
      action.clampWhenFinished = true;
    } else {
      action.reset().fadeIn(0.2).play();
    }

    // --- БЕЗ any: слухач на міксері дії
    const mixer: AnimationMixer = action.getMixer();
    const onFinished = (e: AnimationMixerEventMap["finished"]) => {
      // на випадок, якщо в міксері кілька дій — фільтруємо саме нашу
      if (e.action === action) resetAnimation();
      window.dispatchEvent(new Event("attack:end"));
    };

    mixer.addEventListener("finished", onFinished);

    return () => {
      action.fadeOut(0.2);
      mixer.removeEventListener("finished", onFinished);
    };
  }, [curAnimation, props.animationSet, group, actions, resetAnimation]);

  useEffect(() => {
    // ---- Постійне кліпання: грає паралельно завжди
    const blink = actions[animationSet.blink];
    if (!blink) return;

    blink
      .reset()
      .setLoop(LoopRepeat, Infinity)
      .setEffectiveWeight(1)
      .fadeIn(0.3) // повна вага кліпу
      .play();

    // за бажанням прискорити/сповільнити:
    blink.timeScale = 1; // 1 = як в Blender’і
  }, [actions]);

  const onClick = useCallback(() => {
    if (isDisableTriggerAnim) return;
    resetAnimation();
    setTimeout(() => {
      action1();
    });
  }, [isDisableTriggerAnim, action1, resetAnimation]);

  useEffect(() => {
    if (isEditMode) {
      gl.domElement.removeEventListener("click", onClick);
    } else {
      gl.domElement.addEventListener("click", onClick);
    }
    return () => gl.domElement.removeEventListener("click", onClick);
  }, [onClick, gl, isEditMode]);

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
};

export default CharacterControllerAnimation;

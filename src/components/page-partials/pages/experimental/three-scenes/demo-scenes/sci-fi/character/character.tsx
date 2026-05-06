import { JSX, useEffect, useRef } from "react";
import { useAnimations, useGLTF } from "@react-three/drei";
import { createPortal, useFrame } from "@react-three/fiber";
import {
  Group,
  LoopOnce,
  LoopRepeat,
  MathUtils,
  Object3D,
  SkinnedMesh,
} from "three";
import { SholomModel } from "./sholom";

const characterPath = "/3d-models/sci-fi/character.glb";
const sitToStandAnimation = "sit-to-stand";
const walkAnimation = "sad_walk";
const standScrollEnd = 0.28;
const walkScrollStart = 0.26;
const walkScrollEnd = 1;
const walkDistance = 4.5;
const walkCycles = 3.6;
const helmetHeadPosition: [number, number, number] = [0, 15, 1.5];
const helmetHeadRotation: [number, number, number] = [0, 0, 0];
const helmetHeadScale = 90;

const normalizeRange = (value: number, start: number, end: number) =>
  MathUtils.clamp((value - start) / (end - start), 0, 1);

type CharacterProps = JSX.IntrinsicElements["group"] & {
  scrollProgress: number;
};

export function Character({ scrollProgress, ...props }: CharacterProps) {
  const group = useRef<Group>(null);
  const modelRoot = useRef<Group>(null);
  const { nodes, materials, animations } = useGLTF(characterPath);
  const { actions, mixer } = useAnimations(animations, group);
  const head = nodes.mixamorigHead as Object3D | undefined;

  useEffect(() => {
    const sitToStand = actions[sitToStandAnimation];
    const walk = actions[walkAnimation];

    if (!sitToStand || !walk) {
      console.warn(
        `Character animations are missing. Available clips: ${animations
          .map(({ name }) => name)
          .join(", ")}`,
      );
      return;
    }

    sitToStand.reset().setLoop(LoopOnce, 1).play();
    sitToStand.clampWhenFinished = true;

    walk.reset().setLoop(LoopRepeat, Infinity).play();

    return () => {
      sitToStand.stop();
      walk.stop();
    };
  }, [actions, animations]);

  useFrame(() => {
    const sitToStand = actions[sitToStandAnimation];
    const walk = actions[walkAnimation];

    if (!sitToStand || !walk || !modelRoot.current) {
      return;
    }

    const scrollOffset = scrollProgress;
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

    modelRoot.current.position.z = -walkDistance * walkProgress;
    mixer.update(0);
  });

  return (
    <group ref={group} {...props} dispose={null}>
      {head &&
        createPortal(
          <SholomModel
            centered
            position={helmetHeadPosition}
            rotation={helmetHeadRotation}
            scale={helmetHeadScale}
          />,
          head,
        )}
      <group ref={modelRoot} name="Scene">
        <group
          name="Armature008"
          position={[0, 0.055, 13.821]}
          rotation={[Math.PI / 2, 0, Math.PI]}
          scale={0.011}
        >
          <skinnedMesh
            name="human001"
            geometry={(nodes.human001 as SkinnedMesh).geometry}
            material={materials.Skin}
            skeleton={(nodes.human001 as SkinnedMesh).skeleton}
          />
          <skinnedMesh
            name="l_manb001"
            geometry={(nodes.l_manb001 as SkinnedMesh).geometry}
            material={materials["L_m_default.007"]}
            skeleton={(nodes.l_manb001 as SkinnedMesh).skeleton}
          />
          <primitive object={nodes.mixamorigHips} />
        </group>
      </group>
    </group>
  );
}
useGLTF.preload(characterPath);

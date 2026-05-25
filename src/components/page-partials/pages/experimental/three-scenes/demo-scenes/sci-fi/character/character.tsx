import { JSX, useEffect, useMemo, useRef } from "react";
import { useAnimations, useGLTF } from "@react-three/drei";
import { createPortal, useFrame } from "@react-three/fiber";
import { Group, LoopOnce, LoopRepeat, Object3D, SkinnedMesh } from "three";
import { HelmetCableRopes } from "./cables/helmet-cable-ropes";
import { SholomModel } from "./sholom";
import { normalizeRange } from "@/utils/math/normalize";

import { sciFiCharacterConfig } from "./sci-fi.config";

const characterPath = sciFiCharacterConfig.modelPath;
const sitToStandAnimation = sciFiCharacterConfig.animations.sitToStand;
const walkAnimation = sciFiCharacterConfig.animations.walk;
const standScrollEnd = sciFiCharacterConfig.scroll.standScrollEnd;
const walkScrollStart = sciFiCharacterConfig.scroll.walkScrollStart;
const walkScrollEnd = sciFiCharacterConfig.scroll.walkScrollEnd;
const walkDistance = sciFiCharacterConfig.scroll.walkDistance;
const walkCycles = sciFiCharacterConfig.scroll.walkCycles;
const helmetHeadPosition = sciFiCharacterConfig.helmet.position;
const helmetHeadRotation = sciFiCharacterConfig.helmet.rotation;
const helmetHeadScale = sciFiCharacterConfig.helmet.scale;
const stableWalkBoneTracks = sciFiCharacterConfig.stableWalkBoneTracks;

type CharacterProps = JSX.IntrinsicElements["group"] & {
  scrollProgress: number;
};

export function Character({ scrollProgress, ...props }: CharacterProps) {
  const group = useRef<Group>(null);
  const modelRoot = useRef<Group>(null);
  const { nodes, materials, animations } = useGLTF(characterPath);
  const characterAnimations = useMemo(
    () =>
      animations.map((clip) => {
        if (clip.name !== walkAnimation) {
          return clip;
        }

        const stableWalkClip = clip.clone();
        stableWalkClip.tracks = stableWalkClip.tracks.filter(({ name }) => {
          const normalizedTrackName = name
            .replace(/[^a-z0-9]/gi, "")
            .toLowerCase();

          return !stableWalkBoneTracks.some((boneName) =>
            normalizedTrackName.includes(boneName),
          );
        });

        return stableWalkClip;
      }),
    [animations],
  );
  const { actions, mixer } = useAnimations(characterAnimations, group);
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
      {head && (
        <HelmetCableRopes
          head={head}
          helmetPosition={helmetHeadPosition}
          helmetRotation={helmetHeadRotation}
          helmetScale={helmetHeadScale}
        />
      )}
      <group ref={modelRoot} name="Scene">
        <group name="Armature">
          <skinnedMesh
            name="human"
            geometry={(nodes.human as SkinnedMesh).geometry}
            material={materials["Skin.002"]}
            skeleton={(nodes.human as SkinnedMesh).skeleton}
          />
          <skinnedMesh
            name="l_manb"
            geometry={(nodes.l_manb as SkinnedMesh).geometry}
            material={materials.L_m_default}
            skeleton={(nodes.l_manb as SkinnedMesh).skeleton}
          />
          <primitive object={nodes.mixamorigHips} />
          <primitive object={nodes.Ctrl_Master} />
          <primitive object={nodes.Ctrl_Foot_IK_Left} />
          <primitive object={nodes.Ctrl_LegPole_IK_Left} />
          <primitive object={nodes.Ctrl_Foot_IK_Right} />
          <primitive object={nodes.Ctrl_LegPole_IK_Right} />
          <primitive object={nodes.Ctrl_ArmPole_IK_Left} />
          <primitive object={nodes.Ctrl_Hand_IK_Left} />
          <primitive object={nodes.Ctrl_ArmPole_IK_Right} />
          <primitive object={nodes.Ctrl_Hand_IK_Right} />
        </group>
      </group>
    </group>
  );
}
useGLTF.preload(characterPath);

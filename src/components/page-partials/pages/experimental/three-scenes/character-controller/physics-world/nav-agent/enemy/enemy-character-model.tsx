import { useAnimations, useGLTF } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import { Group, Mesh } from "three";
import { SkeletonUtils } from "three/examples/jsm/Addons.js";

type EnemyCharacterModelProps = {
  modelPath: string;
  animState: "idle" | "walk" | "attack";
  scale?: number;
  position?: [number, number, number];
};

const ANIM_NAMES = {
  idle: "Idle",
  walk: "Walk",
  attack: "Attack",
};

export default function EnemyCharacterModel({
  scale = 1,
  modelPath,
  animState,
  position,
  // lookDirRef,
  // turnSpeed = 8,
}: EnemyCharacterModelProps) {
  const groupRef = useRef<Group>(null);
  const { scene, animations } = useGLTF(modelPath);
  const clonedScene = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { actions } = useAnimations(animations, groupRef);

  const currentAnimRef = useRef<string | null>(null);

  useEffect(() => {
    clonedScene.traverse((child) => {
      if (child instanceof Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [clonedScene]);

  useEffect(() => {
    const nextName = ANIM_NAMES[animState];
    const next = actions[nextName];
    if (!next) return;

    const prevName = currentAnimRef.current;
    const prev = prevName ? actions[prevName] : null;

    if (prev === next && next.isRunning()) return;

    next.reset().fadeIn(0.15).play();

    if (prev && prev !== next) {
      prev.fadeOut(1);
    }

    currentAnimRef.current = nextName;
  }, [animState, actions]);

  return (
    <group userData={{ camExcludeCollision: true }} ref={groupRef} scale={scale} position={position}>
      <primitive object={clonedScene} />
    </group>
  );
}

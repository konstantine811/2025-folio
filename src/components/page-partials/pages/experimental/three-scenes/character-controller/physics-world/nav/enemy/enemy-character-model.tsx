import { useFrame } from "@react-three/fiber";
import { useAnimations, useGLTF } from "@react-three/drei";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import { Group, Mesh } from "three";
import { SkeletonUtils } from "three/examples/jsm/Addons.js";

type EnemyCharacterModelProps = {
  modelPath: string;
  animState: "idle" | "walk" | "attack";
  lookDirRef: RefObject<{ x: number; z: number }>;
  turnSpeed?: number;
};

const ANIM_NAMES = {
  idle: "Idle",
  walk: "Walk",
  attack: "Attack",
};

function lerpAngle(current: number, target: number, t: number) {
  let delta = target - current;

  while (delta > Math.PI) delta -= Math.PI * 2;
  while (delta < -Math.PI) delta += Math.PI * 2;

  return current + delta * t;
}

export default function EnemyCharacterModel({
  modelPath,
  animState,
  lookDirRef,
  turnSpeed = 8,
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
      prev.fadeOut(0.15);
    }

    currentAnimRef.current = nextName;
  }, [animState, actions]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    const lookDir = lookDirRef.current;
    if (!lookDir) return;

    if (Math.abs(lookDir.x) < 1e-4 && Math.abs(lookDir.z) < 1e-4) return;

    // якщо модель дивиться не вздовж +Z, додай тут офсет:
    // const targetAngle = Math.atan2(lookDir.x, lookDir.z) + Math.PI;
    const targetAngle = Math.atan2(lookDir.x, lookDir.z);
    const currentAngle = groupRef.current.rotation.y;

    const t = 1 - Math.exp(-turnSpeed * delta);
    groupRef.current.rotation.y = lerpAngle(currentAngle, targetAngle, t);
  });

  return (
    <group ref={groupRef}>
      <primitive object={clonedScene} />
    </group>
  );
}

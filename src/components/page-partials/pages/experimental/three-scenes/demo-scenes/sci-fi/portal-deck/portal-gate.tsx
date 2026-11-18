import { useFrame } from "@react-three/fiber";
import { CuboidCollider, RapierRigidBody, RigidBody } from "@react-three/rapier";
import { RefObject, useRef } from "react";
import { Group, MeshBasicMaterial, MeshStandardMaterial } from "three";
import { usePlayerPositionStore } from "../../../character-controller/physics-world/usePlayerPositionStore";
import { usePauseStore } from "@/components/common/game-controller/store/usePauseMode";

/** Split gate with separate kinematic panels; no React state updates per frame. */
export function PortalGate({ z, forceOpenRef, metal, glow, autoOpen = true }: {
  autoOpen?: boolean; z: number; forceOpenRef: RefObject<boolean>; metal: MeshStandardMaterial; glow: MeshBasicMaterial;
}) {
  const left = useRef<RapierRigidBody>(null);
  const right = useRef<RapierRigidBody>(null);
  const root = useRef<Group>(null);
  const progress = useRef(0);
  useFrame((_, delta) => {
    const player = usePlayerPositionStore.getState().position;
    const near = autoOpen && !usePauseStore.getState().isPaused && player && Math.abs(player.z - z) < 4 && Math.abs(player.x) < 3;
    const target = forceOpenRef.current || near ? 1 : 0;
    progress.current += (target - progress.current) * (1 - Math.exp(-Math.min(delta, 0.1) * 5));
    const x = 0.95 + progress.current * 2;
    left.current?.setNextKinematicTranslation({ x: -x, y: 1.85, z });
    right.current?.setNextKinematicTranslation({ x, y: 1.85, z });
  });
  return (
    <group ref={root}>
      {[-1, 1].map((side) => (
        <RigidBody key={side} ref={side < 0 ? left : right} type="kinematicPosition" colliders={false} position={[side * 0.95, 1.85, z]}>
          <CuboidCollider args={[0.94, 1.8, 0.15]} friction={0} restitution={0} />
          <mesh material={metal} userData={{ camIncludeCollision: true }}><boxGeometry args={[1.88, 3.6, 0.3]} /></mesh>
          <mesh material={glow} position={[-side * 0.8, 0, -0.16]}><boxGeometry args={[0.025, 3.1, 0.02]} /></mesh>
          <mesh material={glow} position={[-side * 0.8, 0, 0.16]}><boxGeometry args={[0.025, 3.1, 0.02]} /></mesh>
        </RigidBody>
      ))}
      {[-2.12, 2.12].map((x) => <mesh key={x} material={metal} position={[x, 2, z]}><boxGeometry args={[0.28, 4, 0.55]} /></mesh>)}
      <mesh material={metal} position={[0, 3.98, z]}><boxGeometry args={[4.5, 0.3, 0.55]} /></mesh>
      <mesh material={glow} position={[0, 3.81, z]}><boxGeometry args={[3.8, 0.035, 0.6]} /></mesh>
    </group>
  );
}

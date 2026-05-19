import { RefObject, useMemo, useRef } from "react";
import {
  CuboidCollider,
  interactionGroups,
  RapierRigidBody,
  RigidBody,
} from "@react-three/rapier";
import { Group, Quaternion, Vector3 } from "three";
import { useFrame } from "@react-three/fiber";

type WeaponSensorProps = {
  enabled?: boolean;
  weaponAttachmentRef: RefObject<Group | null>;
  position: [number, number, number];
  size: [number, number, number];
  collisionGroups: number[];
};

export function WeaponSensor({
  enabled = true,
  weaponAttachmentRef,
  position,
  size,
  collisionGroups,
}: WeaponSensorProps) {
  const weaponSensorRef = useRef<RapierRigidBody>(null);

  const wPos = useMemo(() => new Vector3(), []);
  const wQuat = useMemo(() => new Quaternion(), []);

  const weaponUserData = useMemo(
    () =>
      ({
        type: "player-weapon",
        name: "sword",
        damage: 10,
      }) as const,
    [],
  );

  useFrame(() => {
    if (!enabled) return;

    const wa = weaponAttachmentRef.current;
    const ws = weaponSensorRef.current;

    if (!wa || !ws) return;

    wa.getWorldPosition(wPos);
    wa.getWorldQuaternion(wQuat);

    ws.setNextKinematicTranslation(wPos);
    ws.setNextKinematicRotation(wQuat);
  });

  if (!enabled) return null;

  return (
    <RigidBody
      ref={weaponSensorRef}
      type="kinematicPosition"
      colliders={false}
      gravityScale={0}
      userData={weaponUserData}
    >
      <CuboidCollider
        position={position}
        sensor
        collisionGroups={interactionGroups(3, collisionGroups)}
        args={size}
      />
    </RigidBody>
  );
}

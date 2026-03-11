import { useFrame } from "@react-three/fiber";
import { BallCollider, RigidBody, RapierRigidBody } from "@react-three/rapier";
import { useRef } from "react";
import { usePlayerPositionStore } from "../../usePlayerPositionStore";

type Props = {
  radius?: number;
  yOffset?: number;
};

export default function PlayerAttackSensor({
  radius = 0.7,
  yOffset = 0.8,
}: Props) {
  const sensorRef = useRef<RapierRigidBody>(null);
  const playerPosition = usePlayerPositionStore((s) => s.position);

  useFrame(() => {
    if (!sensorRef.current || !playerPosition) return;

    sensorRef.current.setTranslation(
      {
        x: playerPosition.x,
        y: playerPosition.y + yOffset,
        z: playerPosition.z,
      },
      true,
    );
  });

  return (
    <RigidBody
      ref={sensorRef}
      type="kinematicPosition"
      colliders={false}
      userData={{ type: "player-attack-sensor", camExcludeCollision: true }}
    >
      <BallCollider sensor args={[radius]} />
    </RigidBody>
  );
}

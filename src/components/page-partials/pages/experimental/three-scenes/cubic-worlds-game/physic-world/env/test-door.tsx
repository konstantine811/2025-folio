import {
  CuboidCollider,
  RigidBody,
  useRevoluteJoint,
  RapierRigidBody,
} from "@react-three/rapier";
import { useEffect, useRef } from "react";

const TestDoor = () => {
  const frameRef = useRef<RapierRigidBody>(null!); // нерухома рама
  const doorRef = useRef<RapierRigidBody>(null!); // динамічні двері

  // Створюємо шарнір (hinge): anchors і axes у ЛОКАЛЬНИХ системах кожного тіла
  const joint = useRevoluteJoint(frameRef, doorRef, [
    [0, 0, 0],
    [-0.5, 0, 0],
    [0, 1, 0],
  ]);
  useEffect(() => {
    // обмежуємо кут: -180° .. 0°
    joint.current?.setLimits(-Math.PI, 0);
  }, [joint]);
  return (
    <>
      {/* Рама/якір для петлі (невидимий) */}
      <RigidBody
        ref={frameRef}
        type="fixed"
        colliders={false}
        position={[-0.5, 1, 0]}
      />

      {/* Двері */}
      <RigidBody ref={doorRef} colliders={false} position={[0, 1, 0]}>
        {/* Коллайдер під розмір полотна 1 x 2 x 0.1 */}
        <CuboidCollider args={[0.5, 1, 0.05]} />
        <mesh castShadow>
          <boxGeometry args={[1, 2, 0.1]} />
          <meshStandardMaterial color="#8b5a2b" />
        </mesh>
      </RigidBody>
    </>
  );
};

export default TestDoor;

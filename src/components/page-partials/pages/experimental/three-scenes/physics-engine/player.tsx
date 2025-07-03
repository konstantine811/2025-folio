import { useKeyboardControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { RapierRigidBody, RigidBody } from "@react-three/rapier";
import { Controls } from "../config/keyboard-controls";
import { useRef } from "react";
import { Vector3 } from "three";

const MOVEMENT_SPEED = 5;
const JUMP_FORCE = 8;

export const Player = () => {
  const rb = useRef<RapierRigidBody>(null);
  const [, get] = useKeyboardControls();
  const vel = new Vector3();
  const inTheAir = useRef(false);
  useFrame(() => {
    if (!rb.current) return;
    const curVel = rb.current.linvel();
    vel.set(0, 0, 0);
    if (get()[Controls.forward]) {
      vel.z -= MOVEMENT_SPEED;
    }
    if (get()[Controls.backward]) {
      vel.z += MOVEMENT_SPEED;
    }
    if (get()[Controls.left]) {
      vel.x -= MOVEMENT_SPEED;
    }
    if (get()[Controls.right]) {
      vel.x += MOVEMENT_SPEED;
    }
    if (get()[Controls.jump] && !inTheAir.current) {
      vel.y += JUMP_FORCE;
      inTheAir.current = true; // Set in the air when jumping
    } else {
      vel.y = curVel.y; // Maintain current vertical velocity if not jumping
    }
    rb.current.setLinvel(vel, true);
  });
  return (
    <RigidBody
      ref={rb}
      lockRotations
      onCollisionEnter={(other) => {
        if (other.rigidBodyObject?.name === "ground") {
          inTheAir.current = false; // Reset in the air state when touching the ground
        }
      }}
      gravityScale={2.5}
    >
      <mesh position-y={0.5} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="hotpink" />
      </mesh>
    </RigidBody>
  );
};

import { PerspectiveCamera, useKeyboardControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import {
  euler,
  quat,
  RapierRigidBody,
  RigidBody,
  vec3,
} from "@react-three/rapier";
import { Controls } from "../config/keyboard-controls";
import { useEffect, useRef } from "react";
import { PerspectiveCamera as ThreePerspectiveCamera, Vector3 } from "three";

const MOVEMENT_SPEED = 5;
const JUMP_FORCE = 8;
const ROTATION_SPEED = 5;

export const Player = () => {
  const rb = useRef<RapierRigidBody>(null);
  const camera = useRef<ThreePerspectiveCamera>(null);
  const cameraTarget = useRef<Vector3>(new Vector3(0, 0, 0));
  const [, get] = useKeyboardControls();
  const vel = new Vector3();
  const inTheAir = useRef(false);
  const punched = useRef(false);
  const scene = useThree((state) => state.scene);

  const respawn = () => {
    if (rb.current) {
      rb.current.setTranslation({ x: 0, y: 5, z: 0 }, true);
    }
  };

  const teleport = () => {
    if (rb.current) {
      const gateOut = scene.getObjectByName("gateLargeWide_teamYellow");
      if (gateOut) {
        rb.current.setTranslation(gateOut?.position, true);
      }
    }
  };

  useEffect(() => {
    if (rb.current) {
      rb.current.setEnabledRotations(false, true, false, true); // ❗️ Дозволити тільки Y
    }
  }, []);
  useFrame(() => {
    if (!rb.current) return;

    cameraTarget.current.lerp(vec3(rb.current.translation()), 0.5);
    if (camera.current) {
      camera.current.lookAt(cameraTarget.current);
    }
    const rotVel = {
      x: 0,
      y: 0,
      z: 0,
    };
    const curVel = rb.current.linvel();
    vel.set(0, 0, 0);
    if (get()[Controls.forward]) {
      vel.z -= MOVEMENT_SPEED;
    }
    if (get()[Controls.backward]) {
      vel.z += MOVEMENT_SPEED;
    }
    if (get()[Controls.left]) {
      rotVel.y += ROTATION_SPEED;
    }
    if (get()[Controls.right]) {
      rotVel.y -= ROTATION_SPEED;
    }
    rb.current.setAngvel(rotVel, true);
    // apply rotation to x and z to go in the right direction
    const eulerRot = euler().setFromQuaternion(quat(rb.current.rotation()));
    vel.applyEuler(eulerRot);

    if (get()[Controls.jump] && !inTheAir.current) {
      vel.y += JUMP_FORCE;
      inTheAir.current = true; // Set in the air when jumping
    } else {
      vel.y = curVel.y; // Maintain current vertical velocity if not jumping
    }
    if (!punched.current) {
      rb.current.setLinvel(vel, true);
    }
  });
  return (
    <RigidBody
      ref={rb}
      angularDamping={5}
      onCollisionEnter={(other) => {
        const rigidBodyObject = other.rigidBodyObject;
        if (rigidBodyObject) {
          if (rigidBodyObject.name === "ground") {
            inTheAir.current = false; // Reset in the air state when touching the ground
          }
          if (rigidBodyObject.name === "swiper") {
            punched.current = true;
            setTimeout(() => {
              punched.current = false;
            }, 200);
          }
        }
      }}
      onIntersectionEnter={(other) => {
        const rigidBodyObject = other.rigidBodyObject;
        if (rigidBodyObject) {
          if (rigidBodyObject.name === "space") {
            respawn();
          }
          if (rigidBodyObject.name === "gateIn") {
            teleport();
          }
        }
      }}
      gravityScale={2.5}
    >
      <PerspectiveCamera makeDefault position={[0, 5, 8]} ref={camera} />
      <mesh position-y={0.5} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="hotpink" />
      </mesh>
    </RigidBody>
  );
};

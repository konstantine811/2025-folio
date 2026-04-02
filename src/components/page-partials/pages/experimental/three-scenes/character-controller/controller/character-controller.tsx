import {
  CapsuleCollider,
  CuboidCollider,
  interactionGroups,
  RapierRigidBody,
  RigidBody,
  useRapier,
} from "@react-three/rapier";
import { CharacterAnimations } from "../models/character-controller.model";
import CharacterModel from "./character-model";
import useFollowCamera from "@/components/common/hooks/camera/useFollowCamera";
import { useMemo, useRef, useState } from "react";
import { Group, MathUtils, Quaternion, Vector3 } from "three";
import { useControlStore } from "@/components/common/game-controller/store/control-game-store";
import { useFrame } from "@react-three/fiber";
import {
  createFallForce,
  createJumpImpulse,
  createMovementVelocity,
} from "../utils/physics";
import { getPivotMovingDirection } from "@/utils/game.utils";
import { usePlayerPositionStore } from "../physics-world/usePlayerPositionStore";
import { Component, Entity, EntityType } from "../ecs";

export type CharacterState = {
  moveSpeed: number;
  jumpForce: number;
  airControl: number;
  isGrounded: boolean;
  velocity: { x: number; y: number; z: number };
};

const capsuleHalfHeight = 0.8;
const capsuleRadius = 0.4;

const CharacterController = ({
  modelPath,
  animationType,
}: {
  modelPath: string;
  animationType: CharacterAnimations;
}) => {
  const playerRef = useRef<EntityType>(null!);
  const modelRef = useRef<Group>(null);
  const setPlayerPosition = usePlayerPositionStore((s) => s.setPosition);
  const { pivot, followCam, cameraCollisionDetect } = useFollowCamera({
    disableFollowCam: false,
    camInitDis: -5,
    camMaxDis: -7,
    camMinDis: -0.7,
    camUpLimit: 1.5, // in rad
    camLowLimit: -1.3, // in rad
    camInitDir: { x: 0, y: 0 }, // in rad
    camMoveSpeed: 1,
    camZoomSpeed: 1,
    camCollisionOffset: 0.7,
    camCollisionSpeedMult: 4,
  });
  const { rapier, world } = useRapier();
  const { forward, backward, rightward, leftward, run, jump } =
    useControlStore();
  const [isSprinting, setIsSprinting] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const prevPosition = useRef(new Vector3());
  const targetRotation = useRef(0);
  const currentRotation = useRef(0);

  const [state, setState] = useState<CharacterState>({
    moveSpeed: 0,
    jumpForce: 0,
    airControl: 0,
    isGrounded: false,
    velocity: { x: 0, y: 0, z: 0 },
  });

  // Weapon attachment
  const weaponAttachmentRef = useRef<Group>(null);
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

  // Vector for camera
  const pivotPosition = useMemo(() => new Vector3(), []);
  const pivotXAxis = useMemo(() => new Vector3(1, 0, 0), []);
  const pivotYAxis = useMemo(() => new Vector3(0, 1, 0), []);
  const pivotZAxis = useMemo(() => new Vector3(0, 0, 1), []);
  const followCamPosition = useMemo(() => new Vector3(), []);

  const setAttacmentWeaponSensor = () => {
    const wa = weaponAttachmentRef.current;
    const ws = weaponSensorRef.current;
    if (!wa || !ws) return;
    wa.getWorldPosition(wPos);
    wa.getWorldQuaternion(wQuat);
    ws.setNextKinematicTranslation(wPos);
    ws.setNextKinematicRotation(wQuat);
  };

  useFrame(({ camera }, delta) => {
    setAttacmentWeaponSensor();
    if (delta > 1) delta %= 1;
    const characterRigidBody = playerRef.current.rigidBody;
    if (!characterRigidBody) return;
    // Cast multiple rays for better ground detection
    const translationStable = characterRigidBody.translation();
    setPlayerPosition({
      x: translationStable.x,
      y: translationStable.y,
      z: translationStable.z,
    });
    const currentPos = new Vector3(
      translationStable.x,
      translationStable.y,
      translationStable.z,
    );
    // Control camera
    pivotXAxis.set(1, 0, 0);
    pivotXAxis.applyQuaternion(pivot.quaternion);
    pivotZAxis.set(0, 0, 1);
    pivotZAxis.applyQuaternion(pivot.quaternion);
    pivotPosition
      .copy(currentPos)
      .addScaledVector(pivotXAxis, 0)
      .addScaledVector(pivotYAxis, capsuleHalfHeight + capsuleRadius / 2)
      .addScaledVector(pivotZAxis, 0);
    pivot.position.lerp(pivotPosition, 1 - Math.exp(-11));
    followCam.getWorldPosition(followCamPosition);
    camera.position.lerp(followCamPosition, 1 - Math.exp(-11));
    camera.lookAt(pivot.position);

    cameraCollisionDetect(delta);

    // ========== 1. GROUND DETECTION (чи стоїмо на землі) ==========
    // Що: isGrounded, closestHit / closestHitRay для ground snap.
    // Навіщо: стрибок тільки з землі, притиск до землі, різна швидкість у повітрі.
    // Як: кілька променів вниз з точок капсули; ігноруємо власний collider.
    const rayLength = 1.5; // Increased length for better detection
    const rayDir = new Vector3(0, -1, 0);

    // Cast rays for multiple points around the character capsule
    const rayOffsets = [
      { x: 0, z: 0 }, // Center
      { x: 0.3, z: 0 }, // Right
      { x: -0.3, z: 0 }, // Left
      { x: 0, z: 0.3 }, // Front
      { x: 0, z: -0.3 }, // Back
    ];

    let isGrounded = false;
    let closestHit = null;
    let closestHitRay = null;

    for (const offset of rayOffsets) {
      const ray = new rapier.Ray(
        new Vector3(
          translationStable.x + offset.x,
          translationStable.y,
          translationStable.z + offset.z,
        ),
        rayDir,
      );
      const hit = world.castRay(
        ray,
        rayLength,
        true,
        undefined,
        interactionGroups(0, [1, 2]),
        undefined,
        characterRigidBody,
      );
      if (ray) {
        closestHitRay = ray;
      }
      if (hit && (!closestHit || hit.timeOfImpact < closestHit.timeOfImpact)) {
        closestHit = hit;
        isGrounded = true;
      }
    }

    // Log ground state changes
    // if (isGrounded !== state.isGrounded) {
    //   console.log(
    //     `Ground state changed: ${isGrounded ? "Grounded" : "In Air"}`,
    //   );
    // }

    const linvel = characterRigidBody.linvel();

    // ========== 2. MOVEMENT STATE (для анімацій / UI) ==========
    // Update movement state
    const horizontalSpeed = Math.sqrt(
      linvel.x * linvel.x + linvel.z * linvel.z,
    );
    const hasMoveInput = forward || backward || leftward || rightward;
    const isActuallyMoving = horizontalSpeed > 0.5;
    setIsMoving(hasMoveInput && isActuallyMoving);
    setIsSprinting(hasMoveInput && isActuallyMoving && run);

    // ========== 3. CAMERA-RELATIVE MOVEMENT + WALL CHECK ==========
    // Що: рух у напрямку камери (W/A/S/D), поворот туди ж; біля стіни не штовхаємо в неї.
    // Навіщо: third-person керування; без wall check при dynamic body був би flicker об стіну.
    const pivotAngle = getPivotMovingDirection(
      forward,
      backward,
      leftward,
      rightward,
      pivot,
    );
    if (pivotAngle !== null) {
      const moveForce = 9 * (isGrounded ? 1 : 0.75);
      const sprintMultiplier = run ? 1 : 0.35;
      const speed = moveForce * sprintMultiplier;

      const dirX = Math.sin(pivotAngle);
      const dirZ = Math.cos(pivotAngle);

      const wallRayLength = capsuleRadius * 1.2;
      const moveRayOrigin = {
        x: translationStable.x,
        y: translationStable.y,
        z: translationStable.z,
      };
      const moveRayDir = { x: dirX, y: 0, z: dirZ };
      const moveRay = new rapier.Ray(moveRayOrigin, moveRayDir);

      const wallHit = world.castRay(
        moveRay,
        wallRayLength,
        true,
        undefined,
        interactionGroups(0, [1, 2]),
        undefined,
        characterRigidBody,
      );

      let velocity;
      if (wallHit) {
        velocity = createMovementVelocity(0, 0, 0, linvel.y);
      } else {
        velocity = createMovementVelocity(dirX, dirZ, speed, linvel.y);

        if (isGrounded) {
          const smoothing = 0.25;
          velocity.x = velocity.x * smoothing + linvel.x * (1 - smoothing);
          velocity.z = velocity.z * smoothing + linvel.z * (1 - smoothing);
        }
      }

      characterRigidBody.setLinvel(velocity, true);
      targetRotation.current = pivotAngle;
    } else {
      // різка зупинка по горизонталі
      characterRigidBody.setLinvel(
        {
          x: 0,
          y: linvel.y,
          z: 0,
        },
        true,
      );
    }

    // ========== 4. SMOOTH ROTATION (модель обличчям у бік руху) ==========
    // Smooth rotation
    if (modelRef.current) {
      currentRotation.current = MathUtils.lerp(
        currentRotation.current,
        targetRotation.current,
        0.2,
      );
      modelRef.current.rotation.y = currentRotation.current;
    }

    // ========== 5. JUMP ==========
    // Handle jumping
    if (jump && isGrounded) {
      // Reset vertical velocity before jumping
      characterRigidBody.setLinvel(
        {
          x: linvel.x,
          y: 0,
          z: linvel.z,
        },
        true,
      );

      characterRigidBody.applyImpulse(
        createJumpImpulse(2.5, { y: linvel.y }),
        true,
      );
    }

    // ========== 6. GROUND SNAP (притиск до землі по raycast) ==========
    // Ground snapping
    if (isGrounded && !jump) {
      const snapForce = createFallForce(0.5);
      characterRigidBody.applyImpulse(snapForce, true);

      if (closestHit && closestHitRay) {
        const point = closestHitRay.pointAt(closestHit.timeOfImpact);
        const targetY = point.y + 1.2; // висота персоанаж над точкою удару
        characterRigidBody.setTranslation(
          {
            x: translationStable.x,
            y: targetY,
            z: translationStable.z,
          },
          true,
        );
      }
    }

    // Store position for next frame
    if (isGrounded) {
      prevPosition.current.copy(currentPos);
    }

    setState({
      moveSpeed: 9,
      jumpForce: 2.5,
      airControl: 0.75,
      isGrounded,
      velocity: linvel,
    });
  });
  return (
    <>
      <Entity isPlayer ref={playerRef}>
        <Component name="rigidBody">
          <RigidBody
            colliders={false}
            mass={10}
            position={[0, 6, 1]}
            enabledRotations={[false, false, false]}
            lockRotations
            gravityScale={3}
            friction={0.5}
            linearDamping={1}
            angularDamping={1}
            restitution={0}
            ccd={true}
            type="dynamic"
            userData={{ camExcludeCollision: true, type: "player" }}
          >
            <CapsuleCollider
              args={[capsuleHalfHeight, capsuleRadius]}
              position={[0, 0, 0]}
            />
            <group ref={modelRef} position={[0, -1.2, 0]} scale={5.5}>
              <CharacterModel
                weaponAttachmentRef={weaponAttachmentRef}
                isMoving={isMoving}
                isSprinting={isSprinting}
                isGrounded={state.isGrounded}
                modelPath={modelPath}
                animationType={animationType}
              />
            </group>
          </RigidBody>
        </Component>
      </Entity>

      <RigidBody
        ref={weaponSensorRef}
        type="kinematicPosition"
        colliders={false}
        gravityScale={0}
        userData={weaponUserData}
      >
        <CuboidCollider
          position={[0.6, 1.05, 0.68]}
          sensor
          collisionGroups={interactionGroups(3, [2])}
          args={[0.6, 0.07, 0.07]}
        />
      </RigidBody>
    </>
  );
};

export default CharacterController;

import {
  CapsuleCollider,
  RapierRigidBody,
  RigidBody,
  useRapier,
} from "@react-three/rapier";
import { CharacterAnimations } from "../models/character-controller.model";
import CharacterModel from "./character-model";
import useFollowCamera from "@/components/common/hooks/camera/useFollowCamera";
import { useMemo, useRef, useState } from "react";
import { Group, MathUtils, Vector3 } from "three";
import { useControlStore } from "@/components/common/game-controller/store/control-game-store";
import { useFrame } from "@react-three/fiber";
import {
  createFallForce,
  createJumpImpulse,
  createMovementVelocity,
} from "../utils/physics";
import { getPivotMovingDirection } from "@/utils/game.utils";
import { usePlayerPositionStore } from "../physics-world/usePlayerPositionStore";

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
  const rigidBody = useRef<RapierRigidBody>(null);
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

  // Vector for camera
  const pivotPosition = useMemo(() => new Vector3(), []);
  const pivotXAxis = useMemo(() => new Vector3(1, 0, 0), []);
  const pivotYAxis = useMemo(() => new Vector3(0, 1, 0), []);
  const pivotZAxis = useMemo(() => new Vector3(0, 0, 1), []);
  const followCamPosition = useMemo(() => new Vector3(), []);

  useFrame(({ camera }, delta) => {
    if (delta > 1) delta %= 1;

    if (!rigidBody.current) return;
    // Cast multiple rays for better ground detection
    const translationStable = rigidBody.current.translation();
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
        undefined,
        undefined,
        rigidBody.current,
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

    const linvel = rigidBody.current.linvel();

    // ========== 2. MOVEMENT STATE (для анімацій / UI) ==========
    // Update movement state
    const horizontalSpeed = Math.sqrt(
      linvel.x * linvel.x + linvel.z * linvel.z,
    );
    setIsMoving(horizontalSpeed > 0.5);
    setIsSprinting(run && horizontalSpeed > 0.5);

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

      // Перевірка чи є стіна пере нами в напрямку руху
      const wallRayLength = capsuleRadius * 1.2; // трохи більше за радіус капсули
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
        undefined,
        undefined,
        rigidBody.current,
      );

      let velocity;
      if (wallHit) {
        // Є перешкод - не штовахти в стіну, лишити тільки Y
        velocity = createMovementVelocity(0, 0, 0, linvel.y);
      } else {
        velocity = createMovementVelocity(dirX, dirZ, speed, linvel.y);
        if (isGrounded) {
          const smoothing = 0.25;
          velocity.x = velocity.x * smoothing + linvel.x * (1 - smoothing);
          velocity.z = velocity.z * smoothing + linvel.z * (1 - smoothing);
        }
      }
      rigidBody.current.setLinvel(velocity, true);
      targetRotation.current = pivotAngle;
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
      rigidBody.current.setLinvel(
        {
          x: linvel.x,
          y: 0,
          z: linvel.z,
        },
        true,
      );

      rigidBody.current.applyImpulse(
        createJumpImpulse(2.5, { y: linvel.y }),
        true,
      );
    }

    // ========== 6. GROUND SNAP (притиск до землі по raycast) ==========
    // Ground snapping
    if (isGrounded && !jump) {
      const snapForce = createFallForce(0.5);
      rigidBody.current.applyImpulse(snapForce, true);

      if (closestHit && closestHitRay) {
        const point = closestHitRay.pointAt(closestHit.timeOfImpact);
        const targetY = point.y + 1.2; // висота персоанаж над точкою удару
        rigidBody.current.setTranslation(
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
    <RigidBody
      ref={rigidBody}
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
      userData={{ camExcludeCollision: true }}
    >
      <CapsuleCollider
        args={[capsuleHalfHeight, capsuleRadius]}
        position={[0, 0, 0]}
      />
      <group ref={modelRef} position={[0, -1.2, 0]} scale={5.5}>
        <CharacterModel
          isMoving={isMoving}
          isSprinting={isSprinting}
          isGrounded={state.isGrounded}
          modelPath={modelPath}
          animationType={animationType}
        />
      </group>
    </RigidBody>
  );
};

export default CharacterController;

import { RefObject, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { interactionGroups, useBeforePhysicsStep, useRapier } from "@react-three/rapier";
import { Group, MathUtils, Vector3 } from "three";

import useFollowCamera from "@/components/common/hooks/camera/useFollowCamera";
import { useControlStore } from "@/components/common/game-controller/store/control-game-store";
import { getPivotMovingDirection } from "@/utils/game.utils";
import {
  createFallForce,
  createJumpImpulse,
  createMovementVelocity,
} from "@/components/common/game-controller/utils/physics";
import { usePlayerPositionStore } from "@/components/page-partials/pages/experimental/three-scenes/character-controller/physics-world/usePlayerPositionStore";
import { CharacterControllerState } from "./store/character-controller-store";
import { EntityType } from "./ecs";

/**
 * Grounded move blend rate. Tuned so at 60 FPS ≈ old fixed `smoothing = 0.25`:
 * `1 - Math.exp(-MOVE_SMOOTH_RATE / 60) ≈ 0.25`.
 * At lower FPS each frame blends harder toward target speed (FPS-independent feel).
 */
const MOVE_SMOOTH_RATE = -60 * Math.log(0.75);

type UseCharacterControllerPhysicsParams = {
  playerRef: RefObject<EntityType | null>;
  modelRef: RefObject<Group | null>;

  capsuleHalfHeight: number;
  capsuleRadius: number;

  /** Rapier collision group membership for ground/wall raycasts. Default: 0 */
  raycastMembershipGroup?: number;
  /** Rapier groups ground/wall rays may hit. Default: [1, 2] */
  raycastFilterGroups?: readonly number[];

  /** Initial visual Y rotation for modelRef (radians). Default: 0 */
  startModelRotationY?: number;

  /**
   * Treat character as grounded for this many physics frames after mount.
   * Avoids FallingIdle flash and ground-snap jitter on Play.
   */
  spawnGroundGraceFrames?: number;

  /** When false, pivot still tracks the player but camera is driven externally. */
  manageCamera?: boolean;

  moveSpeed?: number;
  jumpForce?: number;
  jumpStartDelay?: number;
  movingJumpStartDelay?: number;
  airControl?: number;
};

export function useCharacterControllerPhysics({
  playerRef,
  modelRef,
  capsuleHalfHeight,
  capsuleRadius,
  raycastMembershipGroup = 0,
  raycastFilterGroups = [1, 2],
  startModelRotationY = 0,
  spawnGroundGraceFrames = 20,
  manageCamera = true,
  moveSpeed = 9,
  jumpForce = 2.5,
  jumpStartDelay = 0,
  movingJumpStartDelay = jumpStartDelay,
  airControl = 0.75,
}: UseCharacterControllerPhysicsParams) {
  const setPlayerPosition = usePlayerPositionStore((s) => s.setPosition);

  const { rapier, world } = useRapier();

  const { forward, backward, rightward, leftward, run, jump } =
    useControlStore();

  const { pivot, followCam, cameraCollisionDetect } = useFollowCamera({
    disableFollowCam: false,
    camInitDis: -5,
    camMaxDis: -7,
    camMinDis: -0.7,
    camUpLimit: 1.5,
    camLowLimit: -1.3,
    camInitDir: { x: 0, y: startModelRotationY },
    camMoveSpeed: 1,
    camZoomSpeed: 1,
    camCollisionOffset: 0.7,
    camCollisionMinDis: -0.15,
    camCollisionSpeedMult: 4,
  });

  const [controllerState, setControllerState] =
    useState<CharacterControllerState>({
      moveSpeed: 0,
      jumpForce: 0,
      airControl: 0,
      isGrounded: true,
      isJumpPreparing: false,
      isMovingJump: false,
      isMoving: false,
      isSprinting: false,
      velocity: { x: 0, y: 0, z: 0 },
    });

  const spawnFrameRef = useRef(0);
  const jumpHeldRef = useRef(false);
  const movingJumpRef = useRef(false);
  const jumpPreparationRef = useRef<number | null>(null);
  const targetRotation = useRef(startModelRotationY);
  const currentRotation = useRef(startModelRotationY);

  const pivotPosition = useMemo(() => new Vector3(), []);
  const pivotXAxis = useMemo(() => new Vector3(1, 0, 0), []);
  const pivotYAxis = useMemo(() => new Vector3(0, 1, 0), []);
  const pivotZAxis = useMemo(() => new Vector3(0, 0, 1), []);
  const followCamPosition = useMemo(() => new Vector3(), []);
  const raycastFilter = useMemo(
    () => interactionGroups(raycastMembershipGroup, [...raycastFilterGroups]),
    [raycastMembershipGroup, raycastFilterGroups],
  );

  useFrame(({ camera }, delta) => {
    if (delta > 1) delta %= 1;
    const characterRigidBody = playerRef.current?.rigidBody;
    if (!characterRigidBody) return;

    const translationStable = characterRigidBody.translation();

    // Follow the interpolated render transform, not the 60 Hz physics pose.
    const currentPos = modelRef.current?.parent
      ? modelRef.current.parent.getWorldPosition(pivotPosition)
      : pivotPosition.set(translationStable.x, translationStable.y, translationStable.z);

    /**
     * Camera follow
     */
    pivotXAxis.set(1, 0, 0);
    pivotXAxis.applyQuaternion(pivot.quaternion);

    pivotZAxis.set(0, 0, 1);
    pivotZAxis.applyQuaternion(pivot.quaternion);

    pivotPosition
      .copy(currentPos)
      .addScaledVector(pivotXAxis, 0)
      .addScaledVector(pivotYAxis, capsuleHalfHeight + capsuleRadius / 2)
      .addScaledVector(pivotZAxis, 0);

    pivot.position.lerp(pivotPosition, 1 - Math.exp(-11 * delta));

    if (manageCamera) {
      followCam.getWorldPosition(followCamPosition);

      camera.position.lerp(followCamPosition, 1 - Math.exp(-11 * delta));
      camera.lookAt(pivot.position);
    }

    cameraCollisionDetect(delta);

  });

  useBeforePhysicsStep(() => {
    const characterRigidBody = playerRef.current?.rigidBody;
    if (!characterRigidBody) return;
    const delta = world.timestep;
    const translationStable = characterRigidBody.translation();
    setPlayerPosition(translationStable);

    /**
     * Ground detection
     */
    const rayLength = 1.5;
    const rayDir = new Vector3(0, -1, 0);

    const rayOffsets = [
      { x: 0, z: 0 },
      { x: 0.3, z: 0 },
      { x: -0.3, z: 0 },
      { x: 0, z: 0.3 },
      { x: 0, z: -0.3 },
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
        raycastFilter,
        undefined,
        characterRigidBody,
      );

      if (hit && (!closestHit || hit.timeOfImpact < closestHit.timeOfImpact)) {
        closestHit = hit;
        closestHitRay = ray;
        isGrounded = true;
      }
    }

    let linvel = characterRigidBody.linvel();

    const inSpawnGrace = spawnFrameRef.current < spawnGroundGraceFrames;
    spawnFrameRef.current += 1;

    const isGroundedStable = isGrounded || inSpawnGrace;

    if (inSpawnGrace && Math.abs(linvel.y) > 0.02) {
      characterRigidBody.setLinvel({ x: linvel.x, y: 0, z: linvel.z }, true);
      linvel = characterRigidBody.linvel();
    }

    /**
     * Movement state
     */
    const horizontalSpeed = Math.sqrt(
      linvel.x * linvel.x + linvel.z * linvel.z,
    );

    const hasMoveInput = forward || backward || leftward || rightward;
    const isActuallyMoving = horizontalSpeed > 0.5;
    const isMoving =
      hasMoveInput && (isGroundedStable || isActuallyMoving) && !inSpawnGrace;
    const isSprinting = isMoving && run;

    /**
     * Camera-relative movement
     */
    const pivotAngle = getPivotMovingDirection(
      forward,
      backward,
      leftward,
      rightward,
      pivot,
    );

    if (pivotAngle !== null) {
      const moveForce = moveSpeed * (isGroundedStable ? 1 : airControl);
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
        raycastFilter,
        undefined,
        characterRigidBody,
      );

      let velocity;

      if (wallHit) {
        velocity = createMovementVelocity(0, 0, 0, linvel.y);
      } else {
        velocity = createMovementVelocity(dirX, dirZ, speed, linvel.y);

        if (isGroundedStable) {
          // Cap so a single hitch (~<20 FPS frame) doesn't snap velocity.
          const step = Math.min(delta, 1 / 20);
          const smoothing = 1 - Math.exp(-MOVE_SMOOTH_RATE * step);

          velocity.x = velocity.x * smoothing + linvel.x * (1 - smoothing);
          velocity.z = velocity.z * smoothing + linvel.z * (1 - smoothing);
        }
      }

      characterRigidBody.setLinvel(velocity, true);
      targetRotation.current = pivotAngle;
    } else {
      characterRigidBody.setLinvel(
        {
          x: 0,
          y: linvel.y,
          z: 0,
        },
        true,
      );
    }

    /**
     * Smooth model rotation
     */
    if (modelRef.current) {
      currentRotation.current = MathUtils.lerp(
        currentRotation.current,
        targetRotation.current,
        0.2,
      );

      modelRef.current.rotation.y = currentRotation.current;
    }

    /**
     * Jump
     */
    if (isGroundedStable && linvel.y <= 0.2 && jumpPreparationRef.current === null) {
      movingJumpRef.current = false;
    }
    const jumpPressed = jump && !jumpHeldRef.current;
    jumpHeldRef.current = jump;
    if (jumpPreparationRef.current !== null) {
      // Leaving a ledge during anticipation cancels the queued jump.
      jumpPreparationRef.current = isGroundedStable
        ? Math.max(0, jumpPreparationRef.current - delta)
        : null;
    } else if (jumpPressed && isGroundedStable && !inSpawnGrace && linvel.y <= 0.2) {
      // Latch the takeoff mode; releasing movement midair must not start a crouch.
      movingJumpRef.current = isMoving;
      jumpPreparationRef.current = Math.max(0, isMoving ? movingJumpStartDelay : jumpStartDelay);
    }

    if (jumpPreparationRef.current !== null && jumpPreparationRef.current <= 1e-6) {
      jumpPreparationRef.current = null;
      characterRigidBody.setLinvel({ x: linvel.x, y: 0, z: linvel.z }, true);
      characterRigidBody.applyImpulse(
        createJumpImpulse(jumpForce, { y: linvel.y }),
        true,
      );
      // Publish takeoff in the same step so the jump clip continues uninterrupted.
      linvel = characterRigidBody.linvel();
    }

    /**
     * Ground snap
     */
    if (isGroundedStable && !jump && !inSpawnGrace && linvel.y <= 0) {
      const snapForce = createFallForce(0.5);
      characterRigidBody.applyImpulse(snapForce, true);

      if (closestHit && closestHitRay) {
        const point = closestHitRay.pointAt(closestHit.timeOfImpact);
        const targetY = point.y + capsuleHalfHeight + capsuleRadius;

        // Let contacts hold the capsule on the ground. Teleporting every frame
        // invalidates interpolation; only snap a small downward gap on descent.
        const gap = translationStable.y - targetY;
        if (gap > 0.02 && gap < 0.3) {
          characterRigidBody.setTranslation(
            { x: translationStable.x, y: targetY, z: translationStable.z },
            true,
          );
        }
      }
    }

    setControllerState({
      moveSpeed,
      jumpForce,
      airControl,
      isGrounded: isGroundedStable && linvel.y <= 0.2,
      isJumpPreparing: jumpPreparationRef.current !== null,
      isMovingJump: movingJumpRef.current,
      isMoving,
      isSprinting,
      velocity: linvel,
    });
  });

  return {
    controllerState,
  };
}

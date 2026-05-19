import { RefObject, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { interactionGroups, useRapier } from "@react-three/rapier";
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

type UseCharacterControllerPhysicsParams = {
  playerRef: RefObject<EntityType | null>;
  modelRef: RefObject<Group | null>;

  capsuleHalfHeight: number;
  capsuleRadius: number;
};

export function useCharacterControllerPhysics({
  playerRef,
  modelRef,
  capsuleHalfHeight,
  capsuleRadius,
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
    camInitDir: { x: 0, y: 0 },
    camMoveSpeed: 1,
    camZoomSpeed: 1,
    camCollisionOffset: 0.7,
    camCollisionSpeedMult: 4,
  });

  const [controllerState, setControllerState] =
    useState<CharacterControllerState>({
      moveSpeed: 0,
      jumpForce: 0,
      airControl: 0,
      isGrounded: false,
      isMoving: false,
      isSprinting: false,
      velocity: { x: 0, y: 0, z: 0 },
    });

  const prevPosition = useRef(new Vector3());
  const targetRotation = useRef(0);
  const currentRotation = useRef(0);

  const pivotPosition = useMemo(() => new Vector3(), []);
  const pivotXAxis = useMemo(() => new Vector3(1, 0, 0), []);
  const pivotYAxis = useMemo(() => new Vector3(0, 1, 0), []);
  const pivotZAxis = useMemo(() => new Vector3(0, 0, 1), []);
  const followCamPosition = useMemo(() => new Vector3(), []);

  useFrame(({ camera }, delta) => {
    if (delta > 1) delta %= 1;
    const characterRigidBody = playerRef.current?.rigidBody;
    if (!characterRigidBody) return;

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

    pivot.position.lerp(pivotPosition, 1 - Math.exp(-11));

    followCam.getWorldPosition(followCamPosition);

    camera.position.lerp(followCamPosition, 1 - Math.exp(-11));
    camera.lookAt(pivot.position);

    cameraCollisionDetect(delta);

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
        interactionGroups(0, [1, 2]),
        undefined,
        characterRigidBody,
      );

      closestHitRay = ray;

      if (hit && (!closestHit || hit.timeOfImpact < closestHit.timeOfImpact)) {
        closestHit = hit;
        isGrounded = true;
      }
    }

    const linvel = characterRigidBody.linvel();

    /**
     * Movement state
     */
    const horizontalSpeed = Math.sqrt(
      linvel.x * linvel.x + linvel.z * linvel.z,
    );

    const hasMoveInput = forward || backward || leftward || rightward;
    const isActuallyMoving = horizontalSpeed > 0.5;
    const isMoving = hasMoveInput && isActuallyMoving;
    const isSprinting = hasMoveInput && isActuallyMoving && run;

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
    if (jump && isGrounded) {
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

    /**
     * Ground snap
     */
    if (isGrounded && !jump) {
      const snapForce = createFallForce(0.5);
      characterRigidBody.applyImpulse(snapForce, true);

      if (closestHit && closestHitRay) {
        const point = closestHitRay.pointAt(closestHit.timeOfImpact);
        const targetY = point.y + 1.2;

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

    if (isGrounded) {
      prevPosition.current.copy(currentPos);
    }

    setControllerState({
      moveSpeed: 9,
      jumpForce: 2.5,
      airControl: 0.75,
      isGrounded,
      isMoving,
      isSprinting,
      velocity: linvel,
    });
  });

  return {
    controllerState,
  };
}

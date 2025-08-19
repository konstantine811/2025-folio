import { RapierRigidBody } from "@react-three/rapier";
import { Euler, Object3D, Vector3 } from "three";

export interface MoveCharacterProps {
  run: boolean;
  slopeAngle: number;
  movingObjectVelocity: Vector3;
  character: RapierRigidBody | null;
  actualSlopeAngle: number;
  slopeMaxAngle: number;
  movingDirection: Vector3;
  characterModelIndicator: Object3D;
  movingObjectVelocityInCharacterDir: Vector3;
  currentVel: Vector3;
  wantToMoveVel: Vector3;
  rejectVel: Vector3;
  moveAccNeeded: Vector3;
  maxVelLimit: number;
  sprintMult: number;
  isOnMovingObject: boolean;
  rejectVelMult: number;
  accDeltaTime: number;
  characterRotated: boolean;
  modelEuler: Euler;
  moveImpulse: Vector3;
  turnVelMultiplier: number;
  canJump: boolean;
  airDragMultiplier: number;
  slopeUpExtraForce: number;
  slopeDownExtraForce: number;
  currentPos: Vector3;
  moveImpulsePointY: number;
}

export const moveCharacter = ({
  run,
  slopeAngle,
  movingObjectVelocity,
  character,
  actualSlopeAngle,
  slopeMaxAngle,
  movingDirection,
  characterModelIndicator,
  movingObjectVelocityInCharacterDir,
  currentVel,
  wantToMoveVel,
  rejectVel,
  moveAccNeeded,
  maxVelLimit,
  sprintMult,
  isOnMovingObject,
  rejectVelMult,
  accDeltaTime,
  characterRotated,
  modelEuler,
  moveImpulse,
  turnVelMultiplier,
  canJump,
  airDragMultiplier,
  slopeUpExtraForce,
  slopeDownExtraForce,
  currentPos,
  moveImpulsePointY,
}: MoveCharacterProps) => {
  if (!character) return;

  /**
   * Setup moving direction
   */
  // Only apply slope angle to moving direction
  // when slope angle is between 0.2rad and slopeMaxAngle,
  // and actualSlopeAngle < slopeMaxAngle
  if (
    actualSlopeAngle < slopeMaxAngle &&
    Math.abs(slopeAngle) > 0.2 &&
    Math.abs(slopeAngle) < slopeMaxAngle
  ) {
    movingDirection.set(0, Math.sin(slopeAngle), Math.cos(slopeAngle));
  }
  // If on a slopeMaxAngle slope, only apply small a mount of forward direction
  else if (actualSlopeAngle >= slopeMaxAngle) {
    movingDirection.set(
      0,
      Math.sin(slopeAngle) > 0 ? 0 : Math.sin(slopeAngle),
      Math.sin(slopeAngle) > 0 ? 0.1 : 1
    );
  } else {
    movingDirection.set(0, 0, 1);
  }

  // Apply character quaternion to moving direction
  movingDirection.applyQuaternion(characterModelIndicator.quaternion);

  /**
   * Moving object conditions
   */
  // Calculate moving object velocity direction according to character moving direction
  movingObjectVelocityInCharacterDir
    .copy(movingObjectVelocity)
    .projectOnVector(movingDirection)
    .multiply(movingDirection);
  // Calculate angle between moving object velocity direction and character moving direction
  const angleBetweenCharacterDirAndObjectDir =
    movingObjectVelocity.angleTo(movingDirection);

  /**
   * Setup rejection velocity, (currently only work on ground)
   */
  const wantToMoveMeg = currentVel.dot(movingDirection);
  wantToMoveVel.set(
    movingDirection.x * wantToMoveMeg,
    0,
    movingDirection.z * wantToMoveMeg
  );
  rejectVel.copy(currentVel).sub(wantToMoveVel);

  /**
   * Calculate required accelaration and force: a = Δv/Δt
   * If it's on a moving/rotating platform, apply platform velocity to Δv accordingly
   * Also, apply reject velocity when character is moving opposite of it's moving direction
   */
  moveAccNeeded.set(
    (movingDirection.x *
      (maxVelLimit * (run ? sprintMult : 1) +
        movingObjectVelocityInCharacterDir.x) -
      (currentVel.x -
        movingObjectVelocity.x *
          Math.sin(angleBetweenCharacterDirAndObjectDir) +
        rejectVel.x * (isOnMovingObject ? 0 : rejectVelMult))) /
      accDeltaTime,
    0,
    (movingDirection.z *
      (maxVelLimit * (run ? sprintMult : 1) +
        movingObjectVelocityInCharacterDir.z) -
      (currentVel.z -
        movingObjectVelocity.z *
          Math.sin(angleBetweenCharacterDirAndObjectDir) +
        rejectVel.z * (isOnMovingObject ? 0 : rejectVelMult))) /
      accDeltaTime
  );

  // Wanted to move force function: F = ma
  const moveForceNeeded = moveAccNeeded.multiplyScalar(character.mass());

  /**
   * Check if character complete turned to the wanted direction
   */
  characterRotated =
    Math.sin(characterModelIndicator.rotation.y).toFixed(3) ==
    Math.sin(modelEuler.y).toFixed(3);

  // If character hasn't complete turning, change the impulse quaternion follow characterModelIndicator quaternion
  if (!characterRotated) {
    moveImpulse.set(
      moveForceNeeded.x * turnVelMultiplier * (canJump ? 1 : airDragMultiplier), // if it's in the air, give it less control
      slopeAngle === null || slopeAngle == 0 // if it's on a slope, apply extra up/down force to the body
        ? 0
        : movingDirection.y *
            turnVelMultiplier *
            (movingDirection.y > 0 // check it is on slope up or slope down
              ? slopeUpExtraForce
              : slopeDownExtraForce) *
            (run ? sprintMult : 1),
      moveForceNeeded.z * turnVelMultiplier * (canJump ? 1 : airDragMultiplier) // if it's in the air, give it less control
    );
  }
  // If character complete turning, change the impulse quaternion default
  else {
    moveImpulse.set(
      moveForceNeeded.x * (canJump ? 1 : airDragMultiplier),
      slopeAngle === null || slopeAngle == 0 // if it's on a slope, apply extra up/down force to the body
        ? 0
        : movingDirection.y *
            (movingDirection.y > 0 // check it is on slope up or slope down
              ? slopeUpExtraForce
              : slopeDownExtraForce) *
            (run ? sprintMult : 1),
      moveForceNeeded.z * (canJump ? 1 : airDragMultiplier)
    );
  }

  // Move character at proper direction and impulse
  character.applyImpulseAtPoint(
    moveImpulse,
    {
      x: currentPos.x,
      y: currentPos.y + moveImpulsePointY,
      z: currentPos.z,
    },
    true
  );
};

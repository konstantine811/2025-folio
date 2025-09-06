import { MathUtils, Object3D, Vector3 } from "three";
import { moveCharacter, MoveCharacterProps } from "./moveCharacter";
import { RapierRigidBody } from "@react-three/rapier";

/**
 * Point-to-move function
 */

export interface PointToMoveProps extends MoveCharacterProps {
  moveToPoint: Vector3 | null;
  slopeAngle: number;
  movingObjectVelocity: Vector3;
  functionKeyDown: boolean;
  pointToPoint: Vector3;
  crossVector: Vector3;
  vectorZ: Vector3;
  isModeFixedCamera: boolean;
  pivot: Object3D;
  fixedCamRotMult: number;
  delta: number;
  character: RapierRigidBody;
  isBodyHitWall: boolean;
  isPointMoving: boolean;
  setMoveToPoint: (v: Vector3 | null) => void;
}
export const pointToMove = ({
  moveToPoint,
  slopeAngle,
  movingObjectVelocity,
  functionKeyDown,
  pointToPoint,
  currentPos,
  crossVector,
  vectorZ,
  modelEuler,
  isModeFixedCamera,
  pivot,
  fixedCamRotMult,
  delta,
  character,
  isBodyHitWall,
  setMoveToPoint,
  run,
  actualSlopeAngle,
  slopeMaxAngle,
  maxVelLimit,
  sprintMult,
  isOnMovingObject,
  rejectVelMult,
  accDeltaTime,
  characterRotated,
  moveImpulse,
  turnVelMultiplier,
  canJump,
  airDragMultiplier,
  slopeUpExtraForce,
  slopeDownExtraForce,
  moveImpulsePointY,
  movingDirection,
  characterModelIndicator,
  movingObjectVelocityInCharacterDir,
  currentVel,
  wantToMoveVel,
  rejectVel,
  moveAccNeeded,
  isPointMoving,
}: PointToMoveProps) => {
  if (moveToPoint) {
    pointToPoint.set(
      moveToPoint.x - currentPos.x,
      0,
      moveToPoint.z - currentPos.z
    );
    crossVector.crossVectors(pointToPoint, vectorZ);
    // Rotate character to moving direction
    modelEuler.y = (crossVector.y > 0 ? -1 : 1) * pointToPoint.angleTo(vectorZ);
    // If mode is also set to fixed camera. keep the camera on the back of character
    if (isModeFixedCamera)
      pivot.rotation.y = MathUtils.lerp(
        pivot.rotation.y,
        modelEuler.y,
        fixedCamRotMult * delta * 3
      );
    // Once character close to the target point (distance<0.3),
    // Or character close to the wall (bodySensor intersects)
    // stop moving
    if (character) {
      if (pointToPoint.length() > 0.3 && !isBodyHitWall && !functionKeyDown) {
        moveCharacter({
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
        });
        isPointMoving = true;
      } else {
        setMoveToPoint(null);
        isPointMoving = false;
      }
    }
  }
  return isPointMoving;
};

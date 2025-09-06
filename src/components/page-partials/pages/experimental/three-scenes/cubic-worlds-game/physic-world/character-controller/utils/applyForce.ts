import { RayColliderHit, RigidBody } from "@dimforge/rapier3d-compat";
import { Vector3 } from "three";
export const applyFloatingForce = (
  rayHit: RayColliderHit | null,
  canJump: boolean,
  floatingForce: number | null,
  springK: number,
  floatingDis: number,
  dampingC: number,
  character: RigidBody,
  springDirVec: Vector3,
  characterMassForce: Vector3,
  standingForcePoint: Vector3
) => {
  if (rayHit != null) {
    if (canJump && rayHit.collider.parent()) {
      floatingForce =
        springK * (floatingDis - rayHit.timeOfImpact) -
        character.linvel().y * dampingC;
      character.applyImpulse(springDirVec.set(0, floatingForce, 0), false);

      // Apply opposite force to standing object (gravity g in rapier is 0.11 ?_?)
      characterMassForce.set(0, floatingForce > 0 ? -floatingForce : 0, 0);
      rayHit.collider
        .parent()
        ?.applyImpulseAtPoint(characterMassForce, standingForcePoint, true);
    }
  }
};

export const applyDragForce = (
  forward: boolean,
  backward: boolean,
  leftward: boolean,
  rightward: boolean,
  canJump: boolean,
  isPointMoving: boolean,
  isOnMovingObject: boolean,
  currentVel: Vector3,
  dragDampingC: number,
  movingObjectVelocity: Vector3,
  character: RigidBody,
  dragForce: Vector3
) => {
  /**
   * Apply drag force if it's not moving
   */
  if (
    !forward &&
    !backward &&
    !leftward &&
    !rightward &&
    canJump &&
    !isPointMoving
  ) {
    // not on a moving object
    if (!isOnMovingObject) {
      dragForce.set(
        -currentVel.x * dragDampingC,
        0,
        -currentVel.z * dragDampingC
      );
      character.applyImpulse(dragForce, false);
    }
    // on a moving object
    else {
      dragForce.set(
        (movingObjectVelocity.x - currentVel.x) * dragDampingC,
        0,
        (movingObjectVelocity.z - currentVel.z) * dragDampingC
      );
      character.applyImpulse(dragForce, true);
    }
  }
};

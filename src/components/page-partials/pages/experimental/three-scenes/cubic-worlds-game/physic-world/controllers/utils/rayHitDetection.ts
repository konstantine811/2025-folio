import {
  Collider,
  QueryFilterFlags,
  Ray,
  RayColliderHit,
  RigidBody,
  World,
} from "@dimforge/rapier3d-compat";
import { RapierRigidBody } from "@react-three/rapier";
import { Vector3 } from "three";
import { userDataType } from "../complex-controller";

export const rayHitMoveDetection = (
  rayHit: RayColliderHit | null,
  canJump: boolean,
  standingForcePoint: Vector3,
  rayOrigin: Vector3,
  massRatio: number,
  character: RapierRigidBody,
  isOnMovingObject: boolean,
  distanceFromCharacterToObject: Vector3,
  currentPos: Vector3,
  movingObjectVelocity: Vector3,
  objectAngvelToLinvel: Vector3,
  velocityDiff: Vector3,
  currentVel: Vector3,
  movingObjectDragForce: Vector3,
  bodyContactForce: Vector3,
  moveImpulse: Vector3,
  delta: number,
  forward: boolean,
  backward: boolean,
  leftward: boolean,
  rightward: boolean,
  isPointMoving: boolean
) => {
  /**
   * Ray detect if on rigid body or dynamic platform, then apply the linear velocity and angular velocity to character
   */
  if (rayHit && canJump) {
    if (rayHit.collider.parent()) {
      // Getting the standing force apply point
      standingForcePoint.set(
        rayOrigin.x,
        rayOrigin.y - rayHit.timeOfImpact,
        rayOrigin.z
      );
      const rayHitObjectBodyType = rayHit.collider.parent()?.bodyType();
      const rayHitObjectBodyMass = rayHit.collider.parent()?.mass();
      if (rayHitObjectBodyMass)
        massRatio = character.mass() / rayHitObjectBodyMass;
      // Body type 0 is rigid body, body type 1 is fixed body, body type 2 is kinematic body
      if (rayHitObjectBodyType === 0 || rayHitObjectBodyType === 2) {
        isOnMovingObject = true;
        // Calculate distance between character and moving object
        distanceFromCharacterToObject
          .copy(currentPos)
          .sub(rayHit.collider.parent()?.translation() as Vector3);
        // Moving object linear velocity
        const movingObjectLinvel = rayHit.collider
          .parent()
          ?.linvel() as Vector3;
        // Moving object angular velocity
        const movingObjectAngvel = rayHit.collider
          .parent()
          ?.angvel() as Vector3;
        // Combine object linear velocity and angular velocity to movingObjectVelocity
        movingObjectVelocity
          .set(
            movingObjectLinvel.x +
              objectAngvelToLinvel.crossVectors(
                movingObjectAngvel,
                distanceFromCharacterToObject
              ).x,
            movingObjectLinvel.y,
            movingObjectLinvel.z +
              objectAngvelToLinvel.crossVectors(
                movingObjectAngvel,
                distanceFromCharacterToObject
              ).z
          )
          .multiplyScalar(Math.min(1, 1 / massRatio));
        // If the velocity diff is too high (> 30), ignore movingObjectVelocity
        velocityDiff.subVectors(movingObjectVelocity, currentVel);
        if (velocityDiff.length() > 30)
          movingObjectVelocity.multiplyScalar(1 / velocityDiff.length());

        // Apply opposite drage force to the stading rigid body, body type 0
        // Character moving and unmoving should provide different drag force to the platform
        if (rayHitObjectBodyType === 0) {
          if (
            !forward &&
            !backward &&
            !leftward &&
            !rightward &&
            canJump &&
            !isPointMoving
          ) {
            movingObjectDragForce
              .copy(bodyContactForce)
              .multiplyScalar(delta)
              .multiplyScalar(Math.min(1, 1 / massRatio)) // Scale up/down base on different masses ratio
              .negate();
            bodyContactForce.set(0, 0, 0);
          } else {
            movingObjectDragForce
              .copy(moveImpulse)
              .multiplyScalar(Math.min(1, 1 / massRatio)) // Scale up/down base on different masses ratio
              .negate();
          }
          rayHit.collider
            .parent()
            ?.applyImpulseAtPoint(
              movingObjectDragForce,
              standingForcePoint,
              true
            );
        }
      } else {
        // on fixed body
        massRatio = 1;
        isOnMovingObject = false;
        bodyContactForce.set(0, 0, 0);
        movingObjectVelocity.set(0, 0, 0);
      }
    }
  } else {
    // in the air
    massRatio = 1;
    isOnMovingObject = false;
    bodyContactForce.set(0, 0, 0);
    movingObjectVelocity.set(0, 0, 0);
  }
  return { isOnMovingObject, massRatio };
};

export const rayGroundDetection = (
  rayOrigin: Vector3,
  currentPos: Vector3,
  rayOriginOffest: Vector3,
  rayLength: number,
  world: World,
  character: RigidBody,
  rayHit: RayColliderHit | null,
  rayCast: Ray,
  floatingDis: number,
  rayHitForgiveness: number,
  slopeRayHit: RayColliderHit | null,
  actualSlopeAngle: number,
  slopeMaxAngle: number,
  canJump: boolean
) => {
  rayOrigin.addVectors(currentPos, rayOriginOffest as Vector3);
  rayHit = world.castRay(
    rayCast,
    rayLength,
    false,
    QueryFilterFlags.EXCLUDE_SENSORS,
    undefined,
    undefined,
    character,
    // this exclude any collider with userData: excludeEcctrlRay
    (collider: Collider) => {
      const parent = collider.parent();
      if (!parent) return false;
      const data = parent.userData as userDataType | undefined;
      return !data?.excludeEcctrlRay;
    }
  );

  if (rayHit && rayHit.timeOfImpact < floatingDis + rayHitForgiveness) {
    if (slopeRayHit && actualSlopeAngle < slopeMaxAngle) {
      canJump = true;
      return canJump;
    } else {
      canJump = false;
      return canJump;
    }
  } else {
    canJump = false;
    return canJump;
  }
};

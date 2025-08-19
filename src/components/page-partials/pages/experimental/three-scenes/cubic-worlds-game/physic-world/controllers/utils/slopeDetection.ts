import {
  Collider,
  QueryFilterFlags,
  Ray,
  RayColliderHit,
  Vector,
  World,
} from "@dimforge/rapier3d-compat";
import { RapierRigidBody } from "@react-three/rapier";
import { Mesh, Vector3 } from "three";
import { userDataType } from "../complex-controller";

export interface SlopeDetectionProps {
  slopeRayOrigin: Mesh | null;
  slopeRayorigin: Vector3;
  slopeRayHit: RayColliderHit | null;
  rayOrigin: Vector3;
  world: World;
  slopeRayCast: Ray;
  slopeRayLength: number;
  character: RapierRigidBody;
  actualSlopeNormal: Vector | null;
  actualSlopeNormalVec: Vector3;
  actualSlopeAngle: number;
  floorNormal: Vector3;
  rayHit: RayColliderHit | null;
  floatingDis: number;
  canJump: boolean;
  slopeAngle: number;
  slopeRayOriginOffest: number;
}

export const slopeDetection = ({
  slopeRayOrigin,
  slopeRayorigin,
  slopeRayHit,
  rayOrigin,
  world,
  slopeRayCast,
  slopeRayLength,
  character,
  actualSlopeNormal,
  actualSlopeNormalVec,
  actualSlopeAngle,
  floorNormal,
  rayHit,
  floatingDis,
  canJump,
  slopeAngle,
  slopeRayOriginOffest,
}: SlopeDetectionProps) => {
  /**
   * Slope ray casting detect if on slope
   */
  slopeRayOrigin?.getWorldPosition(slopeRayorigin);
  slopeRayorigin.y = rayOrigin.y;
  slopeRayHit = world.castRay(
    slopeRayCast,
    slopeRayLength,
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
  // Calculate slope angle
  if (slopeRayHit) {
    actualSlopeNormal =
      slopeRayHit.collider.castRayAndGetNormal(
        slopeRayCast,
        slopeRayLength,
        false
      )?.normal ?? null;
    if (actualSlopeNormal) {
      actualSlopeNormalVec?.set(
        actualSlopeNormal.x,
        actualSlopeNormal.y,
        actualSlopeNormal.z
      );
      actualSlopeAngle = actualSlopeNormalVec?.angleTo(floorNormal);
    }
  }
  if (slopeRayHit && rayHit && slopeRayHit.timeOfImpact < floatingDis + 0.5) {
    if (canJump) {
      // Round the slope angle to 2 decimal places
      slopeAngle = Number(
        Math.atan(
          (rayHit.timeOfImpact - slopeRayHit.timeOfImpact) /
            slopeRayOriginOffest
        ).toFixed(2)
      );
    } else {
      slopeAngle = 0;
    }
  } else {
    slopeAngle = 0;
  }
  return { actualSlopeAngle, slopeAngle, slopeRayHit, actualSlopeNormal };
};

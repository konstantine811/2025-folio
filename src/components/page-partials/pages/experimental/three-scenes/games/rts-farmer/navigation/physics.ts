import type { KinematicCharacterController } from "@dimforge/rapier3d-compat";
import type { RapierCollider, RapierRigidBody } from "@react-three/rapier";
import type { Point } from "./pathfinding";
import { residentTranslation } from "./world";

export function stepResidentBody(controller: KinematicCharacterController, body: RapierRigidBody, collider: RapierCollider, velocity: Point, dt: number, stationary: boolean): Point {
  const position = body.translation();
  // This level is flat and kinematic actors have no gravity. A constant downward
  // cast at the floor skin produces spurious sideways corrections during contacts.
  controller.computeColliderMovement(collider, { x: velocity.x * dt, y: 0, z: velocity.z * dt });
  const movement = controller.computedMovement();
  if (stationary) { movement.x = 0; movement.z = 0; }
  body.setNextKinematicTranslation(residentTranslation(position, movement));
  return { x: movement.x / dt, z: movement.z / dt };
}

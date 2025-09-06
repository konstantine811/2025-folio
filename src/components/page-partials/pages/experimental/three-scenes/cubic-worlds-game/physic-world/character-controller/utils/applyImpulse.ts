import { Collider, RigidBody } from "@dimforge/rapier3d-compat";
import { Vector3 } from "three";

export const applyJumpImpulse = (
  jump: boolean,
  canJump: boolean,
  jumpVelocityVec: Vector3,
  character: RigidBody,
  currentVel: Vector3,
  run: boolean,
  sprintJumpMult: number,
  jumpVel: number,
  slopJumpMult: number,
  rayHit: Collider | null,
  standingForcePoint: Vector3,
  characterMassForce: Vector3,
  jumpDirection: Vector3,
  actualSlopeNormalVec: Vector3,
  jumpForceToGroundMult: number
) => {
  if (jump && canJump) {
    // characterRef.current.applyImpulse(jumpDirection.set(0, 0.5, 0), true);
    jumpVelocityVec.set(
      currentVel.x,
      run ? sprintJumpMult * jumpVel : jumpVel,
      currentVel.z
    );
    // Apply slope normal to jump direction
    character.setLinvel(
      jumpDirection
        .set(0, (run ? sprintJumpMult * jumpVel : jumpVel) * slopJumpMult, 0)
        .projectOnVector(actualSlopeNormalVec)
        .add(jumpVelocityVec),
      true
    );
    // Apply jump force downward to the standing platform
    characterMassForce.y *= jumpForceToGroundMult;
    if (rayHit) {
      const rayHitColider = rayHit as Collider;
      rayHitColider
        .parent()
        ?.applyImpulseAtPoint(characterMassForce, standingForcePoint, true);
    }
  }
};

import { RapierRigidBody } from "@react-three/rapier";
import { Vector3 } from "three";

export const detectFallingState = (
  isFalling: boolean,
  currentVel: Vector3,
  canJump: boolean,
  character: RapierRigidBody | null,
  fallingMaxVel: number,
  initialGravityScale: number,
  fallingGravityScale: number
) => {
  /**
   * Detect character falling state
   */
  isFalling = currentVel.y < 0 && !canJump ? true : false;
  /**
   * Setup max falling speed && extra falling gravity
   * Remove gravity if falling speed higher than fallingMaxVel (negetive number so use "<")
   */
  if (character) {
    if (currentVel.y < fallingMaxVel) {
      if (character.gravityScale() !== 0) {
        character.setGravityScale(0, true);
      }
    } else {
      if (!isFalling && character.gravityScale() !== initialGravityScale) {
        // Apply initial gravity after landed
        character.setGravityScale(initialGravityScale, true);
      } else if (
        isFalling &&
        character.gravityScale() !== fallingGravityScale
      ) {
        // Apply larger gravity when falling (if initialGravityScale === fallingGravityScale, won't trigger this)
        character.setGravityScale(fallingGravityScale, true);
      }
    }
  }
};

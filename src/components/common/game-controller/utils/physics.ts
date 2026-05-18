import { vec3 } from "@react-three/rapier";

export function calculateMovement(
  forward: boolean,
  backward: boolean,
  leftward: boolean,
  rightward: boolean,
  moveSpeed: number,
) {
  let xImpulse = 0;
  let zImpulse = 0;

  if (forward) {
    zImpulse += moveSpeed;
  }
  if (backward) {
    zImpulse -= moveSpeed;
  }

  if (leftward) {
    xImpulse += moveSpeed;
  }
  if (rightward) {
    xImpulse -= moveSpeed;
  }

  const length = Math.sqrt(xImpulse * xImpulse + zImpulse * zImpulse);
  if (length === 0) return null;

  return {
    normalizedX: xImpulse / length,
    normalizedZ: zImpulse / length,
  };
}

export function createMovementVelocity(
  nozmalizedX: number,
  normalizedZ: number,
  moveForce: number,
  currentY: number,
) {
  return vec3({
    x: nozmalizedX * moveForce,
    y: currentY,
    z: normalizedZ * moveForce,
  });
}

export function createJumpImpulse(
  force: number,
  currentVelocity: { y: number },
) {
  // Reset any existing vertical velocity before applying jump force
  // This ensures consistent jump height regardless of current state
  return vec3({
    x: 0,
    y: Math.max(force * 7.5, Math.abs(currentVelocity.y)),
    z: 0,
  });
}

export function createFallForce(fallMultiplier: number) {
  return vec3({ x: 0, y: -9.81 * (fallMultiplier - 1) * 0.016, z: 0 });
}

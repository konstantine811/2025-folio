import type { RapierRigidBody } from "@react-three/rapier";

/** Optional safety net for a level with a known solid ground plane. */
export function recoverBelowFloor(body: RapierRigidBody, minimumGroundY: number | undefined, halfHeight: number, radius: number) {
  if (minimumGroundY === undefined) return false;
  const position = body.translation();
  const minimumCenter = minimumGroundY + halfHeight + radius;
  // Allow normal solver contact tolerance without teleporting a grounded body each step.
  if (Number.isFinite(position.y) && position.y >= minimumCenter - 0.02) return false;
  const velocity = body.linvel();
  body.setTranslation({ x: position.x, y: minimumCenter + 0.03, z: position.z }, true);
  body.setLinvel({ x: velocity.x, y: Math.max(0, velocity.y), z: velocity.z }, true);
  return true;
}

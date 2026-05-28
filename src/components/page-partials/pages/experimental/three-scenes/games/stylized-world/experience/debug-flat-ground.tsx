import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { FLAT_GRID_DEBUG_ARENA } from "./world-debug-mode";

const FLOOR_THICKNESS = 0.5;

export function DebugFlatGround() {
  const half = FLAT_GRID_DEBUG_ARENA.arenaSize * 0.5;
  const y = FLAT_GRID_DEBUG_ARENA.flatGroundY - FLOOR_THICKNESS * 0.5;

  return (
    <RigidBody
      type="fixed"
      position={[0, y, 0]}
      colliders={false}
      friction={1.2}
      userData={{ isGround: true, camExcludeCollision: true }}
    >
      <CuboidCollider
        args={[half, FLOOR_THICKNESS * 0.5, half]}
        friction={1.2}
        restitution={0.02}
      />
    </RigidBody>
  );
}

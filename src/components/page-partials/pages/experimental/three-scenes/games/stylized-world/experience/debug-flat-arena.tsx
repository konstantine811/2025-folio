import type { MutableRefObject } from "react";
import type * as THREE from "three";
import { FLAT_GRID_DEBUG_ARENA } from "./world-debug-mode";
import { GridFloorMaterial } from "./grid-floor-material";

type DebugFlatArenaProps = {
  focusRef: MutableRefObject<THREE.Vector3>;
};

/** Flat debug floor with procedural grid texture (world-space UV). */
export function DebugFlatArena(_props: DebugFlatArenaProps) {
  const { arenaSize, tileSize, crossesPerTile, crossStrokeMeters, crossReachMeters } =
    FLAT_GRID_DEBUG_ARENA;

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, FLAT_GRID_DEBUG_ARENA.flatGroundY, 0]}
      receiveShadow
      userData={{ camExcludeCollision: true }}
    >
      <planeGeometry args={[arenaSize, arenaSize]} />
      <GridFloorMaterial
        tileSize={tileSize}
        crossesPerTile={crossesPerTile}
        crossStrokeMeters={crossStrokeMeters}
        crossReachMeters={crossReachMeters}
      />
    </mesh>
  );
}

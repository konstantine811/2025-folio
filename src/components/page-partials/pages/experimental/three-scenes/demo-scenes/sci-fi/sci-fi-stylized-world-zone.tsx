import { Environment, Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Suspense, useMemo, useRef } from "react";
import { Vector3 } from "three";
import { usePlayerPositionStore } from "@/components/page-partials/pages/experimental/three-scenes/character-controller/physics-world/usePlayerPositionStore";
import { FixedLandscapeBoundary } from "@/components/page-partials/pages/experimental/three-scenes/games/stylized-world/experience/fixed-landscape-boundary";
import { FixedLandscapeGround } from "@/components/page-partials/pages/experimental/three-scenes/games/stylized-world/experience/fixed-landscape-ground";
import { FixedLandscapeWorld } from "@/components/page-partials/pages/experimental/three-scenes/games/stylized-world/experience/fixed-landscape-world";
import {
  createLandscapeBounds,
  DEFAULT_LANDSCAPE_SIZE,
  LANDSCAPE_TILE_SIZE,
} from "@/components/page-partials/pages/experimental/three-scenes/games/stylized-world/experience/landscape-config";
import {
  DEFAULT_TERRAIN_PROFILE,
  sampleGroundTerrainHeight,
} from "@/components/page-partials/pages/experimental/three-scenes/games/stylized-world/experience/ground-terrain";
import { ShipDoor } from "./ship/ship-door";
import { STYLIZED_RETURN_DOOR_WORLD } from "./ship/ship-door-config";

const WORLD_SEED = 42;

/** Playable stylized landscape in the sci-fi canvas (WebGL-safe, no WebGPU grass). */
export function SciFiStylizedWorldZone() {
  const focusRef = useRef(new Vector3(0, 0, 0));
  const playerPosition = usePlayerPositionStore((s) => s.position);
  const bounds = useMemo(
    () => createLandscapeBounds(0, 0, DEFAULT_LANDSCAPE_SIZE),
    [],
  );

  const returnDoorY = useMemo(() => {
    return sampleGroundTerrainHeight({
      worldX: STYLIZED_RETURN_DOOR_WORLD.rootPosition[0],
      worldZ: STYLIZED_RETURN_DOOR_WORLD.terrainSampleZ,
      seed: WORLD_SEED,
      profile: DEFAULT_TERRAIN_PROFILE,
    });
  }, []);

  useFrame(() => {
    if (playerPosition) {
      focusRef.current.set(playerPosition.x, 0, playerPosition.z);
    }
  });

  return (
    <group name="sci-fi-stylized-world-zone">
      <fog attach="fog" args={["#b8dce8", 40, 220]} />
      <ambientLight intensity={0.65} />
      <directionalLight
        castShadow
        position={[12, 22, 10]}
        intensity={1.5}
        shadow-mapSize={[2048, 2048]}
      />
      <Suspense fallback={null}>
        <Environment preset="park" environmentIntensity={0.55} />
        <FixedLandscapeWorld
          bounds={bounds}
          focusRef={focusRef}
          tileSize={LANDSCAPE_TILE_SIZE}
          viewRadiusTiles={8}
          bushesPerTile={0}
          worldSeed={WORLD_SEED}
          showGridDebug={false}
          showGround
          terrainProfile={DEFAULT_TERRAIN_PROFILE}
        />
        <FixedLandscapeGround
          bounds={bounds}
          tileSize={LANDSCAPE_TILE_SIZE}
          worldSeed={WORLD_SEED}
          terrainProfile={DEFAULT_TERRAIN_PROFILE}
        />
        <FixedLandscapeBoundary bounds={bounds} />
        <ShipDoor
          portalDirection="to-ship"
          initialDoorOpen
          position={[
            STYLIZED_RETURN_DOOR_WORLD.rootPosition[0],
            returnDoorY,
            STYLIZED_RETURN_DOOR_WORLD.rootPosition[2],
          ]}
          doorAssemblyPosition={STYLIZED_RETURN_DOOR_WORLD.assemblyPosition}
          doorAssemblyRotation={STYLIZED_RETURN_DOOR_WORLD.assemblyRotation}
        />
      </Suspense>
      <Html position={[0, 2.2, -2]} center distanceFactor={10}>
        <div className="pointer-events-none whitespace-nowrap rounded-md border border-white/20 bg-black/70 px-2 py-1 text-xs text-white/90">
          Двері — назад на корабель · Esc — теж повертає
        </div>
      </Html>
    </group>
  );
}

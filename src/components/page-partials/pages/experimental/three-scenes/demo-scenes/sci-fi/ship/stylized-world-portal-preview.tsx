import { Environment } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import { Vector3 } from "three";
import { FixedLandscapeWorld } from "@/components/page-partials/pages/experimental/three-scenes/games/stylized-world/experience/fixed-landscape-world";
import {
  createLandscapeBounds,
  DEFAULT_LANDSCAPE_SIZE,
} from "@/components/page-partials/pages/experimental/three-scenes/games/stylized-world/experience/landscape-config";
import { DEFAULT_TERRAIN_PROFILE } from "@/components/page-partials/pages/experimental/three-scenes/games/stylized-world/experience/ground-terrain";
import { StylizedToyotaCarBodyVisual } from "@/components/page-partials/pages/experimental/three-scenes/games/stylized-world/experience/stylized-toyota-car";

/** Visual-only stylized world slice for the ship door portal (WebGL / standard materials). */
export function StylizedWorldPortalPreview() {
  const focusRef = useRef(new Vector3(0, 0, 0));
  const bounds = useMemo(() => createLandscapeBounds(0, 0, DEFAULT_LANDSCAPE_SIZE), []);

  return (
    <group name="stylized-world-portal-preview">
      <ambientLight intensity={0.55} />
      <directionalLight position={[6, 14, 8]} intensity={1.35} castShadow />
      <Suspense fallback={null}>
        <Environment preset="park" environmentIntensity={0.5} />
        <FixedLandscapeWorld
          bounds={bounds}
          focusRef={focusRef}
          tileSize={16}
          viewRadiusTiles={6}
          bushesPerTile={0}
          worldSeed={42}
          showGridDebug={false}
          showGround
          terrainProfile={DEFAULT_TERRAIN_PROFILE}
        />
        <group position={[0, 0.2, 4]} rotation={[0, Math.PI, 0]}>
          <StylizedToyotaCarBodyVisual />
        </group>
      </Suspense>
    </group>
  );
}

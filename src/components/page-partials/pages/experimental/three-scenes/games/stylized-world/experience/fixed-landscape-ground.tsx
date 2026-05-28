import {
  HeightfieldCollider,
  RigidBody,
} from "@react-three/rapier";
import { useMemo } from "react";
import {
  createGroundTerrainHeightfieldArgs,
  DEFAULT_TERRAIN_PROFILE,
  type TerrainProfile,
} from "./ground-terrain";
import { FixedLandscapeBoundary } from "./fixed-landscape-boundary";
import {
  enumerateLandscapeTiles,
  getTileWorldCenter,
  type LandscapeBounds,
} from "./landscape-config";

const GROUND_COLLIDER_Y = 0;

function PhysicsLandscapeTile({
  tileX,
  tileZ,
  tileSize,
  worldSeed,
  terrainProfile,
}: {
  tileX: number;
  tileZ: number;
  tileSize: number;
  worldSeed: number;
  terrainProfile: TerrainProfile;
}) {
  const center = useMemo(
    () => getTileWorldCenter(tileX, tileZ, tileSize),
    [tileX, tileZ, tileSize],
  );
  const heightfieldArgs = useMemo(
    () =>
      createGroundTerrainHeightfieldArgs(
        tileX,
        tileZ,
        tileSize,
        undefined,
        worldSeed,
        terrainProfile,
      ),
    [tileX, tileZ, tileSize, worldSeed, terrainProfile],
  );

  return (
    <RigidBody
      type="fixed"
      colliders={false}
      position={[center.x, GROUND_COLLIDER_Y, center.z]}
      friction={1.2}
      userData={{ isGround: true, camExcludeCollision: true }}
    >
      <HeightfieldCollider
        args={heightfieldArgs}
        friction={1.2}
        restitution={0}
      />
    </RigidBody>
  );
}

type FixedLandscapeGroundProps = {
  bounds: LandscapeBounds;
  tileSize?: number;
  worldSeed?: number;
  terrainProfile?: TerrainProfile;
  terrainRevision?: number;
};

export function FixedLandscapeGround({
  bounds,
  tileSize = 8,
  worldSeed = 42,
  terrainProfile = DEFAULT_TERRAIN_PROFILE,
  terrainRevision = 0,
}: FixedLandscapeGroundProps) {
  const tiles = useMemo(
    () => enumerateLandscapeTiles(bounds, tileSize),
    [bounds, tileSize, terrainRevision],
  );

  return (
    <>
      <FixedLandscapeBoundary bounds={bounds} />
      {tiles.map(({ tileX, tileZ }) => (
        <PhysicsLandscapeTile
          key={`physics_${tileX}_${tileZ}_${terrainRevision}`}
          tileX={tileX}
          tileZ={tileZ}
          tileSize={tileSize}
          worldSeed={worldSeed}
          terrainProfile={terrainProfile}
        />
      ))}
    </>
  );
}

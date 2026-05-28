import {
  HeightfieldCollider,
  RigidBody,
} from "@react-three/rapier";
import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useState } from "react";
import type { MutableRefObject } from "react";
import type { Vector3 } from "three";
import {
  getTilePoolOffsets,
  getTileWorldCenter,
  readPlayerTile,
  shouldRecenterStream,
  VISUAL_STREAM_RECENTER_MARGIN,
  type TileCoord,
} from "./stylized-world-streaming";
import {
  createGroundTerrainHeightfieldArgs,
  DEFAULT_TERRAIN_PROFILE,
  type TerrainProfile,
} from "./ground-terrain";

type StylizedWorldGroundProps = {
  focusRef: MutableRefObject<Vector3>;
  /** When set, physics tiles follow the same stream center as visual ground (look-ahead). */
  streamTileRef?: MutableRefObject<TileCoord>;
  tileSize?: number;
  radius?: number;
  streamMargin?: number;
  worldSeed?: number;
  terrainProfile?: TerrainProfile;
  terrainRevision?: number;
};

const GROUND_COLLIDER_Y = 0;

function PhysicsGroundTile({
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

export function StylizedWorldGround({
  focusRef,
  streamTileRef,
  tileSize = 8,
  radius = 10,
  streamMargin = VISUAL_STREAM_RECENTER_MARGIN,
  worldSeed = 42,
  terrainProfile = DEFAULT_TERRAIN_PROFILE,
  terrainRevision = 0,
}: StylizedWorldGroundProps) {
  const readStreamTile = () =>
    streamTileRef?.current ?? readPlayerTile(focusRef.current, tileSize);

  const [streamCenter, setStreamCenter] = useState<TileCoord>(() =>
    readStreamTile(),
  );
  const offsets = useMemo(() => getTilePoolOffsets(radius), [radius]);

  useLayoutEffect(() => {
    setStreamCenter(readStreamTile());
  }, [focusRef, streamTileRef, tileSize, radius, offsets, worldSeed, terrainProfile, terrainRevision]);

  useFrame(() => {
    const playerTile = readStreamTile();

    if (
      shouldRecenterStream(playerTile, streamCenter, radius, streamMargin)
    ) {
      setStreamCenter(playerTile);
    }
  });

  return (
    <>
      {offsets.map(({ dx, dz }) => {
        const tileX = streamCenter.x + dx;
        const tileZ = streamCenter.z + dz;

        return (
          <PhysicsGroundTile
            key={`physics_${dx}_${dz}`}
            tileX={tileX}
            tileZ={tileZ}
            tileSize={tileSize}
            worldSeed={worldSeed}
            terrainProfile={terrainProfile}
          />
        );
      })}
    </>
  );
}

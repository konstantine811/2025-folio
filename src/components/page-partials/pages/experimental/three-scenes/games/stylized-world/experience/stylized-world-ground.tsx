import {
  HeightfieldCollider,
  RapierRigidBody,
  RigidBody,
} from "@react-three/rapier";
import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import type { Vector3 } from "three";
import {
  getTilePoolOffsets,
  getTileWorldCenter,
  readPlayerTile,
  shouldRecenterStream,
  type TileCoord,
} from "./stylized-world-streaming";
import {
  createGroundTerrainHeightfieldArgs,
  DEFAULT_TERRAIN_PROFILE,
  type TerrainProfile,
} from "./ground-terrain";

type StylizedWorldGroundProps = {
  focusRef: MutableRefObject<Vector3>;
  tileSize?: number;
  radius?: number;
  worldSeed?: number;
  terrainProfile?: TerrainProfile;
  terrainRevision?: number;
};

const GROUND_COLLIDER_Y = 0;

function syncPhysicsGroundPool({
  bodyRefs,
  offsets,
  streamCenter,
  tileSize,
}: {
  bodyRefs: (RapierRigidBody | null)[];
  offsets: { dx: number; dz: number }[];
  streamCenter: TileCoord;
  tileSize: number;
}) {
  for (let index = 0; index < offsets.length; index++) {
    const body = bodyRefs[index];
    if (!body) continue;

    const { dx, dz } = offsets[index];
    const center = getTileWorldCenter(
      streamCenter.x + dx,
      streamCenter.z + dz,
      tileSize,
    );

    body.setTranslation(
      { x: center.x, y: GROUND_COLLIDER_Y, z: center.z },
      true,
    );
  }
}

function PhysicsGroundTile({
  tileX,
  tileZ,
  tileSize,
  worldSeed,
  terrainProfile,
  bodyRef,
}: {
  tileX: number;
  tileZ: number;
  tileSize: number;
  worldSeed: number;
  terrainProfile: TerrainProfile;
  bodyRef: (body: RapierRigidBody | null) => void;
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
      ref={bodyRef}
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
  tileSize = 8,
  radius = 10,
  worldSeed = 42,
  terrainProfile = DEFAULT_TERRAIN_PROFILE,
  terrainRevision = 0,
}: StylizedWorldGroundProps) {
  const streamCenterRef = useRef<TileCoord>({ x: 0, z: 0 });
  const bodyRefs = useRef<(RapierRigidBody | null)[]>([]);
  const hasSyncedRef = useRef(false);
  const [streamEpoch, setStreamEpoch] = useState(0);
  const offsets = useMemo(() => getTilePoolOffsets(radius), [radius]);

  const runSync = (streamCenter: TileCoord) => {
    syncPhysicsGroundPool({
      bodyRefs: bodyRefs.current,
      offsets,
      streamCenter,
      tileSize,
    });
    hasSyncedRef.current = true;
  };

  useLayoutEffect(() => {
    const streamCenter = readPlayerTile(focusRef.current, tileSize);
    streamCenterRef.current = streamCenter;
    hasSyncedRef.current = false;
    setStreamEpoch((epoch) => epoch + 1);
  }, [focusRef, tileSize, radius, offsets, worldSeed, terrainProfile, terrainRevision]);

  useFrame(() => {
    const readyCount = bodyRefs.current.filter(Boolean).length;
    if (!hasSyncedRef.current && readyCount === offsets.length) {
      runSync(streamCenterRef.current);
    }

    const playerTile = readPlayerTile(focusRef.current, tileSize);

    if (
      !shouldRecenterStream(playerTile, streamCenterRef.current, radius)
    ) {
      return;
    }

    streamCenterRef.current = playerTile;
    setStreamEpoch((epoch) => epoch + 1);
    runSync(playerTile);
  });

  return (
    <>
      {offsets.map(({ dx, dz }, index) => {
        const tileX = streamCenterRef.current.x + dx;
        const tileZ = streamCenterRef.current.z + dz;

        return (
          <PhysicsGroundTile
            key={`${streamEpoch}_${dx}_${dz}`}
            tileX={tileX}
            tileZ={tileZ}
            tileSize={tileSize}
            worldSeed={worldSeed}
            terrainProfile={terrainProfile}
            bodyRef={(body) => {
              bodyRefs.current[index] = body;
            }}
          />
        );
      })}
    </>
  );
}

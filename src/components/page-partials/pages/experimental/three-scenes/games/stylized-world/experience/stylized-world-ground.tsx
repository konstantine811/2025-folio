import {
  CuboidCollider,
  RapierRigidBody,
  RigidBody,
} from "@react-three/rapier";
import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import type { MutableRefObject } from "react";
import {
  getTilePoolOffsets,
  getTileWorldCenter,
  readPlayerTile,
  shouldRecenterStream,
  type TileCoord,
} from "./stylized-world-streaming";

type StylizedWorldGroundProps = {
  focusRef: MutableRefObject<{ x: number; y: number; z: number }>;
  tileSize?: number;
  radius?: number;
};

const GROUND_COLLIDER_HALF_Y = 0.25;
const GROUND_COLLIDER_Y = -GROUND_COLLIDER_HALF_Y;

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
  const half = tileSize / 2;

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

export function StylizedWorldGround({
  focusRef,
  tileSize = 8,
  radius = 10,
}: StylizedWorldGroundProps) {
  const streamCenterRef = useRef<TileCoord>({ x: 0, z: 0 });
  const bodyRefs = useRef<(RapierRigidBody | null)[]>([]);
  const hasSyncedRef = useRef(false);
  const offsets = useMemo(() => getTilePoolOffsets(radius), [radius]);
  const half = tileSize / 2;

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
  }, [focusRef, tileSize, radius, offsets]);

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
    runSync(playerTile);
  });

  return (
    <>
      {offsets.map(({ dx, dz }, index) => {
        const center = getTileWorldCenter(dx, dz, tileSize);

        return (
          <RigidBody
            key={`${dx}_${dz}`}
            ref={(body) => {
              bodyRefs.current[index] = body;
            }}
            type="fixed"
            colliders={false}
            position={[center.x, GROUND_COLLIDER_Y, center.z]}
            friction={1.2}
            userData={{ isGround: true, camExcludeCollision: true }}
          >
            <CuboidCollider
              args={[half, GROUND_COLLIDER_HALF_Y, half]}
              restitution={0}
            />
          </RigidBody>
        );
      })}
    </>
  );
}

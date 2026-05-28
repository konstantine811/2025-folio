import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { useMemo } from "react";
import type { LandscapeBounds } from "./landscape-config";

const WALL_HEIGHT = 5;
const WALL_THICKNESS = 2;

type FixedLandscapeBoundaryProps = {
  bounds: LandscapeBounds;
};

export function FixedLandscapeBoundary({ bounds }: FixedLandscapeBoundaryProps) {
  const walls = useMemo(() => {
    const halfX = bounds.sizeX * 0.5;
    const halfZ = bounds.sizeZ * 0.5;
    const cx = bounds.centerX;
    const cz = bounds.centerZ;
    const y = WALL_HEIGHT * 0.5;
    const t = WALL_THICKNESS * 0.5;

    return [
      {
        key: "north",
        position: [cx, y, cz + halfZ + t] as [number, number, number],
        halfExtents: [halfX, WALL_HEIGHT * 0.5, t] as [number, number, number],
      },
      {
        key: "south",
        position: [cx, y, cz - halfZ - t] as [number, number, number],
        halfExtents: [halfX, WALL_HEIGHT * 0.5, t] as [number, number, number],
      },
      {
        key: "east",
        position: [cx + halfX + t, y, cz] as [number, number, number],
        halfExtents: [t, WALL_HEIGHT * 0.5, halfZ] as [number, number, number],
      },
      {
        key: "west",
        position: [cx - halfX - t, y, cz] as [number, number, number],
        halfExtents: [t, WALL_HEIGHT * 0.5, halfZ] as [number, number, number],
      },
    ];
  }, [bounds]);

  return (
    <>
      {walls.map(({ key, position, halfExtents }) => (
        <RigidBody
          key={key}
          type="fixed"
          position={position}
          colliders={false}
          friction={1.1}
          userData={{ isLandscapeBarrier: true, camExcludeCollision: true }}
        >
          <CuboidCollider
            args={halfExtents}
            friction={1.1}
            restitution={0.02}
          />
        </RigidBody>
      ))}
    </>
  );
}

import { useCallback, useLayoutEffect, useRef } from "react";
import type { MutableRefObject } from "react";
import type * as THREE from "three";
import { GridFloorMaterial } from "./grid-floor-material";

export type GridDebugSyncRef = (tileX: number, tileZ: number) => void;

/**
 * Moving procedural grid overlay (world-space shader, no instanced crosses).
 */
export function ImperativeGridDebug({
  radius,
  tileSize,
  showCrosses = true,
  showTileBounds = true,
  syncRef,
}: {
  radius: number;
  tileSize: number;
  showCrosses?: boolean;
  showTileBounds?: boolean;
  syncRef: MutableRefObject<GridDebugSyncRef | null>;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const size = (radius * 2 + 1) * tileSize;

  const applyGridSync = useCallback(
    (tileX: number, tileZ: number) => {
      const mesh = meshRef.current;
      if (!mesh) return;

      mesh.position.set(
        (tileX - radius) * tileSize + size * 0.5,
        0.009,
        (tileZ - radius) * tileSize + size * 0.5,
      );
    },
    [radius, tileSize, size],
  );

  useLayoutEffect(() => {
    syncRef.current = applyGridSync;
    return () => {
      syncRef.current = null;
    };
  }, [syncRef, applyGridSync]);

  const showGrid = showCrosses || showTileBounds;

  if (!showGrid) {
    return null;
  }

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} frustumCulled={false}>
      <planeGeometry args={[size, size]} />
      <GridFloorMaterial
        tileSize={tileSize}
        overlay
        crossesPerTile={12}
        crossStrokeMeters={showCrosses ? 0.014 : 0}
        crossReachMeters={showCrosses ? 0.2 : 0}
        crossColor="#b898ff"
        lineColor="#e8ecf4"
        lineHalf={showTileBounds ? 0.008 : 0}
      />
    </mesh>
  );
}

/** @deprecated Use ImperativeGridDebug */
export function GridDebug(props: {
  tileX: number;
  tileZ: number;
  radius: number;
  tileSize: number;
  showCrosses?: boolean;
  showTileBounds?: boolean;
}) {
  const syncRef = useRef<GridDebugSyncRef | null>(null);

  useLayoutEffect(() => {
    syncRef.current?.(props.tileX, props.tileZ);
  }, [props.tileX, props.tileZ, props.radius, props.tileSize]);

  return (
    <ImperativeGridDebug
      radius={props.radius}
      tileSize={props.tileSize}
      showCrosses={props.showCrosses}
      showTileBounds={props.showTileBounds}
      syncRef={syncRef}
    />
  );
}

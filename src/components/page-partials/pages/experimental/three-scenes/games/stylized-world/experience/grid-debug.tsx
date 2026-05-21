import { useLayoutEffect, useMemo, useRef } from "react";
import type { MutableRefObject } from "react";
import * as THREE from "three";

const MAX_INSTANCES_PER_MESH = 1024;
const CROSS_ARM = 0.12;

export type GridDebugSyncRef = (tileX: number, tileZ: number) => void;

let sharedCrossGeometry: THREE.BufferGeometry | null = null;

function getCrossGeometry() {
  if (sharedCrossGeometry) return sharedCrossGeometry;

  const positions = new Float32Array([
    -CROSS_ARM, 0, 0, CROSS_ARM, 0, 0,
    0, 0, -CROSS_ARM, 0, 0, CROSS_ARM,
  ]);
  sharedCrossGeometry = new THREE.BufferGeometry();
  sharedCrossGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3),
  );

  return sharedCrossGeometry;
}

function collectCrossPositions(
  tileX: number,
  tileZ: number,
  radius: number,
  tileSize: number,
) {
  const positions: THREE.Vector3[] = [];
  const minGx = (tileX - radius) * tileSize;
  const maxGx = (tileX + radius + 1) * tileSize;
  const minGz = (tileZ - radius) * tileSize;
  const maxGz = (tileZ + radius + 1) * tileSize;

  for (let x = minGx; x < maxGx; x++) {
    for (let z = minGz; z < maxGz; z++) {
      positions.push(new THREE.Vector3(x + 0.5, 0.015, z + 0.5));
    }
  }

  return positions;
}

function buildBoundaryPositions(
  tileX: number,
  tileZ: number,
  radius: number,
  tileSize: number,
) {
  const maxX = (tileX + radius + 1) * tileSize;
  const maxZ = (tileZ + radius + 1) * tileSize;
  const minX = (tileX - radius) * tileSize;
  const minZ = (tileZ - radius) * tileSize;
  const positions: number[] = [];

  for (let x = minX; x <= maxX; x += tileSize) {
    positions.push(x, 0.01, minZ, x, 0.01, maxZ);
  }

  for (let z = minZ; z <= maxZ; z += tileSize) {
    positions.push(minX, 0.01, z, maxX, 0.01, z);
  }

  return new Float32Array(positions);
}

function syncCrossChunks(
  chunks: (THREE.InstancedMesh | null)[],
  tileX: number,
  tileZ: number,
  radius: number,
  tileSize: number,
  dummy: THREE.Object3D,
) {
  const positions = collectCrossPositions(tileX, tileZ, radius, tileSize);
  let matrixIndex = 0;

  for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
    const chunk = chunks[chunkIndex];
    if (!chunk) continue;

    const chunkEnd = Math.min(
      matrixIndex + MAX_INSTANCES_PER_MESH,
      positions.length,
    );
    let localIndex = 0;

    for (let i = matrixIndex; i < chunkEnd; i++) {
      dummy.position.copy(positions[i]);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      chunk.setMatrixAt(localIndex, dummy.matrix);
      localIndex += 1;
    }

    chunk.count = localIndex;
    chunk.instanceMatrix.needsUpdate = true;
    matrixIndex = chunkEnd;
  }
}

function syncBoundaryLines(
  lines: THREE.LineSegments | null,
  tileX: number,
  tileZ: number,
  radius: number,
  tileSize: number,
) {
  if (!lines) return;

  const positions = buildBoundaryPositions(tileX, tileZ, radius, tileSize);
  const attribute = lines.geometry.getAttribute(
    "position",
  ) as THREE.BufferAttribute;

  if (attribute.count * 3 !== positions.length) {
    lines.geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3),
    );
  } else {
    attribute.copyArray(positions);
    attribute.needsUpdate = true;
  }

  lines.geometry.computeBoundingSphere();
}

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
  const boundaryRef = useRef<THREE.LineSegments>(null);
  const crossChunkRefs = useRef<(THREE.InstancedMesh | null)[]>([]);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const crossGeometry = useMemo(() => getCrossGeometry(), []);

  const crossChunkCount = useMemo(() => {
    const maxCrosses = (radius * 2 + 1) ** 2 * tileSize * tileSize;
    return Math.max(1, Math.ceil(maxCrosses / MAX_INSTANCES_PER_MESH));
  }, [radius, tileSize]);

  const boundaryGeometry = useMemo(() => {
    const maxBoundaryPoints = (radius * 2 + 2) * 2 * 2 * 3;
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(maxBoundaryPoints), 3),
    );
    return geometry;
  }, [radius]);

  useLayoutEffect(() => {
    syncRef.current = (tileX, tileZ) => {
      if (showTileBounds) {
        syncBoundaryLines(boundaryRef.current, tileX, tileZ, radius, tileSize);
      }
      if (showCrosses) {
        syncCrossChunks(
          crossChunkRefs.current,
          tileX,
          tileZ,
          radius,
          tileSize,
          dummy,
        );
      }
    };

    return () => {
      syncRef.current = null;
    };
  }, [
    syncRef,
    radius,
    tileSize,
    showCrosses,
    showTileBounds,
    dummy,
  ]);

  return (
    <group>
      {showTileBounds && (
        <lineSegments
          ref={boundaryRef}
          geometry={boundaryGeometry}
          frustumCulled={false}
        >
          <lineBasicMaterial color="#ffffff" transparent opacity={0.55} />
        </lineSegments>
      )}
      {showCrosses &&
        Array.from({ length: crossChunkCount }, (_, chunkIndex) => (
          <instancedMesh
            key={`cross-chunk-${chunkIndex}`}
            ref={(mesh) => {
              crossChunkRefs.current[chunkIndex] = mesh;
            }}
            args={[crossGeometry, undefined, MAX_INSTANCES_PER_MESH]}
            frustumCulled={false}
          >
            <meshBasicMaterial color="#5b8fd9" toneMapped={false} />
          </instancedMesh>
        ))}
    </group>
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

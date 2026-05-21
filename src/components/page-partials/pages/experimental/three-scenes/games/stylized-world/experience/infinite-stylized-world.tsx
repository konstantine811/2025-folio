import { useFrame, useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import * as THREE from "three";
import {
  createBushGeometry,
  DEFAULT_BUSH_CONFIG,
  mulberry32,
  tileSeed,
  type BushConfig,
} from "./bush-core";
import { BushNodeMaterial } from "./bush-material";
import { ImperativeGridDebug, type GridDebugSyncRef } from "./grid-debug";
import {
  readPlayerTile,
  shouldRecenterStream,
} from "./stylized-world-streaming";

type InfiniteStylizedWorldProps = {
  tileSize?: number;
  radius?: number;
  maxRadius?: number;
  bushesPerTile?: number;
  worldSeed?: number;
  bush?: BushConfig;
  showGridDebug?: boolean;
  showGridCrosses?: boolean;
  showTileBounds?: boolean;
  focusRef?: MutableRefObject<THREE.Vector3>;
};

const MAX_INSTANCES_PER_MESH = 1024;

function computeGroundColor(tileX: number, tileZ: number, seed: number) {
  const rng = mulberry32(tileSeed(tileX, tileZ, seed));
  const shade = 0.11 + rng() * 0.025;
  return new THREE.Color(shade, shade, shade + 0.008);
}

function collectBushMatrices({
  tileCenter,
  tileSize,
  radius,
  bushesPerTile,
  worldSeed,
  dummy,
}: {
  tileCenter: { x: number; z: number };
  tileSize: number;
  radius: number;
  bushesPerTile: number;
  worldSeed: number;
  dummy: THREE.Object3D;
}) {
  const matrices: THREE.Matrix4[] = [];

  for (let dz = -radius; dz <= radius; dz++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const tileX = tileCenter.x + dx;
      const tileZ = tileCenter.z + dz;
      const rng = mulberry32(tileSeed(tileX, tileZ, worldSeed));

      for (let i = 0; i < bushesPerTile; i++) {
        if (rng() < 0.25) continue;

        const ox = rng() * tileSize;
        const oz = rng() * tileSize;
        const scale = THREE.MathUtils.lerp(0.75, 1.25, rng());
        const yaw = rng() * Math.PI * 2;

        dummy.position.set(tileX * tileSize + ox, 0, tileZ * tileSize + oz);
        dummy.rotation.set(0, yaw, 0);
        dummy.scale.setScalar(scale);
        dummy.updateMatrix();
        matrices.push(dummy.matrix.clone());
      }
    }
  }

  return matrices;
}

function syncBushChunks(
  chunks: (THREE.InstancedMesh | null)[],
  tileX: number,
  tileZ: number,
  tileSize: number,
  radius: number,
  bushesPerTile: number,
  worldSeed: number,
  dummy: THREE.Object3D,
) {
  if (bushesPerTile <= 0) {
    chunks.forEach((chunk) => {
      if (!chunk) return;
      chunk.count = 0;
      chunk.instanceMatrix.needsUpdate = true;
    });
    return;
  }

  const matrices = collectBushMatrices({
    tileCenter: { x: tileX, z: tileZ },
    tileSize,
    radius,
    bushesPerTile,
    worldSeed,
    dummy,
  });

  let matrixIndex = 0;

  for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
    const chunk = chunks[chunkIndex];
    if (!chunk) continue;

    const chunkEnd = Math.min(matrixIndex + MAX_INSTANCES_PER_MESH, matrices.length);
    let localIndex = 0;

    for (let i = matrixIndex; i < chunkEnd; i++) {
      chunk.setMatrixAt(localIndex, matrices[i]);
      localIndex += 1;
    }

    chunk.count = localIndex;
    chunk.instanceMatrix.needsUpdate = true;
    chunk.computeBoundingSphere();
    matrixIndex = chunkEnd;
  }

  for (let i = matrixIndex; i < chunks.length; i++) {
    const chunk = chunks[i];
    if (!chunk) continue;
    chunk.count = 0;
    chunk.instanceMatrix.needsUpdate = true;
  }
}

type GroundPoolSlot = {
  dx: number;
  dz: number;
  mesh: THREE.Mesh;
};

function GroundPool({
  radius,
  tileSize,
  slotsRef,
}: {
  radius: number;
  tileSize: number;
  slotsRef: MutableRefObject<Array<GroundPoolSlot | undefined>>;
}) {
  const slots = useMemo(() => {
    const result: { dx: number; dz: number }[] = [];
    for (let dz = -radius; dz <= radius; dz++) {
      for (let dx = -radius; dx <= radius; dx++) {
        result.push({ dx, dz });
      }
    }
    return result;
  }, [radius]);

  return (
    <>
      {slots.map(({ dx, dz }, index) => (
        <mesh
          key={`${dx}_${dz}`}
          ref={(mesh) => {
            if (!mesh) {
              delete slotsRef.current[index];
              return;
            }
            mesh.userData.camExcludeCollision = true;
            slotsRef.current[index] = { dx, dz, mesh };
          }}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
          frustumCulled={false}
        >
          <planeGeometry args={[tileSize, tileSize]} />
          <meshBasicMaterial color="#1f1f1f" />
        </mesh>
      ))}
    </>
  );
}

function syncGroundPool(
  slots: Array<GroundPoolSlot | undefined>,
  tileX: number,
  tileZ: number,
  tileSize: number,
  seed: number,
) {
  for (const slot of slots) {
    if (!slot) continue;
    const { dx, dz, mesh } = slot;
    const worldTileX = tileX + dx;
    const worldTileZ = tileZ + dz;
    mesh.position.set(
      worldTileX * tileSize + tileSize / 2,
      0,
      worldTileZ * tileSize + tileSize / 2,
    );
    const material = mesh.material as THREE.MeshBasicMaterial;
    material.color.copy(computeGroundColor(worldTileX, worldTileZ, seed));
  }
}

export function InfiniteStylizedWorld({
  tileSize = 8,
  radius: _radius = 6,
  maxRadius = 10,
  bushesPerTile = 6,
  worldSeed = 42,
  bush,
  showGridDebug = false,
  showGridCrosses = true,
  showTileBounds = true,
  focusRef,
}: InfiniteStylizedWorldProps) {
  const { camera, controls } = useThree();
  const worldFocusRef = useRef(new THREE.Vector3());
  const tileCenterRef = useRef({ x: 0, z: 0 });
  const groundSlotsRef = useRef<Array<GroundPoolSlot | undefined>>([]);
  const bushChunkRefs = useRef<(THREE.InstancedMesh | null)[]>([]);
  const bushesSyncedRef = useRef(false);
  const gridSyncRef = useRef<GridDebugSyncRef | null>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const [bushMaterial, setBushMaterial] = useState<THREE.Material | null>(null);

  const renderRadius = maxRadius;

  const bushConfig = useMemo(
    () => ({ ...DEFAULT_BUSH_CONFIG, ...bush }),
    [
      bush?.leafCount,
      bush?.bushRadius,
      bush?.windStrength,
      bush?.windSpeed,
      bush?.normalMix,
      bush?.debug,
    ],
  );

  const bushGeometry = useMemo(
    () =>
      createBushGeometry(
        bushConfig.leafCount,
        bushConfig.bushRadius,
        bushConfig.normalMix,
        worldSeed,
      ),
    [
      bushConfig.leafCount,
      bushConfig.bushRadius,
      bushConfig.normalMix,
      worldSeed,
    ],
  );

  const bushChunkCount = useMemo(() => {
    const maxInstances = (2 * renderRadius + 1) ** 2 * bushesPerTile;
    return Math.max(1, Math.ceil(maxInstances / MAX_INSTANCES_PER_MESH));
  }, [renderRadius, bushesPerTile]);

  const worldKey = `${renderRadius}-${bushChunkCount}-${bushesPerTile}`;

  const readTileCenter = () => {
    const focus = focusRef
      ? focusRef.current
      : controls && "target" in controls
        ? worldFocusRef.current.copy(
            (controls as { target: THREE.Vector3 }).target,
          )
        : worldFocusRef.current.copy(camera.position);

    return readPlayerTile(focus, tileSize);
  };

  const syncWorld = (tileX: number, tileZ: number) => {
    syncGroundPool(
      groundSlotsRef.current,
      tileX,
      tileZ,
      tileSize,
      worldSeed,
    );
    syncBushChunks(
      bushChunkRefs.current,
      tileX,
      tileZ,
      tileSize,
      renderRadius,
      bushesPerTile,
      worldSeed,
      dummy,
    );
    gridSyncRef.current?.(tileX, tileZ);
  };

  useLayoutEffect(() => {
    groundSlotsRef.current = [];
    bushesSyncedRef.current = false;
    if (bushChunkRefs.current.length !== bushChunkCount) {
      bushChunkRefs.current = new Array(bushChunkCount).fill(null);
    }

    const tile = readTileCenter();
    tileCenterRef.current = tile;
  }, [
    worldKey,
    tileSize,
    worldSeed,
    bushGeometry,
    bushMaterial,
    bushChunkCount,
    showGridDebug,
    showGridCrosses,
    showTileBounds,
    dummy,
  ]);

  useFrame(() => {
    const bushChunksReady =
      bushesPerTile <= 0 ||
      !bushMaterial ||
      bushChunkRefs.current.filter(Boolean).length === bushChunkCount;

    if (!bushesSyncedRef.current && bushChunksReady) {
      syncWorld(tileCenterRef.current.x, tileCenterRef.current.z);
      bushesSyncedRef.current = true;
    }

    const playerTile = readTileCenter();

    if (
      !shouldRecenterStream(
        playerTile,
        tileCenterRef.current,
        renderRadius,
      )
    ) {
      return;
    }

    tileCenterRef.current = playerTile;
    syncWorld(playerTile.x, playerTile.z);
  });

  return (
    <>
      <mesh visible={false} frustumCulled={false}>
        <boxGeometry args={[0.001, 0.001, 0.001]} />
        <BushNodeMaterial ref={setBushMaterial} {...bushConfig} />
      </mesh>
      <group key={worldKey}>
        <GroundPool
          radius={renderRadius}
          tileSize={tileSize}
          slotsRef={groundSlotsRef}
        />
        {showGridDebug && (
          <ImperativeGridDebug
            key={`grid-${worldKey}`}
            radius={renderRadius}
            tileSize={tileSize}
            showCrosses={showGridCrosses}
            showTileBounds={showTileBounds}
            syncRef={gridSyncRef}
          />
        )}
        {bushMaterial &&
          Array.from({ length: bushChunkCount }, (_, chunkIndex) => (
            <instancedMesh
              key={`bush-chunk-${worldKey}-${chunkIndex}`}
              ref={(mesh) => {
                if (mesh) {
                  mesh.count = 0;
                  mesh.instanceMatrix.needsUpdate = true;
                  mesh.userData.camExcludeCollision = true;
                }
                bushChunkRefs.current[chunkIndex] = mesh;
              }}
              args={[bushGeometry, bushMaterial, MAX_INSTANCES_PER_MESH]}
              frustumCulled={false}
            />
          ))}
      </group>
    </>
  );
}

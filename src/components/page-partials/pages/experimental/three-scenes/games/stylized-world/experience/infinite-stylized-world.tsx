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
};

const MAX_INSTANCES_PER_MESH = 1024;

function computeGroundColor(tileX: number, tileZ: number, seed: number) {
  const rng = mulberry32(tileSeed(tileX, tileZ, seed));
  const base = 0.42 + rng() * 0.08;
  return new THREE.Color(base * 0.55, base * 0.78, base * 0.52);
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
  slotsRef: MutableRefObject<GroundPoolSlot[]>;
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

  useLayoutEffect(() => {
    slotsRef.current = [];
  }, [radius, slotsRef]);

  return (
    <>
      {slots.map(({ dx, dz }, index) => (
        <mesh
          key={`${dx}_${dz}`}
          ref={(mesh) => {
            if (!mesh) return;
            slotsRef.current[index] = { dx, dz, mesh };
          }}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
          frustumCulled={false}
        >
          <planeGeometry args={[tileSize, tileSize]} />
          <meshBasicMaterial color="#4a7a52" />
        </mesh>
      ))}
    </>
  );
}

function syncGroundPool(
  slots: GroundPoolSlot[],
  tileX: number,
  tileZ: number,
  tileSize: number,
  seed: number,
) {
  for (const { dx, dz, mesh } of slots) {
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
}: InfiniteStylizedWorldProps) {
  const { controls } = useThree();
  const focusRef = useRef(new THREE.Vector3());
  const tileCenterRef = useRef({ x: 0, z: 0 });
  const groundSlotsRef = useRef<GroundPoolSlot[]>([]);
  const bushChunkRefs = useRef<(THREE.InstancedMesh | null)[]>([]);
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
    bushChunkRefs.current = bushChunkRefs.current.slice(0, bushChunkCount);
    syncWorld(tileCenterRef.current.x, tileCenterRef.current.z);
  }, [
    tileSize,
    renderRadius,
    bushesPerTile,
    worldSeed,
    bushGeometry,
    bushChunkCount,
    bushMaterial,
    showGridDebug,
    showGridCrosses,
    showTileBounds,
    dummy,
  ]);

  useFrame(({ camera }) => {
    const focus =
      controls && "target" in controls
        ? focusRef.current.copy(
            (controls as { target: THREE.Vector3 }).target,
          )
        : focusRef.current.copy(camera.position);

    const tileX = Math.floor(focus.x / tileSize);
    const tileZ = Math.floor(focus.z / tileSize);

    if (
      tileCenterRef.current.x === tileX &&
      tileCenterRef.current.z === tileZ
    ) {
      return;
    }

    tileCenterRef.current = { x: tileX, z: tileZ };
    syncWorld(tileX, tileZ);
  });

  return (
    <group>
      <GroundPool
        radius={renderRadius}
        tileSize={tileSize}
        slotsRef={groundSlotsRef}
      />
      {showGridDebug && (
        <ImperativeGridDebug
          radius={renderRadius}
          tileSize={tileSize}
          showCrosses={showGridCrosses}
          showTileBounds={showTileBounds}
          syncRef={gridSyncRef}
        />
      )}
      <mesh visible={false} frustumCulled={false}>
        <boxGeometry args={[0.001, 0.001, 0.001]} />
        <BushNodeMaterial ref={setBushMaterial} {...bushConfig} />
      </mesh>
      {bushMaterial &&
        Array.from({ length: bushChunkCount }, (_, chunkIndex) => (
          <instancedMesh
            key={`bush-chunk-${chunkIndex}`}
            ref={(mesh) => {
              bushChunkRefs.current[chunkIndex] = mesh;
            }}
            args={[bushGeometry, bushMaterial, MAX_INSTANCES_PER_MESH]}
            frustumCulled={false}
          />
        ))}
    </group>
  );
}

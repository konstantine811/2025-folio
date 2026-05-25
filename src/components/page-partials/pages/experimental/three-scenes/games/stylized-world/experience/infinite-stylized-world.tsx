import { useFrame, useThree } from "@react-three/fiber";
import { useCallback, useLayoutEffect, useMemo, useRef, useState, memo } from "react";
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
import type { GrassRuntimeConfig } from "./grass/config";
import { StylizedGrass } from "./grass/stylized-grass";
import {
  applyGroundTerrainToGeometry,
  createGroundTerrainGeometryTemplate,
  sampleGroundTerrainHeight,
} from "./ground-terrain";
import { ImperativeGridDebug, type GridDebugSyncRef } from "./grid-debug";
import {
  readPlayerTile,
  shouldRecenterStream,
  VISUAL_STREAM_RECENTER_MARGIN,
} from "./stylized-world-streaming";

type InfiniteStylizedWorldProps = {
  tileSize?: number;
  radius?: number;
  maxRadius?: number;
  bushesPerTile?: number;
  worldSeed?: number;
  bush?: BushConfig;
  grass?: GrassRuntimeConfig;
  showGrass?: boolean;
  showGridDebug?: boolean;
  showGridCrosses?: boolean;
  showTileBounds?: boolean;
  streamMargin?: number;
  lookAheadTiles?: number;
  focusRef?: MutableRefObject<THREE.Vector3>;
  grassInteractionRef?: MutableRefObject<THREE.Vector3>;
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
        const worldX = tileX * tileSize + ox;
        const worldZ = tileZ * tileSize + oz;

        dummy.position.set(
          worldX,
          sampleGroundTerrainHeight({ worldX, worldZ, seed: worldSeed }),
          worldZ,
        );
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
  geometry,
  slotsRef,
}: {
  radius: number;
  geometry: THREE.BufferGeometry;
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
          geometry={geometry}
          receiveShadow
          frustumCulled={false}
        >
          <meshStandardMaterial color="#1f1f1f" roughness={0.92} />
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
  terrainTemplate: THREE.BufferGeometry,
) {
  for (const slot of slots) {
    if (!slot) continue;
    const { dx, dz, mesh } = slot;
    const worldTileX = tileX + dx;
    const worldTileZ = tileZ + dz;
    const terrainKey = `${worldTileX}_${worldTileZ}`;

    if (mesh.userData.terrainKey !== terrainKey) {
      if (!mesh.userData.terrainGeometry) {
        mesh.geometry = terrainTemplate.clone();
        mesh.userData.terrainGeometry = mesh.geometry;
      }
      applyGroundTerrainToGeometry(
        mesh.geometry as THREE.BufferGeometry,
        worldTileX,
        worldTileZ,
        tileSize,
        seed,
      );
      mesh.userData.terrainKey = terrainKey;
    }

    mesh.position.set(
      worldTileX * tileSize + tileSize / 2,
      0,
      worldTileZ * tileSize + tileSize / 2,
    );
    const material = mesh.material as THREE.MeshStandardMaterial;
    material.color.copy(computeGroundColor(worldTileX, worldTileZ, seed));
  }
}

type BushLayerProps = {
  worldKey: string;
  bushChunkCount: number;
  bushGeometry: THREE.BufferGeometry;
  bushMaterial: THREE.Material;
  bushChunkRefCallbacks: Array<(mesh: THREE.InstancedMesh | null) => void>;
};

const BushInstances = memo(function BushInstances({
  worldKey,
  bushChunkCount,
  bushGeometry,
  bushMaterial,
  bushChunkRefCallbacks,
}: BushLayerProps) {
  return (
    <>
      {Array.from({ length: bushChunkCount }, (_, chunkIndex) => (
        <instancedMesh
          key={`bush-chunk-${worldKey}-${chunkIndex}`}
          ref={bushChunkRefCallbacks[chunkIndex]}
          args={[bushGeometry, bushMaterial, MAX_INSTANCES_PER_MESH]}
          frustumCulled={false}
        />
      ))}
    </>
  );
});

export function InfiniteStylizedWorld({
  tileSize = 8,
  radius = 10,
  maxRadius,
  bushesPerTile = 6,
  worldSeed = 42,
  bush,
  grass,
  showGrass = true,
  showGridDebug = false,
  showGridCrosses = true,
  showTileBounds = true,
  streamMargin = VISUAL_STREAM_RECENTER_MARGIN,
  lookAheadTiles = 2,
  focusRef,
  grassInteractionRef,
}: InfiniteStylizedWorldProps) {
  const { camera, controls } = useThree();
  const worldFocusRef = useRef(new THREE.Vector3());
  const lastFocusRef = useRef(new THREE.Vector3());
  const hasPreviousFocusRef = useRef(false);
  const lookAheadFocusRef = useRef(new THREE.Vector3());
  const tileCenterRef = useRef({ x: 0, z: 0 });
  const groundSlotsRef = useRef<Array<GroundPoolSlot | undefined>>([]);
  const bushChunkRefs = useRef<(THREE.InstancedMesh | null)[]>([]);
  const bushesSyncedRef = useRef(false);
  const gridSyncRef = useRef<GridDebugSyncRef | null>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const bushMaterialRef = useRef<THREE.Material | null>(null);
  const [bushMaterialReady, setBushMaterialReady] = useState(false);
  const groundTerrainTemplate = useMemo(
    () => createGroundTerrainGeometryTemplate(tileSize),
    [tileSize],
  );

  const assignBushMaterial = useCallback((material: THREE.Material | null) => {
    if (!material || bushMaterialRef.current?.uuid === material.uuid) return;
    bushMaterialRef.current = material;
    setBushMaterialReady(true);
  }, []);

  const renderRadius = maxRadius ?? radius;

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

  const grassRuntime = useMemo(
    () => ({
      bladeHeightMin: grass?.bladeHeightMin ?? 0.28,
      bladeHeightMax: grass?.bladeHeightMax ?? 0.62,
      windSwayStrength: grass?.windSwayStrength ?? 0.85,
      pushRadius: grass?.pushRadius ?? 1.4,
      terrainSeed: grass?.terrainSeed ?? worldSeed,
      ...grass,
    }),
    [grass, worldSeed],
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

  const bushChunkRefCallbacks = useMemo(
    () =>
      Array.from({ length: bushChunkCount }, (_, chunkIndex) => {
        return (mesh: THREE.InstancedMesh | null) => {
          bushChunkRefs.current[chunkIndex] = mesh;
          if (mesh) {
            mesh.userData.camExcludeCollision = true;
            return;
          }
          bushesSyncedRef.current = false;
        };
      }),
    [bushChunkCount],
  );

  const worldKey = `${renderRadius}-${bushChunkCount}-${bushesPerTile}`;

  const readTileCenter = () => {
    const focus = focusRef
      ? focusRef.current
      : controls && "target" in controls
        ? worldFocusRef.current.copy(
            (controls as { target: THREE.Vector3 }).target,
          )
        : worldFocusRef.current.copy(camera.position);

    lookAheadFocusRef.current.copy(focus);

    if (!hasPreviousFocusRef.current) {
      lastFocusRef.current.copy(focus);
      hasPreviousFocusRef.current = true;
      return readPlayerTile(focus, tileSize);
    }

    const moveX = focus.x - lastFocusRef.current.x;
    const moveZ = focus.z - lastFocusRef.current.z;
    lastFocusRef.current.copy(focus);

    const moveDistance = Math.hypot(moveX, moveZ);
    if (moveDistance > 0.0001) {
      const aheadDistance = Math.min(tileSize * lookAheadTiles, moveDistance * 18);
      lookAheadFocusRef.current.x += (moveX / moveDistance) * aheadDistance;
      lookAheadFocusRef.current.z += (moveZ / moveDistance) * aheadDistance;
    }

    return readPlayerTile(lookAheadFocusRef.current, tileSize);
  };

  const syncWorld = (tileX: number, tileZ: number) => {
    syncGroundPool(
      groundSlotsRef.current,
      tileX,
      tileZ,
      tileSize,
      worldSeed,
      groundTerrainTemplate,
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
    bushesSyncedRef.current = false;
    hasPreviousFocusRef.current = false;
    if (bushChunkRefs.current.length !== bushChunkCount) {
      bushChunkRefs.current = new Array(bushChunkCount).fill(null);
    }

    const tile = readTileCenter();
    tileCenterRef.current = tile;
    syncGroundPool(
      groundSlotsRef.current,
      tile.x,
      tile.z,
      tileSize,
      worldSeed,
      groundTerrainTemplate,
    );
  }, [
    worldKey,
    tileSize,
    worldSeed,
    bushGeometry,
    bushChunkCount,
    showGridDebug,
    showGridCrosses,
    showTileBounds,
    dummy,
    groundTerrainTemplate,
  ]);

  useFrame(() => {
    const bushMaterial = bushMaterialRef.current;
    const bushChunksReady =
      bushesPerTile <= 0 ||
      !bushMaterial ||
      bushChunkRefs.current.filter(Boolean).length === bushChunkCount;

    const bushInstanceCount = bushChunkRefs.current.reduce(
      (sum, chunk) => sum + (chunk?.count ?? 0),
      0,
    );

    if (
      bushesPerTile > 0 &&
      bushChunksReady &&
      bushInstanceCount === 0 &&
      bushesSyncedRef.current
    ) {
      bushesSyncedRef.current = false;
    }

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
        streamMargin,
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
        <BushNodeMaterial ref={assignBushMaterial} {...bushConfig} />
      </mesh>
      <group key={worldKey}>
        {showGrass && focusRef && (
          <StylizedGrass
            focusRef={focusRef}
            interactionRef={grassInteractionRef}
            visible={showGrass}
            config={grassRuntime}
          />
        )}
        <GroundPool
          radius={renderRadius}
          geometry={groundTerrainTemplate}
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
        {bushMaterialReady && bushMaterialRef.current && (
          <BushInstances
            worldKey={worldKey}
            bushChunkCount={bushChunkCount}
            bushGeometry={bushGeometry}
            bushMaterial={bushMaterialRef.current}
            bushChunkRefCallbacks={bushChunkRefCallbacks}
          />
        )}
      </group>
    </>
  );
}

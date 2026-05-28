import { useFrame } from "@react-three/fiber";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, memo } from "react";
import type { MutableRefObject } from "react";
import * as THREE from "three";
import {
  createBushGeometry,
  DEFAULT_BUSH_CONFIG,
  type BushConfig,
} from "./bush-core";
import { BushNodeMaterial } from "./bush-material";
import {
  applyGroundTerrainToGeometry,
  createGroundTerrainGeometryTemplate,
  DEFAULT_TERRAIN_PROFILE,
  type TerrainProfile,
} from "./ground-terrain";
import { ImperativeGridDebug, type GridDebugSyncRef } from "./grid-debug";
import {
  enumerateLandscapeTiles,
  getLandscapeGridDebugRadius,
  getLandscapeTileRange,
  isTileWithinView,
  type LandscapeBounds,
} from "./landscape-config";
import {
  assignMatricesToInstancedChunks,
  collectBushMatricesForTiles,
  computeGroundColor,
} from "./world-visual-helpers";
type FixedLandscapeWorldProps = {
  bounds: LandscapeBounds;
  tileSize?: number;
  viewRadiusTiles?: number;
  bushesPerTile?: number;
  worldSeed?: number;
  bush?: BushConfig;
  showGround?: boolean;
  showGridDebug?: boolean;
  showGridCrosses?: boolean;
  showTileBounds?: boolean;
  focusRef: MutableRefObject<THREE.Vector3>;
  terrainProfile?: TerrainProfile;
  terrainRevision?: number;
};

const MAX_INSTANCES_PER_MESH = 1024;

const FixedGroundTile = memo(function FixedGroundTile({
  tileX,
  tileZ,
  tileSize,
  worldSeed,
  terrainProfile,
  terrainRevision,
  terrainTemplate,
  onMeshReady,
}: {
  tileX: number;
  tileZ: number;
  tileSize: number;
  worldSeed: number;
  terrainProfile: TerrainProfile;
  terrainRevision: number;
  terrainTemplate: THREE.BufferGeometry;
  onMeshReady?: (mesh: THREE.Mesh | null) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  const { geometry, color } = useMemo(() => {
    const geo = terrainTemplate.clone();
    applyGroundTerrainToGeometry(
      geo,
      tileX,
      tileZ,
      tileSize,
      worldSeed,
      terrainProfile,
    );
    return {
      geometry: geo,
      color: computeGroundColor(tileX, tileZ, worldSeed),
    };
  }, [
    tileX,
    tileZ,
    tileSize,
    worldSeed,
    terrainProfile,
    terrainRevision,
    terrainTemplate,
  ]);

  useEffect(() => {
    return () => geometry.dispose();
  }, [geometry]);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    mesh.position.set(
      tileX * tileSize + tileSize * 0.5,
      0,
      tileZ * tileSize + tileSize * 0.5,
    );
    const material = mesh.material as THREE.MeshStandardMaterial;
    material.color.copy(color);
  }, [tileX, tileZ, tileSize, color]);

  return (
    <mesh
      ref={(mesh) => {
        meshRef.current = mesh;
        onMeshReady?.(mesh);
      }}
      geometry={geometry}
      receiveShadow
      frustumCulled={false}
      userData={{ camExcludeCollision: true }}
    >
      <meshStandardMaterial color={color} roughness={0.92} />
    </mesh>
  );
});

const BushInstances = memo(function BushInstances({
  bushChunkCount,
  bushGeometry,
  bushMaterial,
  bushChunkRefCallbacks,
}: {
  bushChunkCount: number;
  bushGeometry: THREE.BufferGeometry;
  bushMaterial: THREE.Material;
  bushChunkRefCallbacks: Array<(mesh: THREE.InstancedMesh | null) => void>;
}) {
  return (
    <>
      {Array.from({ length: bushChunkCount }, (_, chunkIndex) => (
        <instancedMesh
          key={`bush-chunk-${chunkIndex}`}
          ref={bushChunkRefCallbacks[chunkIndex]}
          args={[bushGeometry, bushMaterial, MAX_INSTANCES_PER_MESH]}
          frustumCulled
        />
      ))}
    </>
  );
});

export function FixedLandscapeWorld({
  bounds,
  tileSize = 8,
  viewRadiusTiles = 10,
  bushesPerTile = 6,
  worldSeed = 42,
  bush,
  showGround = true,
  showGridDebug = false,
  showGridCrosses = true,
  showTileBounds = true,
  focusRef,
  terrainProfile = DEFAULT_TERRAIN_PROFILE,
  terrainRevision = 0,
}: FixedLandscapeWorldProps) {
  const tileMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const bushChunkRefs = useRef<(THREE.InstancedMesh | null)[]>([]);
  const bushesSyncedRef = useRef(false);
  const gridSyncRef = useRef<GridDebugSyncRef | null>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const bushMaterialRef = useRef<THREE.Material | null>(null);
  const [bushMaterialReady, setBushMaterialReady] = useState(false);

  const terrainTemplate = useMemo(
    () => createGroundTerrainGeometryTemplate(tileSize),
    [tileSize],
  );

  const tiles = useMemo(
    () => enumerateLandscapeTiles(bounds, tileSize),
    [bounds, tileSize, terrainRevision],
  );

  const tileRange = useMemo(
    () => getLandscapeTileRange(bounds, tileSize),
    [bounds, tileSize],
  );

  const gridDebugRadius = useMemo(
    () => getLandscapeGridDebugRadius(bounds, tileSize),
    [bounds, tileSize],
  );

  const gridCenterTile = useMemo(
    () => ({
      x: Math.floor((tileRange.minTileX + tileRange.maxTileX) * 0.5),
      z: Math.floor((tileRange.minTileZ + tileRange.maxTileZ) * 0.5),
    }),
    [tileRange],
  );

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
    const maxInstances = tiles.length * bushesPerTile;
    return Math.max(1, Math.ceil(maxInstances / MAX_INSTANCES_PER_MESH));
  }, [tiles.length, bushesPerTile]);

  const assignBushMaterial = useCallback((material: THREE.Material | null) => {
    if (!material || bushMaterialRef.current?.uuid === material.uuid) return;
    bushMaterialRef.current = material;
    setBushMaterialReady(true);
  }, []);

  const syncBushes = useCallback(() => {
    const matrices = collectBushMatricesForTiles({
      tiles,
      tileSize,
      bushesPerTile,
      worldSeed,
      terrainProfile,
      dummy,
    });
    assignMatricesToInstancedChunks(bushChunkRefs.current, matrices);
  }, [
    tiles,
    tileSize,
    bushesPerTile,
    worldSeed,
    terrainProfile,
    dummy,
  ]);

  const bushChunkRefCallbacks = useMemo(
    () =>
      Array.from({ length: bushChunkCount }, (_, chunkIndex) => {
        return (mesh: THREE.InstancedMesh | null) => {
          bushChunkRefs.current[chunkIndex] = mesh;
          if (!mesh) bushesSyncedRef.current = false;
        };
      }),
    [bushChunkCount],
  );

  useLayoutEffect(() => {
    bushChunkRefs.current = new Array(bushChunkCount).fill(null);
    bushesSyncedRef.current = false;
    gridSyncRef.current?.(gridCenterTile.x, gridCenterTile.z);
  }, [bushChunkCount, gridCenterTile.x, gridCenterTile.z]);

  useLayoutEffect(() => {
    bushesSyncedRef.current = false;
  }, [
    tiles,
    tileSize,
    bushesPerTile,
    worldSeed,
    terrainProfile,
    terrainRevision,
    bushChunkCount,
  ]);

  useFrame(() => {
    const focus = focusRef?.current;
    if (focus) {
      for (const { tileX, tileZ } of tiles) {
        const key = `${tileX}_${tileZ}`;
        const mesh = tileMeshesRef.current.get(key);
        if (!mesh) continue;
        mesh.visible = isTileWithinView(
          tileX,
          tileZ,
          tileSize,
          focus.x,
          focus.z,
          viewRadiusTiles,
        );
      }
    }

    const bushChunksReady =
      bushesPerTile <= 0 ||
      bushChunkRefs.current.filter(Boolean).length === bushChunkCount;

    if (
      !bushesSyncedRef.current &&
      bushChunksReady &&
      bushMaterialRef.current
    ) {
      syncBushes();
      bushesSyncedRef.current = true;
    }
  });

  const enableBushes = bushesPerTile > 0;

  return (
    <>
      {enableBushes && (
        <mesh visible={false} frustumCulled={false}>
          <boxGeometry args={[0.001, 0.001, 0.001]} />
          <BushNodeMaterial ref={assignBushMaterial} {...bushConfig} />
        </mesh>
      )}

      <group>
        {showGround &&
          tiles.map(({ tileX, tileZ }) => (
            <FixedGroundTile
              key={`ground_${tileX}_${tileZ}_${terrainRevision}`}
              tileX={tileX}
              tileZ={tileZ}
              tileSize={tileSize}
              worldSeed={worldSeed}
              terrainProfile={terrainProfile}
              terrainRevision={terrainRevision}
              terrainTemplate={terrainTemplate}
              onMeshReady={(mesh) => {
                const key = `${tileX}_${tileZ}`;
                if (mesh) {
                  tileMeshesRef.current.set(key, mesh);
                  const focus = focusRef.current;
                  mesh.visible = isTileWithinView(
                    tileX,
                    tileZ,
                    tileSize,
                    focus.x,
                    focus.z,
                    viewRadiusTiles,
                  );
                } else {
                  tileMeshesRef.current.delete(key);
                }
              }}
            />
          ))}

        {showGridDebug && (
          <ImperativeGridDebug
            radius={gridDebugRadius}
            tileSize={tileSize}
            showCrosses={showGridCrosses}
            showTileBounds={showTileBounds}
            syncRef={gridSyncRef}
          />
        )}

        {enableBushes && bushMaterialReady && bushMaterialRef.current && (
          <BushInstances
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

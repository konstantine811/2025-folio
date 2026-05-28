/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { useFrame, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useRef } from "react";
import type { MutableRefObject } from "react";
import * as THREE from "three";
import {
  DEFAULT_TERRAIN_PROFILE,
  type TerrainProfile,
} from "../ground-terrain";
import type { GrassGroundDataBinding } from "../ground-data";
import { GrassLOD } from "./grass-lod";
import type { GrassRuntimeConfig } from "./config";
import type { GrassStreamSnap } from "./grass-stream-snap";
import {
  createGrassTerrainHeightTextureState,
  rebuildGrassTerrainHeightTexture,
  shouldRebuildGrassTerrainHeightTexture,
  TERRAIN_HEIGHT_TEXTURE_REBUILD_MARGIN,
} from "./grass-terrain-height-texture";
import { useGrassCompute } from "./use-grass-compute";
import { gridIndexFromCell, useGridSnapping } from "./use-grid-snapping";
import { useGrassUniforms } from "./use-grass-uniforms";

type StylizedGrassProps = {
  focusRef: MutableRefObject<THREE.Vector3>;
  streamSnapRef: MutableRefObject<GrassStreamSnap>;
  interactionRef?: MutableRefObject<THREE.Vector3>;
  grassGroundDataRef?: MutableRefObject<GrassGroundDataBinding>;
  terrainProfile?: TerrainProfile;
  visible?: boolean;
  config?: GrassRuntimeConfig;
};

export function StylizedGrass({
  focusRef,
  streamSnapRef,
  interactionRef,
  grassGroundDataRef,
  terrainProfile = DEFAULT_TERRAIN_PROFILE,
  visible = true,
  config,
}: StylizedGrassProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const { uniforms } = useGrassUniforms(config);
  const { lodBuffers, grassData } = useGrassCompute(uniforms, camera);

  const terrainHeightStateRef = useRef(createGrassTerrainHeightTextureState());
  const lastTerrainBuildRef = useRef({ x: Number.NaN, z: Number.NaN });
  const terrainRevisionRef = useRef(config?.terrainRevision ?? 0);

  const syncTerrainHeightUniforms = useCallback(() => {
    const state = terrainHeightStateRef.current;
    if (!state.texture) return;

    uniforms.compute.uTerrainHeightTexture.value = state.texture;
    uniforms.compute.uTerrainHeightCenter.value.set(state.centerX, state.centerZ);
    uniforms.compute.uTerrainHeightHalfSize.value = state.halfSize;
    uniforms.compute.uTerrainHeightEnabled.value = 1;
  }, [uniforms.compute]);

  const rebuildTerrainHeightTexture = useCallback(
    (centerX: number, centerZ: number, force = false) => {
      if (
        !force &&
        !shouldRebuildGrassTerrainHeightTexture(
          centerX,
          centerZ,
          lastTerrainBuildRef.current.x,
          lastTerrainBuildRef.current.z,
          TERRAIN_HEIGHT_TEXTURE_REBUILD_MARGIN,
        )
      ) {
        return;
      }

      const seed = config?.terrainSeed ?? 42;
      rebuildGrassTerrainHeightTexture(
        terrainHeightStateRef.current,
        centerX,
        centerZ,
        seed,
        terrainProfile,
      );
      syncTerrainHeightUniforms();

      lastTerrainBuildRef.current.x = centerX;
      lastTerrainBuildRef.current.z = centerZ;
    },
    [config?.terrainSeed, syncTerrainHeightUniforms, terrainProfile],
  );

  useEffect(() => {
    const revision = config?.terrainRevision ?? 0;
    if (revision === terrainRevisionRef.current) return;
    terrainRevisionRef.current = revision;
    const snap = streamSnapRef.current;
    rebuildTerrainHeightTexture(snap.centerX, snap.centerZ, true);
  }, [config?.terrainRevision, rebuildTerrainHeightTexture, streamSnapRef]);

  useGridSnapping(streamSnapRef, ({ snappedX, snappedZ, currentCellX, currentCellZ }) => {
    if (!groupRef.current) return;

    groupRef.current.position.set(snappedX, 0, snappedZ);
    groupRef.current.updateMatrixWorld(true);

    const groupOffset = uniforms.compute.uGroupOffset.value;
    groupOffset.setFromMatrixPosition(groupRef.current.matrixWorld);
    uniforms.material.uGroupOffset.value.copy(groupOffset);

    const gridIndex = gridIndexFromCell(currentCellX, currentCellZ);
    uniforms.compute.uGridIndex.value.set(gridIndex.x, gridIndex.z);

    // Rebuild height map only when stream cell actually changes (not every frame).
    rebuildTerrainHeightTexture(snappedX, snappedZ, true);
  });

  useFrame(() => {
    uniforms.compute.uCharacterWorldPos.value.copy(
      interactionRef?.current ?? focusRef.current,
    );

    const groundData = grassGroundDataRef?.current;
    if (groundData?.texture) {
      uniforms.material.uGroundDataTexture.value = groundData.texture;
      uniforms.material.uGroundDataCenter.value.set(
        groundData.centerX,
        groundData.centerZ,
      );
      uniforms.material.uGroundDataHalfSize.value = groundData.halfSize;
      uniforms.material.uGroundDataEnabled.value = 1;
    } else {
      uniforms.material.uGroundDataEnabled.value = 0;
    }
  });

  useEffect(() => {
    const snap = streamSnapRef.current;
    rebuildTerrainHeightTexture(snap.centerX, snap.centerZ, true);
  }, [rebuildTerrainHeightTexture, streamSnapRef]);

  useEffect(() => {
    return () => {
      terrainHeightStateRef.current.texture?.dispose();
      terrainHeightStateRef.current.texture = null;
      terrainHeightStateRef.current.data = null;
      uniforms.compute.uTerrainHeightEnabled.value = 0;
    };
  }, [uniforms.compute]);

  if (!visible || !grassData || lodBuffers.length === 0) return null;

  return (
    <group ref={groupRef}>
      {lodBuffers.map((lodBuffer) => (
        <GrassLOD
          key={`grass-lod-${lodBuffer.segments}-${lodBuffer.minDistance}`}
          grassData={grassData}
          lodBuffer={lodBuffer}
          uniforms={uniforms}
        />
      ))}
    </group>
  );
}

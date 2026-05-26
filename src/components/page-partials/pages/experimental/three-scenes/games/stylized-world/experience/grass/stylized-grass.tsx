/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import type { MutableRefObject } from "react";
import * as THREE from "three";
import type { GrassGroundDataBinding } from "../ground-data";
import { GrassLOD } from "./grass-lod";
import type { GrassRuntimeConfig } from "./config";
import { useGrassCompute } from "./use-grass-compute";
import { gridIndexFromCell, useGridSnapping } from "./use-grid-snapping";
import { useGrassUniforms } from "./use-grass-uniforms";

type StylizedGrassProps = {
  focusRef: MutableRefObject<THREE.Vector3>;
  interactionRef?: MutableRefObject<THREE.Vector3>;
  grassGroundDataRef?: MutableRefObject<GrassGroundDataBinding>;
  visible?: boolean;
  config?: GrassRuntimeConfig;
};

export function StylizedGrass({
  focusRef,
  interactionRef,
  grassGroundDataRef,
  visible = true,
  config,
}: StylizedGrassProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const { uniforms } = useGrassUniforms(config);
  const { lodBuffers, grassData } = useGrassCompute(uniforms, camera);

  useGridSnapping(focusRef, ({ snappedX, snappedZ, currentCellX, currentCellZ }) => {
    if (!groupRef.current) return;

    groupRef.current.position.set(snappedX, 0, snappedZ);
    groupRef.current.updateMatrixWorld(true);

    const groupOffset = uniforms.compute.uGroupOffset.value;
    groupOffset.setFromMatrixPosition(groupRef.current.matrixWorld);
    uniforms.material.uGroupOffset.value.copy(groupOffset);

    const gridIndex = gridIndexFromCell(currentCellX, currentCellZ);
    uniforms.compute.uGridIndex.value.set(gridIndex.x, gridIndex.z);
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

import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import type { MutableRefObject } from "react";
import * as THREE from "three";
import { GROUND_TERRAIN_HEIGHT } from "../ground-terrain";
import { GrassLOD } from "./grass-lod";
import type { GrassRuntimeConfig } from "./config";
import { useGrassCompute } from "./use-grass-compute";
import { gridIndexFromCell, useGridSnapping } from "./use-grid-snapping";
import { useGrassUniforms } from "./use-grass-uniforms";

type StylizedGrassProps = {
  focusRef: MutableRefObject<THREE.Vector3>;
  interactionRef?: MutableRefObject<THREE.Vector3>;
  visible?: boolean;
  config?: GrassRuntimeConfig;
};

export function StylizedGrass({
  focusRef,
  interactionRef,
  visible = true,
  config,
}: StylizedGrassProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const { uniforms } = useGrassUniforms(config);
  const { lodBuffers, grassData } = useGrassCompute(uniforms, camera);

  useGridSnapping(focusRef, ({ snappedX, snappedZ, currentCellX, currentCellZ }) => {
    if (!groupRef.current) return;

    groupRef.current.position.set(snappedX, GROUND_TERRAIN_HEIGHT, snappedZ);
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

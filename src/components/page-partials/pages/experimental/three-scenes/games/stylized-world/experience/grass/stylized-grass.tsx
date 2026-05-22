import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import type { MutableRefObject } from "react";
import * as THREE from "three";
import { GrassLOD } from "./grass-lod";
import type { GrassRuntimeConfig } from "./config";
import { useGrassCompute } from "./use-grass-compute";
import { gridIndexFromCell, useGridSnapping } from "./use-grid-snapping";
import { useGrassUniforms } from "./use-grass-uniforms";

type StylizedGrassProps = {
  focusRef: MutableRefObject<THREE.Vector3>;
  visible?: boolean;
  config?: GrassRuntimeConfig;
};

export function StylizedGrass({
  focusRef,
  visible = true,
  config,
}: StylizedGrassProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const { uniforms, syncUniforms } = useGrassUniforms(config);
  const { lodBuffer, grassData } = useGrassCompute(uniforms, camera);

  useEffect(() => {
    if (config) syncUniforms(config);
  }, [config, syncUniforms]);

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
    uniforms.compute.uCharacterWorldPos.value.copy(focusRef.current);
  });

  if (!visible || !lodBuffer || !grassData) return null;

  return (
    <group ref={groupRef}>
      <GrassLOD
        grassData={grassData}
        lodBuffer={lodBuffer}
        uniforms={uniforms}
      />
    </group>
  );
}

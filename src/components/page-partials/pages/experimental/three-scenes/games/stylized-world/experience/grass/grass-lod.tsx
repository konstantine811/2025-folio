import { useEffect, useMemo } from "react";
import * as THREE from "three/webgpu";
import { BLADES_PER_AXIS } from "./config";
import type { GrassUniforms, LODBufferConfig } from "./config";
import { createBladeGeometry } from "./grass-geometry";
import { createGrassMaterial } from "./grass-material";

type GrassLODProps = {
  grassData: ReturnType<typeof import("./grass-geometry").createGrassData> | null;
  lodBuffer: LODBufferConfig;
  uniforms: GrassUniforms;
};

export function GrassLOD({ grassData, lodBuffer, uniforms }: GrassLODProps) {
  const mesh = useMemo(() => {
    if (!grassData) return null;

    const grassBlades = BLADES_PER_AXIS * BLADES_PER_AXIS;
    const bladeGeometry = createBladeGeometry(lodBuffer.segments);
    bladeGeometry.setIndirect(lodBuffer.drawBuffer);

    const material = createGrassMaterial(
      grassData,
      lodBuffer.indices,
      uniforms.material,
    );

    const grassMesh = new THREE.Mesh(bladeGeometry, material);
    grassMesh.count = grassBlades;
    grassMesh.frustumCulled = false;
    grassMesh.userData.camExcludeCollision = true;

    return grassMesh;
  }, [grassData, lodBuffer, uniforms.material]);

  useEffect(() => {
    return () => {
      mesh?.geometry.dispose();
      mesh?.material.dispose();
    };
  }, [mesh]);

  if (!mesh) return null;
  return <primitive object={mesh} />;
}

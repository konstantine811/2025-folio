import { useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three/webgpu";
import { GRASS_BLADE_COUNT } from "./config";
import type { GrassUniforms, LODBufferConfig } from "./config";
import { createBladeGeometry } from "./grass-geometry";
import { createGrassMaterial } from "./grass-material";

type GrassLODProps = {
  grassData: ReturnType<typeof import("./grass-geometry").createGrassData>;
  lodBuffer: LODBufferConfig;
  uniforms: GrassUniforms;
};

export function GrassLOD({ grassData, lodBuffer, uniforms }: GrassLODProps) {
  const { scene } = useThree();
  const envMap = scene.environment;

  const mesh = useMemo(() => {
    const grassBlades = GRASS_BLADE_COUNT;
    const bladeGeometry = createBladeGeometry(lodBuffer.segments);
    bladeGeometry.setIndirect(lodBuffer.drawBuffer);

    const debugColor = lodBuffer.debugColor
      ? new THREE.Color(...lodBuffer.debugColor)
      : undefined;

    const material = createGrassMaterial(
      grassData,
      lodBuffer.indices,
      uniforms.material,
      debugColor,
    );

    if (envMap) {
      material.envMap = envMap;
      material.envMapIntensity = 0.08;
    }

    const grassMesh = new THREE.Mesh(bladeGeometry, material);
    grassMesh.count = grassBlades;
    grassMesh.frustumCulled = false;
    grassMesh.userData.camExcludeCollision = true;

    return grassMesh;
  }, [grassData, lodBuffer, uniforms.material, envMap]);

  useEffect(() => {
    return () => {
      mesh.geometry.dispose();
      mesh.material.dispose();
    };
  }, [mesh]);

  return <primitive object={mesh} />;
}

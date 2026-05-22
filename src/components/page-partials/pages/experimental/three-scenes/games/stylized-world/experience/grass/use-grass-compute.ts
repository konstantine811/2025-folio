import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three/webgpu";
import { WebGPURenderer } from "three/webgpu";
import { storage } from "three/tsl";
import {
  GRASS_BLADE_COUNT,
  DEFAULT_LOD_CONFIG,
  drawIndirectStructure,
  type GrassUniforms,
  type LODBufferConfig,
} from "./config";
import {
  createBladeGeometry,
  createGrassData,
  createVisibleIndicesBuffer,
} from "./grass-geometry";
import { createGrassCompute, createResetDrawBufferCompute } from "./grass-compute";

export function useGrassCompute(
  uniforms: GrassUniforms,
  camera: THREE.Camera,
) {
  const { gl } = useThree();
  const [lodBuffers, setLodBuffers] = useState<LODBufferConfig[]>([]);
  const [grassData, setGrassData] = useState<ReturnType<
    typeof createGrassData
  > | null>(null);
  const computeRefs = useRef<{
    main: THREE.ComputeNode | null;
    reset: THREE.ComputeNode | null;
  }>({
    main: null,
    reset: null,
  });

  useEffect(() => {
    const grassBlades = GRASS_BLADE_COUNT;
    const data = createGrassData(grassBlades);
    setGrassData(data);

    const configs: LODBufferConfig[] = DEFAULT_LOD_CONFIG.map((cfg) => {
      const geo = createBladeGeometry(cfg.segments);
      const vertexCount = geo.index
        ? geo.index.count
        : geo.attributes.position.count;
      geo.dispose();

      const drawBuffer = new THREE.IndirectStorageBufferAttribute(
        new Uint32Array(5),
        5,
      );

      return {
        ...cfg,
        indices: createVisibleIndicesBuffer(grassBlades),
        drawBuffer,
        drawStorage: storage(drawBuffer, drawIndirectStructure, 1),
        vertexCount,
      };
    });

    setLodBuffers(configs);

    computeRefs.current = {
      main: createGrassCompute(data, configs, uniforms.compute)
        .computeFn()
        .compute(grassBlades),
      reset: createResetDrawBufferCompute(configs),
    };

    return () => {
      computeRefs.current = { main: null, reset: null };
      setGrassData(null);
      setLodBuffers([]);
    };
  }, [uniforms.compute]);

  useFrame((state) => {
    if (!computeRefs.current.main || !computeRefs.current.reset) return;

    uniforms.compute.uTime.value = state.clock.elapsedTime;

    camera.updateMatrixWorld();
    uniforms.compute.uViewProjectionMatrix.value.multiplyMatrices(
      camera.projectionMatrix,
      camera.matrixWorldInverse,
    );
    uniforms.compute.uCameraPosition.value.setFromMatrixPosition(
      camera.matrixWorld,
    );

    const renderer = gl as unknown as WebGPURenderer;
    renderer.compute(computeRefs.current.reset);
    renderer.compute(computeRefs.current.main);
  });

  return { lodBuffers, grassData };
}

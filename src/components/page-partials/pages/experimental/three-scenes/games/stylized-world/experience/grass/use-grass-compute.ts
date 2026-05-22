import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three/webgpu";
import { WebGPURenderer } from "three/webgpu";
import { storage } from "three/tsl";
import {
  BLADES_PER_AXIS,
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

const GRASS_SEGMENTS = 5;

export function useGrassCompute(
  uniforms: GrassUniforms,
  camera: THREE.Camera,
) {
  const { gl } = useThree();
  const [lodBuffer, setLodBuffer] = useState<LODBufferConfig | null>(null);
  const computeRefs = useRef<{ main: THREE.ComputeNode | null; reset: THREE.ComputeNode | null }>({
    main: null,
    reset: null,
  });
  const grassDataRef = useRef<ReturnType<typeof createGrassData> | null>(null);

  useEffect(() => {
    const grassBlades = BLADES_PER_AXIS * BLADES_PER_AXIS;
    const grassData = createGrassData(grassBlades);
    grassDataRef.current = grassData;

    const geo = createBladeGeometry(GRASS_SEGMENTS);
    const vertexCount = geo.index ? geo.index.count : geo.attributes.position.count;
    geo.dispose();

    const drawBuffer = new THREE.IndirectStorageBufferAttribute(
      new Uint32Array(5),
      5,
    );
    const drawStorage = storage(drawBuffer, drawIndirectStructure, 1);
    const config: LODBufferConfig = {
      segments: GRASS_SEGMENTS,
      minDistance: 0,
      maxDistance: Infinity,
      indices: createVisibleIndicesBuffer(grassBlades),
      drawBuffer,
      drawStorage,
      vertexCount,
    };
    setLodBuffer(config);

    computeRefs.current = {
      main: createGrassCompute(grassData, config, uniforms.compute)
        .computeFn()
        .compute(grassBlades),
      reset: createResetDrawBufferCompute(config),
    };

    return () => {
      computeRefs.current = { main: null, reset: null };
      grassDataRef.current = null;
      setLodBuffer(null);
    };
  }, [uniforms.compute]);

  useFrame(() => {
    if (!computeRefs.current.main || !computeRefs.current.reset) return;

    camera.updateMatrixWorld();
    uniforms.compute.uViewProjectionMatrix.value.multiplyMatrices(
      camera.projectionMatrix,
      camera.matrixWorldInverse,
    );
    uniforms.compute.uCameraPosition.value.setFromMatrixPosition(camera.matrixWorld);

    const renderer = gl as unknown as WebGPURenderer;
    renderer.compute(computeRefs.current.reset);
    renderer.compute(computeRefs.current.main);
  });

  return {
    lodBuffer,
    grassData: grassDataRef.current,
  };
}

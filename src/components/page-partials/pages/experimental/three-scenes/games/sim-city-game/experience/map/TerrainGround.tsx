import { ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import {
  createDisplacedTerrainGeometry,
  MountainHeightData,
} from "./createMapTextures";
import { simCityRenderConfig } from "../../sim-city.config";

type TerrainGroundProps = {
  heightData: MountainHeightData;
  mapSize: { width: number; height: number };
  onPointerMove?: (event: ThreeEvent<PointerEvent>) => void;
  onPointerOut?: (event: ThreeEvent<PointerEvent>) => void;
  onPointerDown?: (event: ThreeEvent<PointerEvent>) => void;
};

export function TerrainGround({
  heightData,
  mapSize,
  onPointerMove,
  onPointerOut,
  onPointerDown,
}: TerrainGroundProps) {
  const geometry = useMemo(
    () =>
      createDisplacedTerrainGeometry(
        mapSize,
        heightData.field,
        heightData.width,
        heightData.height,
        simCityRenderConfig.terrainSegments,
        heightData.maxHeight,
      ),
    [heightData, mapSize],
  );

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.88,
        metalness: 0.02,
      }),
    [],
  );

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  return (
    <mesh
      geometry={geometry}
      material={material}
      position={[
        mapSize.width / 2,
        simCityRenderConfig.terrainGroundY,
        mapSize.height / 2,
      ]}
      receiveShadow
      castShadow
      frustumCulled={false}
      onPointerMove={onPointerMove}
      onPointerOut={onPointerOut}
      onPointerDown={onPointerDown}
    />
  );
}

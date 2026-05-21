import { ThreeEvent } from "@react-three/fiber";
import { useMemo } from "react";
import { simCityRenderConfig } from "../../sim-city.config";
import {
  BuildingTypeId,
  getBuildingDefinition,
} from "../utils/buildingCatalog";
import { PlacedBuilding } from "../utils/buildings";
import {
  getTerrainHeightAtTile,
  MountainHeightData,
} from "./createMapTextures";
import {
  tileToMapGroupPosition,
  worldToTileIndex,
} from "./mapGridCoords";

type BuildingMeshesProps = {
  buildings: PlacedBuilding[];
  heightData: MountainHeightData;
  mapSize: { width: number; height: number };
};

export function BuildingMeshes({
  buildings,
  heightData,
  mapSize,
}: BuildingMeshesProps) {
  const meshes = useMemo(
    () =>
      buildings.map((building) => {
        const definition = getBuildingDefinition(building.type);
        const [x, , z] = tileToMapGroupPosition(
          building.x,
          building.y,
          mapSize.width,
          mapSize.height,
        );
        const elevation = getTerrainHeightAtTile(
          heightData,
          building.x,
          building.y,
        );

        return {
          key: `${building.x},${building.y}`,
          color: definition.color,
          size: definition.size,
          height: definition.height,
          position: [
            x,
            simCityRenderConfig.terrainGroundY +
              elevation +
              definition.height / 2,
            z,
          ] as [number, number, number],
        };
      }),
    [buildings, heightData, mapSize.height, mapSize.width],
  );

  return (
    <group>
      {meshes.map((building) => (
        <mesh
          key={building.key}
          position={building.position}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[building.size, building.height, building.size]} />
          <meshStandardMaterial
            color={building.color}
            roughness={0.72}
            metalness={0.08}
          />
        </mesh>
      ))}
    </group>
  );
}

type PlacementPreviewProps = {
  gridX: number;
  gridY: number;
  isValid: boolean;
  buildingType: BuildingTypeId;
  heightData: MountainHeightData;
  mapSize: { width: number; height: number };
};

export function PlacementPreview({
  gridX,
  gridY,
  isValid,
  buildingType,
  heightData,
  mapSize,
}: PlacementPreviewProps) {
  const definition = getBuildingDefinition(buildingType);
  const [x, , z] = tileToMapGroupPosition(
    gridX,
    gridY,
    mapSize.width,
    mapSize.height,
  );
  const elevation = getTerrainHeightAtTile(heightData, gridX, gridY);

  return (
    <mesh
      position={[
        x,
        simCityRenderConfig.terrainGroundY + elevation + definition.height / 2,
        z,
      ]}
    >
      <boxGeometry args={[definition.size, definition.height, definition.size]} />
      <meshStandardMaterial
        color={isValid ? definition.color : "#f87171"}
        transparent
        opacity={isValid ? 0.55 : 0.45}
        depthWrite={false}
      />
    </mesh>
  );
}

export function pickTileFromTerrainEvent(
  event: ThreeEvent<PointerEvent>,
  mapSize: { width: number; height: number },
) {
  return worldToTileIndex(
    event.point.x,
    event.point.z,
    mapSize.width,
    mapSize.height,
  );
}

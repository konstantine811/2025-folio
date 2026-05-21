import { useCallback, useMemo, useState } from "react";
import { BuildingTypeId } from "../utils/buildingCatalog";
import { MapTile } from "../utils/generateMap";
import {
  createOccupiedKeys,
  PlacedBuilding,
} from "../utils/buildings";
import {
  BUILD_BLOCK_LABELS,
  BuildBlockReason,
  validateBuildingPlacement,
} from "../utils/placementRules";
import {
  BuildingMeshes,
  pickTileFromTerrainEvent,
  PlacementPreview,
} from "./BuildingLayer";
import { MountainHeightData } from "./createMapTextures";
import { TerrainGround } from "./TerrainGround";

export type BuildHoverState =
  | {
      gridX: number;
      gridY: number;
      isValid: boolean;
      reason: BuildBlockReason | null;
    }
  | null;

type BuildingPlacementProps = {
  mapData: MapTile[][];
  mapSize: { width: number; height: number };
  heightData: MountainHeightData;
  buildings: PlacedBuilding[];
  selectedBuildingType: BuildingTypeId | null;
  onBuildingsChange: (buildings: PlacedBuilding[]) => void;
  onHoverChange?: (hover: BuildHoverState) => void;
};

export function BuildingPlacement({
  mapData,
  mapSize,
  heightData,
  buildings,
  selectedBuildingType,
  onBuildingsChange,
  onHoverChange,
}: BuildingPlacementProps) {
  const enabled = selectedBuildingType !== null;
  const [hoverTile, setHoverTile] = useState<BuildHoverState>(null);
  const occupiedKeys = useMemo(() => createOccupiedKeys(buildings), [buildings]);

  const updateHover = useCallback(
    (next: BuildHoverState) => {
      setHoverTile(next);
      onHoverChange?.(next);
    },
    [onHoverChange],
  );

  const handlePointerMove = useCallback(
    (event: Parameters<typeof pickTileFromTerrainEvent>[0]) => {
      if (!enabled) {
        updateHover(null);
        return;
      }

      event.stopPropagation();
      const tile = pickTileFromTerrainEvent(event, mapSize);

      if (!tile) {
        updateHover(null);
        return;
      }

      const validation = validateBuildingPlacement(
        mapData,
        tile.x,
        tile.y,
        occupiedKeys,
      );

      updateHover({
        gridX: tile.x,
        gridY: tile.y,
        isValid: validation.ok,
        reason: validation.ok ? null : validation.reason,
      });
    },
    [enabled, mapData, mapSize, occupiedKeys, updateHover],
  );

  const handlePointerOut = useCallback(() => {
    updateHover(null);
  }, [updateHover]);

  const handlePointerDown = useCallback(
    (event: Parameters<typeof pickTileFromTerrainEvent>[0]) => {
      if (!enabled || !selectedBuildingType || event.button !== 0) {
        return;
      }

      event.stopPropagation();
      const tile = pickTileFromTerrainEvent(event, mapSize);

      if (!tile) {
        return;
      }

      const validation = validateBuildingPlacement(
        mapData,
        tile.x,
        tile.y,
        occupiedKeys,
      );

      if (!validation.ok) {
        return;
      }

      onBuildingsChange([
        ...buildings,
        { x: tile.x, y: tile.y, type: selectedBuildingType },
      ]);
    },
    [
      buildings,
      enabled,
      mapData,
      mapSize,
      occupiedKeys,
      onBuildingsChange,
      selectedBuildingType,
    ],
  );

  return (
    <>
      <TerrainGround
        heightData={heightData}
        mapSize={mapSize}
        onPointerMove={enabled ? handlePointerMove : undefined}
        onPointerOut={enabled ? handlePointerOut : undefined}
        onPointerDown={enabled ? handlePointerDown : undefined}
      />
      <BuildingMeshes
        buildings={buildings}
        heightData={heightData}
        mapSize={mapSize}
      />
      {enabled && hoverTile && selectedBuildingType && (
        <PlacementPreview
          gridX={hoverTile.gridX}
          gridY={hoverTile.gridY}
          isValid={hoverTile.isValid}
          buildingType={selectedBuildingType}
          heightData={heightData}
          mapSize={mapSize}
        />
      )}
    </>
  );
}

export { BUILD_BLOCK_LABELS };

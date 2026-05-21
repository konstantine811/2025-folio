import { useMemo } from "react";
import { BuildingTypeId } from "./utils/buildingCatalog";
import { MapTile } from "./utils/generateMap";
import { PlacedBuilding } from "./utils/buildings";
import { simCityRenderConfig } from "../sim-city.config";
import { BuildingPlacement } from "./map/BuildingPlacement";
import { createMountainHeightField } from "./map/createMapTextures";
import { WaterSurface } from "./map/WaterSurface";

type RenderedMapProps = {
  mapData: MapTile[][];
  buildings: PlacedBuilding[];
  selectedBuildingType: BuildingTypeId | null;
  onBuildingsChange: (buildings: PlacedBuilding[]) => void;
  onBuildHoverChange?: Parameters<
    typeof BuildingPlacement
  >[0]["onHoverChange"];
};

export function RenderedMap({
  mapData,
  buildings,
  selectedBuildingType,
  onBuildingsChange,
  onBuildHoverChange,
}: RenderedMapProps) {
  const mapSize = useMemo(() => {
    const width = mapData.length;
    const height = mapData[0]?.length ?? 0;
    return { width, height };
  }, [mapData]);

  const heightData = useMemo(
    () =>
      createMountainHeightField(
        mapData,
        simCityRenderConfig.mountainDensityBlurRadius,
        simCityRenderConfig.mountainMaxHeight,
        simCityRenderConfig.mountainPeakPower,
        simCityRenderConfig.riverCarveBlurRadius,
        simCityRenderConfig.riverBedHeight,
        simCityRenderConfig.riverPlainDilateRadius,
      ),
    [mapData],
  );

  return (
    <group
      position={[-mapSize.width / 2, 0, -mapSize.height / 2]}
      frustumCulled={false}
    >
      <BuildingPlacement
        mapData={mapData}
        mapSize={mapSize}
        heightData={heightData}
        buildings={buildings}
        selectedBuildingType={selectedBuildingType}
        onBuildingsChange={onBuildingsChange}
        onHoverChange={onBuildHoverChange}
      />
      <WaterSurface
        heightData={heightData}
        mapData={mapData}
        mapSize={mapSize}
      />
    </group>
  );
}

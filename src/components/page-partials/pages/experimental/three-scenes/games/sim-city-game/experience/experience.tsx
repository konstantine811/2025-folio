import { useCallback } from "react";
import { BuildingTypeId } from "./utils/buildingCatalog";
import { MapTile } from "./utils/generateMap";
import { PlacedBuilding } from "./utils/buildings";
import { BUILD_BLOCK_LABELS } from "./utils/placementRules";
import { CameraControls, Environment } from "@react-three/drei";
import { RenderedMap } from "./map";
import { BuildHoverState } from "./map/BuildingPlacement";

type ExperienceProps = {
  mapData: MapTile[][] | null;
  buildings: PlacedBuilding[];
  selectedBuildingType: BuildingTypeId | null;
  onBuildingsChange: (buildings: PlacedBuilding[]) => void;
  onBuildHoverChange?: (hover: BuildHoverState) => void;
};

const Experience = ({
  mapData,
  buildings,
  selectedBuildingType,
  onBuildingsChange,
  onBuildHoverChange,
}: ExperienceProps) => {
  const handleBuildHoverChange = useCallback(
    (hover: BuildHoverState) => {
      onBuildHoverChange?.(hover);
    },
    [onBuildHoverChange],
  );

  if (!mapData) {
    return null;
  }

  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight
        castShadow
        position={[80, 120, 40]}
        intensity={1.35}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-160}
        shadow-camera-right={160}
        shadow-camera-top={160}
        shadow-camera-bottom={-160}
        shadow-camera-near={1}
        shadow-camera-far={300}
      />
      <RenderedMap
        mapData={mapData}
        buildings={buildings}
        selectedBuildingType={selectedBuildingType}
        onBuildingsChange={onBuildingsChange}
        onBuildHoverChange={handleBuildHoverChange}
      />
      <Environment preset="sunset" />
      <CameraControls makeDefault />
    </>
  );
};

export default Experience;

export { BUILD_BLOCK_LABELS };
export type { BuildHoverState };

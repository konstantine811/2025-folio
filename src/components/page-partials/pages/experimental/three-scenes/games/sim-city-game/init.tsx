import MainWrapperOffset from "@/components/ui-abc/main-wrapper-offset";
import { Suspense, useState } from "react";
import ThreeLoader from "../../common/three-loader";
import { Canvas } from "@react-three/fiber";
import { BuildPanel } from "./build-panel/BuildPanel";
import Experience, {
  BUILD_BLOCK_LABELS,
  BuildHoverState,
} from "./experience/experience";
import {
  BUILDING_CATALOG,
  BuildingTypeId,
} from "./experience/utils/buildingCatalog";
import { MapEditorPanel } from "./map-editor/MapEditorPanel";
import {
  PlacedBuilding,
  sanitizeBuildingsForMap,
} from "./experience/utils/buildings";
import { MapTile } from "./experience/utils/generateMap";

function Init() {
  const [mapData, setMapData] = useState<MapTile[][] | null>(null);
  const [buildings, setBuildings] = useState<PlacedBuilding[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(true);
  const [selectedBuildingType, setSelectedBuildingType] =
    useState<BuildingTypeId | null>(null);
  const [buildHover, setBuildHover] = useState<BuildHoverState>(null);

  const handleGenerateMap = (nextMapData: MapTile[][]) => {
    setMapData(nextMapData);
    setBuildings((current) => sanitizeBuildingsForMap(current, nextMapData));
  };

  const buildModeActive =
    selectedBuildingType !== null && !isEditorOpen && mapData !== null;

  const selectedBuildingLabel = BUILDING_CATALOG.find(
    (definition) => definition.id === selectedBuildingType,
  )?.label;

  const hoverLabel =
    buildHover && !buildHover.isValid && buildHover.reason
      ? BUILD_BLOCK_LABELS[buildHover.reason]
      : buildHover?.isValid
        ? `Place ${selectedBuildingLabel ?? "building"}`
        : null;

  return (
    <MainWrapperOffset isFullHeight className="flex min-h-0 flex-1 flex-col">
      <div className="relative min-h-0 flex-1">
        <ThreeLoader />
        <Canvas
          className="!absolute inset-0 touch-none"
          style={{ width: "100%", height: "100%" }}
          camera={{ position: [40, 30, 50], fov: 50, near: 0.5, far: 500 }}
          gl={{ logarithmicDepthBuffer: true }}
          shadows
        >
          <color attach="background" args={["#131017"]} />
          <Suspense fallback={null}>
            <Experience
              mapData={mapData}
              buildings={buildings}
              selectedBuildingType={
                isEditorOpen ? null : selectedBuildingType
              }
              onBuildingsChange={setBuildings}
              onBuildHoverChange={setBuildHover}
            />
          </Suspense>
        </Canvas>

        {isEditorOpen ? (
          <MapEditorPanel
            onGenerate={handleGenerateMap}
            onClose={() => setIsEditorOpen(false)}
          />
        ) : (
          <>
            <div className="absolute left-4 top-4 z-20">
              <button
                type="button"
                onClick={() => setIsEditorOpen(true)}
                className="rounded-md border border-white/15 bg-[#1a1522]/90 px-4 py-2 text-sm font-medium text-white shadow-lg backdrop-blur-sm transition hover:bg-[#1a1522]"
              >
                Map editor
              </button>
            </div>

            {mapData && (
              <BuildPanel
                selectedType={selectedBuildingType}
                onSelectType={setSelectedBuildingType}
                buildingCount={buildings.length}
                onClearBuildings={() => setBuildings([])}
              />
            )}
          </>
        )}

        {buildModeActive && (
          <p className="pointer-events-none absolute bottom-4 left-4 z-10 max-w-xs rounded-md border border-white/10 bg-[#1a1522]/85 px-3 py-2 text-xs text-white/70 backdrop-blur-sm">
            Click grass tiles to place {selectedBuildingLabel?.toLowerCase()}.
            Water and mountains are blocked.
          </p>
        )}

        {!isEditorOpen && mapData && !selectedBuildingType && (
          <p className="pointer-events-none absolute bottom-4 left-4 z-10 max-w-xs rounded-md border border-white/10 bg-[#1a1522]/85 px-3 py-2 text-xs text-white/70 backdrop-blur-sm">
            Select a test cube from the Buildings panel on the right.
          </p>
        )}

        {buildModeActive && hoverLabel && (
          <p className="pointer-events-none absolute bottom-24 left-1/2 z-10 -translate-x-1/2 rounded-md border border-white/10 bg-[#1a1522]/90 px-4 py-2 text-sm text-white shadow-lg backdrop-blur-sm">
            {hoverLabel}
          </p>
        )}
      </div>
    </MainWrapperOffset>
  );
}

export default Init;

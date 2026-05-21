import { BuildingTypeId } from "./buildingCatalog";
import { MapTile } from "./generateMap";
import { tileKey, validateBuildingPlacement } from "./placementRules";

export type PlacedBuilding = {
  x: number;
  y: number;
  type: BuildingTypeId;
};

export function filterValidBuildings(
  buildings: PlacedBuilding[],
  mapData: MapTile[][],
): PlacedBuilding[] {
  const occupied = new Set<string>();

  return buildings.filter((building) => {
    const validation = validateBuildingPlacement(
      mapData,
      building.x,
      building.y,
      occupied,
    );

    if (!validation.ok) {
      return false;
    }

    occupied.add(tileKey(building.x, building.y));
    return true;
  });
}

export function createOccupiedKeys(buildings: PlacedBuilding[]) {
  return new Set(buildings.map((building) => tileKey(building.x, building.y)));
}

export function sanitizeBuildingsForMap(
  buildings: PlacedBuilding[],
  mapData: MapTile[][],
) {
  return filterValidBuildings(buildings, mapData);
}

export type BuildingTypeId = "cube-red" | "cube-blue" | "cube-green" | "cube-yellow";

export type BuildingDefinition = {
  id: BuildingTypeId;
  label: string;
  color: string;
  size: number;
  height: number;
};

export const BUILDING_CATALOG: BuildingDefinition[] = [
  {
    id: "cube-red",
    label: "Red cube",
    color: "#c45c42",
    size: 0.85,
    height: 0.9,
  },
  {
    id: "cube-blue",
    label: "Blue cube",
    color: "#4a7fd4",
    size: 0.85,
    height: 0.9,
  },
  {
    id: "cube-green",
    label: "Green cube",
    color: "#4caf6a",
    size: 0.85,
    height: 0.9,
  },
  {
    id: "cube-yellow",
    label: "Yellow cube",
    color: "#d4a832",
    size: 0.85,
    height: 1.1,
  },
];

export const BUILDING_BY_ID = Object.fromEntries(
  BUILDING_CATALOG.map((definition) => [definition.id, definition]),
) as Record<BuildingTypeId, BuildingDefinition>;

export function getBuildingDefinition(type: BuildingTypeId) {
  return BUILDING_BY_ID[type];
}

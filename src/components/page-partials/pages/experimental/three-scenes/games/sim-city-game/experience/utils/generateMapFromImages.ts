import { MapTile, TileResource } from "./generateMap";
import { getPixelRgba, ImagePixelData } from "./loadImagePixelData";
import { matchResourceType, matchTerrainType } from "./mapImagePalette";

function resolveResource(
  terrainType: MapTile["type"],
  resource: TileResource,
): TileResource {
  if (resource === "wood" && terrainType !== "grass") {
    return null;
  }

  if (resource === "iron" && terrainType !== "mountain") {
    return null;
  }

  return resource;
}

export function generateMapFromImages(
  terrainImage: ImagePixelData,
  resourcesImage: ImagePixelData,
): MapTile[][] {
  const width = terrainImage.width;
  const height = terrainImage.height;

  if (resourcesImage.width !== width || resourcesImage.height !== height) {
    throw new Error(
      `Terrain (${width}x${height}) and resources (${resourcesImage.width}x${resourcesImage.height}) PNG sizes must match`,
    );
  }

  const grid: MapTile[][] = [];

  for (let x = 0; x < width; x++) {
    grid[x] = [];
    for (let y = 0; y < height; y++) {
      const [tr, tg, tb] = getPixelRgba(terrainImage, x, y);
      const [rr, rg, rb, ra] = getPixelRgba(resourcesImage, x, y);

      const type = matchTerrainType(tr, tg, tb);
      const rawResource =
        ra < 16 ? null : matchResourceType(rr, rg, rb);
      const resource = resolveResource(type, rawResource);

      grid[x][y] = { x, y, type, resource };
    }
  }

  return grid;
}

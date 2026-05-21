import { createNoise2D } from "simplex-noise";

const simplex = createNoise2D();

export type TileType = "grass" | "water" | "mountain";
export type TileResource = "iron" | "wood" | null;

export type MapTile = {
  x: number;
  y: number;
  type: TileType;
  resource: TileResource;
};

export const generateMapData = (
  width: number,
  height: number,
): MapTile[][] => {
  const grid: MapTile[][] = [];
  for (let x = 0; x < width; x++) {
    grid[x] = [];
    for (let y = 0; y < height; y++) {
      const noiseValue = simplex(x / 20, y / 20);

      let type: TileType = "grass";
      let resource: TileResource = null;

      if (noiseValue < -0.2) {
        type = "water";
      } else if (noiseValue > 0.4) {
        type = "mountain";
        if (Math.random() > 0.7) resource = "iron";
      } else {
        if (Math.random() > 0.85) resource = "wood";
      }

      grid[x][y] = { x, y, type, resource };
    }
  }
  return grid;
};
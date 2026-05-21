import { TileResource, TileType } from "./generateMap";

export type RgbColor = {
  r: number;
  g: number;
  b: number;
};

/** Paint these exact colors in your terrain PNG (1 pixel = 1 tile). */
export const TERRAIN_PALETTE: Record<TileType, RgbColor> = {
  water: { r: 34, g: 68, b: 255 },
  grass: { r: 68, g: 170, b: 68 },
  mountain: { r: 120, g: 120, b: 120 },
};

/** Black = no resource. Paint wood/iron only where resources should spawn. */
export const RESOURCE_PALETTE: Record<Exclude<TileResource, null>, RgbColor> =
  {
    wood: { r: 139, g: 90, b: 43 },
    iron: { r: 180, g: 60, b: 60 },
  };

export const RESOURCE_EMPTY_COLOR: RgbColor = { r: 0, g: 0, b: 0 };

export function rgbToCss({ r, g, b }: RgbColor) {
  return `rgb(${r}, ${g}, ${b})`;
}

const COLOR_MATCH_THRESHOLD = 96;

function colorDistance(a: RgbColor, r: number, g: number, b: number) {
  const dr = a.r - r;
  const dg = a.g - g;
  const db = a.b - b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

export function matchTerrainType(r: number, g: number, b: number): TileType {
  let bestType: TileType = "grass";
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const [type, color] of Object.entries(TERRAIN_PALETTE) as [
    TileType,
    RgbColor,
  ][]) {
    const distance = colorDistance(color, r, g, b);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestType = type;
    }
  }

  return bestDistance <= COLOR_MATCH_THRESHOLD ? bestType : "grass";
}

export function matchResourceType(
  r: number,
  g: number,
  b: number,
): TileResource {
  if (colorDistance(RESOURCE_EMPTY_COLOR, r, g, b) <= 32) {
    return null;
  }

  let bestResource: TileResource = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const [resource, color] of Object.entries(RESOURCE_PALETTE) as [
    Exclude<TileResource, null>,
    RgbColor,
  ][]) {
    const distance = colorDistance(color, r, g, b);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestResource = resource;
    }
  }

  return bestDistance <= COLOR_MATCH_THRESHOLD ? bestResource : null;
}

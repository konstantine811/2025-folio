import * as THREE from "three";
import { MapTile } from "../utils/generateMap";
import { planeLocalToGridUv } from "./mapGridCoords";

const GRASS_RGB: [number, number, number] = [0x55, 0x7a, 0x46];
const WATER_RGB: [number, number, number] = [0x1a, 0x28, 0x38];
const FOOT_RGB: [number, number, number] = [0x6b, 0x5a, 0x3a];
const ROCK_RGB: [number, number, number] = [0x5a, 0x62, 0x6e];
const PEAK_RGB: [number, number, number] = [0xc8, 0xd4, 0xdc];

function lerpByte(a: number, b: number, t: number) {
  return Math.round(a + (b - a) * t);
}

function lerpRgb(
  a: [number, number, number],
  b: [number, number, number],
  t: number,
): [number, number, number] {
  const clamped = Math.min(1, Math.max(0, t));
  return [
    lerpByte(a[0], b[0], clamped),
    lerpByte(a[1], b[1], clamped),
    lerpByte(a[2], b[2], clamped),
  ];
}

function mountainColorByHeight(t: number): [number, number, number] {
  if (t < 0.18) {
    return lerpRgb(GRASS_RGB, FOOT_RGB, t / 0.18);
  }

  if (t < 0.55) {
    return lerpRgb(FOOT_RGB, ROCK_RGB, (t - 0.18) / 0.37);
  }

  return lerpRgb(ROCK_RGB, PEAK_RGB, (t - 0.55) / 0.45);
}

function boxBlurScalar(
  source: Float32Array,
  width: number,
  height: number,
  radius: number,
) {
  const temp = new Float32Array(source.length);
  const output = new Float32Array(source.length);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let sum = 0;
      let count = 0;

      for (let dx = -radius; dx <= radius; dx += 1) {
        const sx = Math.min(width - 1, Math.max(0, x + dx));
        sum += source[y * width + sx];
        count += 1;
      }

      temp[y * width + x] = sum / count;
    }
  }

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let sum = 0;
      let count = 0;

      for (let dy = -radius; dy <= radius; dy += 1) {
        const sy = Math.min(height - 1, Math.max(0, y + dy));
        sum += temp[sy * width + x];
        count += 1;
      }

      output[y * width + x] = sum / count;
    }
  }

  return output;
}

function dilateScalar(
  source: Float32Array,
  width: number,
  height: number,
  radius: number,
) {
  const output = new Float32Array(source.length);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let maxValue = 0;

      for (let dy = -radius; dy <= radius; dy += 1) {
        for (let dx = -radius; dx <= radius; dx += 1) {
          const sx = Math.min(width - 1, Math.max(0, x + dx));
          const sy = Math.min(height - 1, Math.max(0, y + dy));
          maxValue = Math.max(maxValue, source[sy * width + sx]);
        }
      }

      output[y * width + x] = maxValue;
    }
  }

  return output;
}

function sampleFieldBilinear(
  field: Float32Array,
  width: number,
  height: number,
  u: number,
  v: number,
) {
  const x = Math.min(width - 1, Math.max(0, u * (width - 1)));
  const y = Math.min(height - 1, Math.max(0, v * (height - 1)));

  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const x1 = Math.min(width - 1, x0 + 1);
  const y1 = Math.min(height - 1, y0 + 1);

  const tx = x - x0;
  const ty = y - y0;

  const v00 = field[y0 * width + x0];
  const v10 = field[y0 * width + x1];
  const v01 = field[y1 * width + x0];
  const v11 = field[y1 * width + x1];

  const top = v00 + (v10 - v00) * tx;
  const bottom = v01 + (v11 - v01) * tx;

  return top + (bottom - top) * ty;
}

export function createMountainHeightField(
  mapData: MapTile[][],
  blurRadius: number,
  maxHeight: number,
  peakPower = 0.92,
  riverCarveBlurRadius = 8,
  riverBedHeight = -1.2,
  riverPlainDilateRadius = 2,
) {
  const width = mapData.length;
  const height = mapData[0]?.length ?? 0;
  const raw = new Float32Array(width * height);
  const waterRaw = new Float32Array(width * height);

  for (let x = 0; x < width; x += 1) {
    for (let y = 0; y < height; y += 1) {
      const tileType = mapData[x][y]?.type;
      const index = y * width + x;
      raw[index] = tileType === "mountain" ? 1 : 0;
      waterRaw[index] = tileType === "water" ? 1 : 0;
    }
  }

  const density = boxBlurScalar(raw, width, height, blurRadius);
  const heights = new Float32Array(width * height);

  for (let index = 0; index < density.length; index += 1) {
    const shaped = Math.pow(Math.min(1, Math.max(0, density[index])), peakPower);
    heights[index] = shaped * maxHeight;
  }

  const riverChannel = dilateScalar(
    waterRaw,
    width,
    height,
    riverPlainDilateRadius,
  );
  const bankBlend = boxBlurScalar(
    waterRaw,
    width,
    height,
    riverCarveBlurRadius,
  );

  for (let index = 0; index < heights.length; index += 1) {
    const mountainHeight = heights[index];

    if (riverChannel[index] >= 1) {
      heights[index] = riverBedHeight;
      continue;
    }

    const blend = Math.min(1, Math.max(0, bankBlend[index]));
    heights[index] = mountainHeight * (1 - blend) + riverBedHeight * blend;
  }

  return { field: heights, width, height, maxHeight };
}

export type MountainHeightData = {
  field: Float32Array;
  width: number;
  height: number;
  maxHeight: number;
};

export function getTerrainHeightAtTile(
  heightData: MountainHeightData,
  gridX: number,
  gridY: number,
) {
  const u = (gridX + 0.5) / heightData.width;
  const v = (gridY + 0.5) / heightData.height;

  return sampleFieldBilinear(
    heightData.field,
    heightData.width,
    heightData.height,
    u,
    v,
  );
}

function createDisplacedSurfaceGeometry(
  mapSize: { width: number; height: number },
  heightField: Float32Array,
  fieldWidth: number,
  fieldHeight: number,
  segments: number,
  options: {
    surfaceOffset?: number;
    colorByHeight?: boolean;
    maxHeight?: number;
  } = {},
) {
  const {
    surfaceOffset = 0,
    colorByHeight = false,
    maxHeight = 1,
  } = options;

  const plane = new THREE.PlaneGeometry(
    mapSize.width,
    mapSize.height,
    segments,
    segments,
  );

  const positions = plane.attributes.position;
  const colors = colorByHeight
    ? new Float32Array(positions.count * 3)
    : null;

  for (let index = 0; index < positions.count; index += 1) {
    const localX = positions.getX(index);
    const localY = positions.getY(index);
    const [u, v] = planeLocalToGridUv(
      localX,
      localY,
      mapSize.width,
      mapSize.height,
    );
    const elevation = sampleFieldBilinear(
      heightField,
      fieldWidth,
      fieldHeight,
      u,
      v,
    );

    positions.setZ(index, elevation + surfaceOffset);

    if (colors) {
      const heightT =
        maxHeight > 0 ? Math.max(0, elevation) / maxHeight : 0;
      const [r, g, b] =
        heightT > 0.03 ? mountainColorByHeight(heightT) : GRASS_RGB;

      colors[index * 3] = r / 255;
      colors[index * 3 + 1] = g / 255;
      colors[index * 3 + 2] = b / 255;
    }
  }

  positions.needsUpdate = true;

  if (colors) {
    plane.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  }

  plane.computeVertexNormals();
  plane.rotateX(-Math.PI / 2);

  return plane;
}

export function createDisplacedTerrainGeometry(
  mapSize: { width: number; height: number },
  heightField: Float32Array,
  fieldWidth: number,
  fieldHeight: number,
  segments: number,
  maxHeight: number,
) {
  return createDisplacedSurfaceGeometry(
    mapSize,
    heightField,
    fieldWidth,
    fieldHeight,
    segments,
    { colorByHeight: true, maxHeight },
  );
}

export function createDisplacedWaterGeometry(
  mapSize: { width: number; height: number },
  heightField: Float32Array,
  fieldWidth: number,
  fieldHeight: number,
  segments: number,
  surfaceOffset: number,
) {
  return createDisplacedSurfaceGeometry(
    mapSize,
    heightField,
    fieldWidth,
    fieldHeight,
    segments,
    { surfaceOffset },
  );
}

function boxBlurRgb(
  source: Uint8Array,
  width: number,
  height: number,
  radius: number,
) {
  const channels = 3;
  const temp = new Float32Array(source.length);
  const output = new Float32Array(source.length);

  for (let channel = 0; channel < channels; channel += 1) {
    const plane = new Float32Array(width * height);

    for (let index = 0; index < width * height; index += 1) {
      plane[index] = source[index * channels + channel];
    }

    const blurred = boxBlurScalar(plane, width, height, radius);

    for (let index = 0; index < width * height; index += 1) {
      temp[index * channels + channel] = blurred[index];
    }
  }

  for (let index = 0; index < source.length; index += 1) {
    output[index] = temp[index];
  }

  return output;
}

export function createTerrainColorTexture(
  mapData: MapTile[][],
  heightField: Float32Array,
  maxHeight: number,
  blurRadius = 2,
) {
  const width = mapData.length;
  const height = mapData[0]?.length ?? 0;
  const raw = new Uint8Array(width * height * 3);

  for (let x = 0; x < width; x += 1) {
    for (let y = 0; y < height; y += 1) {
      const tile = mapData[x][y];
      const index = (y * width + x) * 3;
      const heightT =
        maxHeight > 0 ? heightField[y * width + x] / maxHeight : 0;

      let rgb: [number, number, number];

      if (tile?.type === "water") {
        rgb = WATER_RGB;
      } else if (heightT > 0.03) {
        rgb = mountainColorByHeight(heightT);
      } else {
        rgb = GRASS_RGB;
      }

      raw[index] = rgb[0];
      raw[index + 1] = rgb[1];
      raw[index + 2] = rgb[2];
    }
  }

  const blurred = boxBlurRgb(raw, width, height, blurRadius);
  const data = new Uint8Array(width * height * 4);

  for (let index = 0; index < width * height; index += 1) {
    data[index * 4] = blurred[index * 3];
    data[index * 4 + 1] = blurred[index * 3 + 1];
    data[index * 4 + 2] = blurred[index * 3 + 2];
    data[index * 4 + 3] = 255;
  }

  const texture = new THREE.DataTexture(data, width, height, THREE.RGBAFormat);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;

  return texture;
}

export function createSmoothedWaterMaskTexture(
  mapData: MapTile[][],
  blurRadius = 3,
) {
  const width = mapData.length;
  const height = mapData[0]?.length ?? 0;
  const raw = new Float32Array(width * height);

  for (let x = 0; x < width; x += 1) {
    for (let y = 0; y < height; y += 1) {
      raw[y * width + x] = mapData[x][y]?.type === "water" ? 1 : 0;
    }
  }

  const blurred = boxBlurScalar(raw, width, height, blurRadius);
  const data = new Uint8Array(width * height);

  for (let index = 0; index < blurred.length; index += 1) {
    data[index] = Math.round(Math.min(1, Math.max(0, blurred[index])) * 255);
  }

  const texture = new THREE.DataTexture(data, width, height, THREE.RedFormat);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;

  return texture;
}

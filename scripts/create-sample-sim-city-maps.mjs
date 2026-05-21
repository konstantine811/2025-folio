import { mkdirSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { deflateSync } from "zlib";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputDir = join(__dirname, "../public/maps/sim-city");

const TERRAIN = {
  water: [34, 68, 255],
  grass: [68, 170, 68],
  mountain: [120, 120, 120],
};

const RESOURCES = {
  empty: [0, 0, 0],
  wood: [139, 90, 43],
  iron: [180, 60, 60],
};

const SIZE = 256;

function crc32(buffer) {
  let crc = 0xffffffff;

  for (let i = 0; i < buffer.length; i += 1) {
    crc ^= buffer[i];
    for (let j = 0; j < 8; j += 1) {
      crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
    }
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const crcInput = Buffer.concat([typeBuffer, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcInput), 0);

  return Buffer.concat([length, typeBuffer, data, crc]);
}

function createPng(width, height, getColor) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8);
  ihdr.writeUInt8(2, 9);
  ihdr.writeUInt8(0, 10);
  ihdr.writeUInt8(0, 11);
  ihdr.writeUInt8(0, 12);

  const rowSize = width * 3 + 1;
  const raw = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y += 1) {
    const rowOffset = y * rowSize;
    raw[rowOffset] = 0;

    for (let x = 0; x < width; x += 1) {
      const [r, g, b] = getColor(x, y);
      const pixelOffset = rowOffset + 1 + x * 3;
      raw[pixelOffset] = r;
      raw[pixelOffset + 1] = g;
      raw[pixelOffset + 2] = b;
    }
  }

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", deflateSync(raw)),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

function terrainColor(x, y) {
  const centerX = SIZE / 2;
  const centerY = SIZE / 2;
  const dx = x - centerX;
  const dy = y - centerY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  const riverWave = Math.sin(y / 14) * 18;
  const riverDistance = Math.abs(x - centerX - riverWave);
  if (riverDistance < 7) {
    return TERRAIN.water;
  }

  if (distance > SIZE * 0.34) {
    return TERRAIN.mountain;
  }

  if (distance > SIZE * 0.28 && (x + y) % 17 < 6) {
    return TERRAIN.mountain;
  }

  return TERRAIN.grass;
}

function resourcesColor(x, y) {
  const [tr, tg, tb] = terrainColor(x, y);
  const isGrass =
    tr === TERRAIN.grass[0] && tg === TERRAIN.grass[1] && tb === TERRAIN.grass[2];
  const isMountain =
    tr === TERRAIN.mountain[0] &&
    tg === TERRAIN.mountain[1] &&
    tb === TERRAIN.mountain[2];

  if (isGrass && (x * 17 + y * 31) % 53 === 0) {
    return RESOURCES.wood;
  }

  if (isMountain && (x * 13 + y * 19) % 41 === 0) {
    return RESOURCES.iron;
  }

  return RESOURCES.empty;
}

mkdirSync(outputDir, { recursive: true });

writeFileSync(
  join(outputDir, "terrain.png"),
  createPng(SIZE, SIZE, terrainColor),
);

writeFileSync(
  join(outputDir, "resources.png"),
  createPng(SIZE, SIZE, resourcesColor),
);

console.log(`Sample maps written to ${outputDir} (${SIZE}x${SIZE})`);

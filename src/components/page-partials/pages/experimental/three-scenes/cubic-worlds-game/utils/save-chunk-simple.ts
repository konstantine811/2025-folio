// save-chunks-simple.ts
import { Matrix4 } from "three";

// Побудувати payload { chunks: number[][][] } у форматі M16
export function buildChunksJson(chunks: Matrix4[][]): { chunks: number[][][] } {
  return {
    chunks: chunks.map((cell) =>
      cell.map((m) => {
        const arr = new Array<number>(16);
        m.toArray(arr); // column-major — те, що чекає Matrix4.fromArray
        return arr;
      })
    ),
  };
}

// Повернути рядок JSON (з відступами для читабельності)
export function stringifyChunksJson(
  chunks: Matrix4[][],
  pretty: number = 2
): string {
  return JSON.stringify(buildChunksJson(chunks), null, pretty);
}

// Браузер: завантажити .json файлом (проста кнопка "Save As")
export function downloadChunksJson(
  chunks: Matrix4[][],
  fileName = "chunks.json"
) {
  const json = stringifyChunksJson(chunks, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

// Node.js (опційно): зберегти на диск
export async function saveChunksJsonNode(
  chunks: Matrix4[][],
  filePath: string
) {
  const fs = await import("fs/promises");
  await fs.writeFile(filePath, stringifyChunksJson(chunks, 2), "utf-8");
}

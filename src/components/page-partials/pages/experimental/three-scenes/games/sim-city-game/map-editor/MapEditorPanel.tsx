import { useRef, useState } from "react";
import { MapTile, TileResource, TileType } from "../experience/utils/generateMap";
import { generateMapFromImages } from "../experience/utils/generateMapFromImages";
import {
  RESOURCE_EMPTY_COLOR,
  RESOURCE_PALETTE,
  RgbColor,
  TERRAIN_PALETTE,
  rgbToCss,
} from "../experience/utils/mapImagePalette";
import { simCityMapEditorConfig } from "../sim-city.config";
import { PaintCanvas, PaintCanvasHandle } from "./PaintCanvas";

type EditorLayer = "terrain" | "resources";

type MapEditorPanelProps = {
  onGenerate: (mapData: MapTile[][]) => void;
  onClose: () => void;
};

const TERRAIN_BRUSHES: { id: TileType; label: string }[] = [
  { id: "water", label: "Water" },
  { id: "grass", label: "Grass" },
  { id: "mountain", label: "Mountain" },
];

const RESOURCE_BRUSHES: { id: TileResource; label: string }[] = [
  { id: null, label: "None" },
  { id: "wood", label: "Wood" },
  { id: "iron", label: "Iron" },
];

function getResourceBrushColor(resource: TileResource): RgbColor {
  if (resource === null) {
    return RESOURCE_EMPTY_COLOR;
  }

  return RESOURCE_PALETTE[resource];
}

export function MapEditorPanel({ onGenerate, onClose }: MapEditorPanelProps) {
  const terrainCanvasRef = useRef<PaintCanvasHandle>(null);
  const resourcesCanvasRef = useRef<PaintCanvasHandle>(null);

  const [activeLayer, setActiveLayer] = useState<EditorLayer>("terrain");
  const [terrainBrush, setTerrainBrush] = useState<TileType>("grass");
  const [resourceBrush, setResourceBrush] = useState<TileResource>(null);
  const [brushSize, setBrushSize] = useState(3);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = () => {
    try {
      const terrainImage = terrainCanvasRef.current?.getPixelData();
      const resourcesImage = resourcesCanvasRef.current?.getPixelData();

      if (!terrainImage || !resourcesImage) {
        throw new Error("Editor canvases are not ready");
      }

      onGenerate(generateMapFromImages(terrainImage, resourcesImage));
      setError(null);
    } catch (generateError) {
      setError(
        generateError instanceof Error
          ? generateError.message
          : "Failed to generate map",
      );
    }
  };

  const handleClearLayer = () => {
    if (activeLayer === "terrain") {
      terrainCanvasRef.current?.fill(TERRAIN_PALETTE.grass);
      return;
    }

    resourcesCanvasRef.current?.fill(RESOURCE_EMPTY_COLOR);
  };

  return (
    <>
      <div className="pointer-events-none absolute inset-0 z-20">
        <div className="pointer-events-auto absolute left-4 top-4 flex max-h-[calc(100dvh-6rem)] w-[min(100%-2rem,420px)] flex-col gap-3 overflow-auto rounded-xl border border-white/10 bg-[#1a1522]/92 p-4 shadow-2xl backdrop-blur-md">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-white">Map editor</h2>
              <p className="text-xs text-white/60">
                Paint layers, then generate over the 3D view.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-white/15 px-2 py-1 text-xs text-white/80 transition hover:bg-white/10"
            >
              Hide
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {(["terrain", "resources"] as EditorLayer[]).map((layer) => (
              <button
                key={layer}
                type="button"
                onClick={() => setActiveLayer(layer)}
                className={`rounded-md px-3 py-1.5 text-xs capitalize transition ${
                  activeLayer === layer
                    ? "bg-emerald-600 text-white"
                    : "bg-white/10 text-white/75 hover:bg-white/15"
                }`}
              >
                {layer}
              </button>
            ))}
          </div>

          <div className={activeLayer === "terrain" ? "block" : "hidden"}>
            <PaintCanvas
              ref={terrainCanvasRef}
              size={simCityMapEditorConfig.size}
              brushColor={TERRAIN_PALETTE[terrainBrush]}
              brushSize={brushSize}
              initialFill={TERRAIN_PALETTE.grass}
              label="Terrain"
            />
          </div>

          <div className={activeLayer === "resources" ? "block" : "hidden"}>
            <PaintCanvas
              ref={resourcesCanvasRef}
              size={simCityMapEditorConfig.size}
              brushColor={getResourceBrushColor(resourceBrush)}
              brushSize={brushSize}
              initialFill={RESOURCE_EMPTY_COLOR}
              label="Resources"
            />
          </div>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-white/50">
              Brushes
            </p>
            <div className="flex flex-wrap gap-2">
              {activeLayer === "terrain"
                ? TERRAIN_BRUSHES.map((brush) => (
                    <button
                      key={brush.id}
                      type="button"
                      onClick={() => setTerrainBrush(brush.id)}
                      className={`flex items-center gap-2 rounded-md border px-2 py-1.5 text-xs transition ${
                        terrainBrush === brush.id
                          ? "border-emerald-400 bg-white/10 text-white"
                          : "border-white/10 text-white/75 hover:bg-white/5"
                      }`}
                    >
                      <span
                        className="h-3.5 w-3.5 rounded-sm border border-black/30"
                        style={{
                          backgroundColor: rgbToCss(TERRAIN_PALETTE[brush.id]),
                        }}
                      />
                      {brush.label}
                    </button>
                  ))
                : RESOURCE_BRUSHES.map((brush) => (
                    <button
                      key={brush.label}
                      type="button"
                      onClick={() => setResourceBrush(brush.id)}
                      className={`flex items-center gap-2 rounded-md border px-2 py-1.5 text-xs transition ${
                        resourceBrush === brush.id
                          ? "border-emerald-400 bg-white/10 text-white"
                          : "border-white/10 text-white/75 hover:bg-white/5"
                      }`}
                    >
                      <span
                        className="h-3.5 w-3.5 rounded-sm border border-black/30"
                        style={{
                          backgroundColor: rgbToCss(
                            getResourceBrushColor(brush.id),
                          ),
                        }}
                      />
                      {brush.label}
                    </button>
                  ))}
            </div>
          </div>

          <label className="flex flex-col gap-2 text-xs text-white/75">
            Brush size: {brushSize}
            <input
              type="range"
              min={1}
              max={simCityMapEditorConfig.maxBrushSize}
              value={brushSize}
              onChange={(event) => setBrushSize(Number(event.target.value))}
              className="w-full"
            />
          </label>

          <button
            type="button"
            onClick={handleClearLayer}
            className="rounded-md border border-white/15 px-3 py-2 text-xs text-white/80 transition hover:bg-white/10"
          >
            Clear active layer
          </button>

          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          className="pointer-events-auto absolute bottom-4 right-4 rounded-md bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-500"
        >
          Generate 3D map
        </button>
      </div>
    </>
  );
}

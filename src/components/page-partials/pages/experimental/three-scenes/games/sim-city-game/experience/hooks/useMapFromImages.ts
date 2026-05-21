import { useEffect, useState } from "react";
import { MapTile } from "../utils/generateMap";
import { generateMapFromImages } from "../utils/generateMapFromImages";
import { loadImagePixelData } from "../utils/loadImagePixelData";

type UseMapFromImagesResult = {
  mapData: MapTile[][] | null;
  isLoading: boolean;
  error: string | null;
};

export function useMapFromImages(
  terrainUrl: string,
  resourcesUrl: string,
): UseMapFromImagesResult {
  const [mapData, setMapData] = useState<MapTile[][] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setMapData(null);
    setError(null);

    void (async () => {
      try {
        const [terrainImage, resourcesImage] = await Promise.all([
          loadImagePixelData(terrainUrl),
          loadImagePixelData(resourcesUrl),
        ]);

        if (cancelled) return;

        setMapData(generateMapFromImages(terrainImage, resourcesImage));
      } catch (loadError) {
        if (cancelled) return;

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to build map from images",
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [terrainUrl, resourcesUrl]);

  return {
    mapData,
    isLoading: mapData === null && error === null,
    error,
  };
}

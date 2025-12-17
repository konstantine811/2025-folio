import { useEffect, useRef } from "react";
import mapboxgl, { Map } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useHeaderSizeStore } from "@/storage/headerSizeStore";
import { useThemeStore } from "@/storage/themeStore";
import { ThemeType } from "@/config/theme-colors.config";

const MapComponent = () => {
  const hS = useHeaderSizeStore((state) => state.size);
  const selectedTheme = useThemeStore((state) => state.selectedTheme);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Set your Mapbox access token
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

    // Get map style based on theme
    const mapStyle =
      selectedTheme === ThemeType.DARK
        ? "mapbox://styles/mapbox/dark-v11"
        : "mapbox://styles/mapbox/light-v11";

    // Initialize map
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: mapStyle,
      center: [32.36758885288441, 31.70025832790938],
      zoom: 4.709509537957899,
      pitch: 57.382643073655935,
      attributionControl: false,
      bearing: 0,
    });

    mapRef.current = map;

    // Cleanup on unmount
    return () => {
      map.remove();
    };
  }, []);

  // Update map style when theme changes
  useEffect(() => {
    if (!mapRef.current) return;

    const mapStyle =
      selectedTheme === ThemeType.DARK
        ? "mapbox://styles/mapbox/dark-v11"
        : "mapbox://styles/mapbox/light-v11";

    mapRef.current.setStyle(mapStyle);
  }, [selectedTheme]);

  return (
    <div
      ref={mapContainerRef}
      className="relative w-full"
      style={{ height: `calc(100vh - ${hS}px)`, top: hS }}
    />
  );
};

export default MapComponent;

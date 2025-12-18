import { useEffect, useRef, useState } from "react";
import mapboxgl, { Map, Marker } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useHeaderSizeStore } from "@/storage/headerSizeStore";
import { useThemeStore } from "@/storage/themeStore";
import { ThemeType, ThemePalette } from "@/config/theme-colors.config";
import MapMenu from "./menu/map-menu";
import {
  subscribeToSphereAgentPoints,
  SphereAgentPoint,
} from "@/services/firebase/sphere-agents-points";

const MapComponent = () => {
  const hS = useHeaderSizeStore((state) => state.size);
  const selectedTheme = useThemeStore((state) => state.selectedTheme);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const [isAddMode, setIsAddMode] = useState(false);
  const [points, setPoints] = useState<SphereAgentPoint[]>([]);
  const markersRef = useRef<Marker[]>([]);

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

    // Subscribe to points
    const unsubscribe = subscribeToSphereAgentPoints((updatedPoints) => {
      setPoints(updatedPoints);
    });

    // Cleanup on unmount
    return () => {
      unsubscribe();
      map.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initialize map padding after load
  useEffect(() => {
    if (!mapRef.current) return;

    const handleLoad = () => {
      // Initial padding setup
      mapRef.current?.easeTo({
        padding: { left: 0 },
        duration: 0,
      });
    };

    if (mapRef.current.loaded()) {
      handleLoad();
    } else {
      mapRef.current.once("load", handleLoad);
    }
  }, [mapRef]);

  // Update map style when theme changes
  useEffect(() => {
    if (!mapRef.current) return;

    const mapStyle =
      selectedTheme === ThemeType.DARK
        ? "mapbox://styles/mapbox/dark-v11"
        : "mapbox://styles/mapbox/light-v11";

    mapRef.current.setStyle(mapStyle);
  }, [selectedTheme]);

  // Handle add mode - change cursor
  useEffect(() => {
    if (!mapRef.current) return;

    if (isAddMode) {
      // Change cursor to crosshair
      mapRef.current.getCanvas().style.cursor = "crosshair";
    } else {
      // Reset cursor
      mapRef.current.getCanvas().style.cursor = "";
    }
  }, [isAddMode]);

  // Display points as markers
  useEffect(() => {
    if (!mapRef.current) return;

    // Get theme colors
    const themeColors = ThemePalette[selectedTheme];
    const markerBgColor = themeColors.foreground;
    const markerTextColor = themeColors.background;

    // Remove existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add new markers with dynamic sizing
    points.forEach((point) => {
      const count = point.count;
      const countText = count.toString();

      // Calculate dynamic size based on count
      // Base size for small numbers, scales with count
      const baseSize = 20;
      const padding = 5; // Padding around the number
      const minSize = baseSize;
      const maxSize = 220;

      // Calculate size: consider both number length and value
      // Use logarithmic scale for smooth growth
      const logScale = Math.log10(Math.max(1, count));
      const sizeMultiplier = 1 + logScale * 0.4; // Adjust multiplier for growth rate
      const calculatedSize = Math.min(
        maxSize,
        Math.max(minSize, baseSize * sizeMultiplier + countText.length * 4)
      );

      // Calculate font size proportionally
      const fontSize = Math.max(12, Math.min(24, calculatedSize * 0.35));

      const el = document.createElement("div");
      el.className = "cluster-marker";
      el.style.width = `${calculatedSize}px`;
      el.style.height = `${calculatedSize}px`;
      el.style.borderRadius = "50%";
      el.style.backgroundColor = markerBgColor;
      el.style.color = markerTextColor;
      el.style.display = "flex";
      el.style.alignItems = "center";
      el.style.justifyContent = "center";
      el.style.fontWeight = "bold";
      el.style.fontSize = `${fontSize}px`;
      el.style.cursor = "pointer";
      el.style.padding = `${padding}px`;
      el.style.boxSizing = "border-box";
      el.textContent = countText;

      const marker = new Marker({ element: el })
        .setLngLat([point.lng, point.lat])
        .addTo(mapRef.current!);

      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
    };
  }, [points, selectedTheme]);

  return (
    <div
      ref={mapContainerRef}
      className="relative w-full"
      style={{ height: `calc(100vh - ${hS}px)`, top: hS }}
    >
      <MapMenu mapRef={mapRef} onAddModeChange={setIsAddMode} />
    </div>
  );
};

export default MapComponent;

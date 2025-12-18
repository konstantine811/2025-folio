import { useEffect, useState, useRef } from "react";
import { motion } from "motion/react";
import { useNavMenuScope } from "@/storage/scoped-nav-menu-store";
import { Map, MapMouseEvent } from "mapbox-gl";
import AddPointModal from "./add-point-modal";
import {
  subscribeToSphereAgentPoints,
  saveSphereAgentPoint,
  updateSphereAgentPoint,
  deleteSphereAgentPoint,
  SphereAgentPoint,
} from "@/services/firebase/sphere-agents-points";

type MapMenuProps = {
  mapRef: React.RefObject<Map | null>;
  onAddModeChange: (isAddMode: boolean) => void;
  onMapClick?: (e: mapboxgl.MapMouseEvent) => void;
};

const MENU_WIDTH = 712;

const MapMenu = ({ mapRef, onAddModeChange }: MapMenuProps) => {
  const { isOpen } = useNavMenuScope("map");
  const [isAddMode, setIsAddMode] = useState(false);
  const [points, setPoints] = useState<SphereAgentPoint[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [clickedCoords, setClickedCoords] = useState<{
    lng: number;
    lat: number;
  } | null>(null);
  const [editingPoint, setEditingPoint] = useState<SphereAgentPoint | null>(
    null
  );
  const mapClickHandlerRef = useRef<((e: MapMouseEvent) => void) | null>(null);

  // Subscribe to points
  useEffect(() => {
    const unsubscribe = subscribeToSphereAgentPoints((updatedPoints) => {
      setPoints(updatedPoints);
    });

    return () => unsubscribe();
  }, []);

  // Update map padding when menu opens/closes
  useEffect(() => {
    if (!mapRef.current) return;

    const padding = {
      left: isOpen ? MENU_WIDTH : 0,
    };

    mapRef.current.easeTo({
      padding,
      duration: 1000, // Match CSS transition duration
    });
  }, [isOpen, mapRef]);

  // Notify parent about add mode change
  useEffect(() => {
    onAddModeChange(isAddMode);
  }, [isAddMode, onAddModeChange]);

  // Handle map clicks in add mode
  useEffect(() => {
    if (!mapRef.current || !isAddMode) return;

    const map = mapRef.current;
    const handleMapClick = (e: MapMouseEvent) => {
      setClickedCoords({
        lng: e.lngLat.lng,
        lat: e.lngLat.lat,
      });
      setModalOpen(true);
    };

    map.on("click", handleMapClick);
    mapClickHandlerRef.current = handleMapClick;

    return () => {
      if (map && mapClickHandlerRef.current) {
        map.off("click", mapClickHandlerRef.current);
        mapClickHandlerRef.current = null;
      }
    };
  }, [isAddMode, mapRef]);

  const handleAddPoint = async (count: number) => {
    if (!clickedCoords) return;

    try {
      await saveSphereAgentPoint({
        lng: clickedCoords.lng,
        lat: clickedCoords.lat,
        count,
      });
      setClickedCoords(null);
    } catch (error) {
      console.error("Error adding point:", error);
    }
  };

  const handleEditPoint = async (pointId: string, count: number) => {
    try {
      await updateSphereAgentPoint(pointId, { count });
      setEditingPoint(null);
    } catch (error) {
      console.error("Error updating point:", error);
    }
  };

  const handleDeletePoint = async (pointId: string) => {
    if (!confirm("Ви впевнені, що хочете видалити цю точку?")) return;

    try {
      await deleteSphereAgentPoint(pointId);
    } catch (error) {
      console.error("Error deleting point:", error);
    }
  };

  const toggleAddMode = () => {
    setIsAddMode(!isAddMode);
  };

  const handleExportToJson = () => {
    if (points.length === 0) {
      alert("Немає точок для експорту");
      return;
    }

    const jsonData = JSON.stringify(points, null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sphere-agents-points-${
      new Date().toISOString().split("T")[0]
    }.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial="closed"
      animate={isOpen ? "open" : "closed"}
      variants={{
        closed: {
          x: -MENU_WIDTH + 5, // Leave 5px visible for toggle button
          transition: {
            duration: 1,
            ease: [0.4, 0, 0.2, 1],
          },
        },
        open: {
          x: 0,
          transition: {
            duration: 1,
            ease: [0.4, 0, 0.2, 1],
          },
        },
      }}
      className="absolute h-full left-0 top-0 bg-background/95 backdrop-blur-sm border-r border-border border-r-muted-foreground/20 shadow-2xl z-40 overflow-hidden pointer-events-auto"
      style={{
        width: MENU_WIDTH,
      }}
    >
      <div className="h-full pl-24 overflow-y-auto p-6 space-y-6 w-full">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">SPHERA OF DEUTSCHLAND</h1>
            <span className="text-2xl">🇩🇪</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-md cursor-pointer hover:bg-muted/50 transition-colors">
            <span className="text-sm font-mono">2025</span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              className="text-muted-foreground"
            >
              <path
                d="M3 4.5L6 7.5L9 4.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {/* Add Point Button */}
          <button
            onClick={toggleAddMode}
            className={`w-full px-4 py-3 rounded-lg border transition-colors ${
              isAddMode
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border hover:bg-muted/50"
            }`}
          >
            {isAddMode ? "Режим додавання активний" : "Додати точку на мапу"}
          </button>

          {/* Export to JSON Button */}
          <button
            onClick={handleExportToJson}
            disabled={points.length === 0}
            className="w-full px-4 py-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="text-muted-foreground"
            >
              <path
                d="M8 2V10M8 10L5 7M8 10L11 7M3 12H13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Експортувати точки у JSON</span>
            {points.length > 0 && (
              <span className="text-xs text-muted-foreground">
                ({points.length})
              </span>
            )}
          </button>

          {/* Points List */}
          {points.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Точки на мапі:</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {points.map((point) => (
                  <div
                    key={point.id}
                    className="p-3 border border-border rounded-lg bg-card/50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="text-sm font-medium">
                          Кількість: {point.count}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {point.lat.toFixed(4)}, {point.lng.toFixed(4)}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingPoint(point)}
                          className="px-2 py-1 text-xs border border-border rounded hover:bg-muted/50"
                        >
                          Редагувати
                        </button>
                        <button
                          onClick={() => handleDeletePoint(point.id)}
                          className="px-2 py-1 text-xs border border-destructive rounded hover:bg-destructive/10 text-destructive"
                        >
                          Видалити
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-sm text-muted-foreground leading-relaxed">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris.
          </p>

          {/* Data Cards */}
          <div className="grid grid-cols-3 gap-3">
            {/* Card 1 */}
            <div className="p-4 border border-border rounded-lg bg-card/50">
              <div className="text-xs text-muted-foreground mb-1">
                GDP, total current
              </div>
              <div className="text-lg font-bold">$4.7T</div>
            </div>

            {/* Card 2 */}
            <div className="p-4 border border-border rounded-lg bg-card/50">
              <div className="text-xs text-muted-foreground mb-1">
                Volume of import, 2025
              </div>
              <div className="text-lg font-bold">$2.4T</div>
            </div>

            {/* Card 3 - Highlighted */}
            <div className="p-4 border border-border rounded-lg bg-foreground text-background relative group cursor-pointer hover:scale-105 transition-transform">
              <div className="text-xs opacity-80 mb-1">
                Total amount contracted, 2024
              </div>
              <div className="text-lg font-bold">$2.4T</div>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="absolute top-4 right-4 opacity-60 group-hover:opacity-100 transition-opacity"
              >
                <path
                  d="M6 12L10 8L6 4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Card 4 */}
            <div className="p-4 border border-border rounded-lg bg-card/50">
              <div className="text-xs text-muted-foreground mb-1">
                Public contracts volume, 2025
              </div>
              <div className="text-lg font-bold">$2.4T</div>
            </div>

            {/* Card 5 */}
            <div className="p-4 border border-border rounded-lg bg-card/50">
              <div className="text-xs text-muted-foreground mb-1">
                International investment, 2025
              </div>
              <div className="text-lg font-bold">$0.4T</div>
            </div>

            {/* Card 6 */}
            <div className="p-4 border border-border rounded-lg bg-card/50">
              <div className="text-xs text-muted-foreground mb-1">
                Total active opportunities
              </div>
              <div className="text-lg font-bold">$2.4K</div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Point Modal */}
      {clickedCoords && (
        <AddPointModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setClickedCoords(null);
          }}
          onConfirm={handleAddPoint}
          lng={clickedCoords.lng}
          lat={clickedCoords.lat}
        />
      )}

      {/* Edit Point Modal */}
      {editingPoint && (
        <AddPointModal
          isOpen={!!editingPoint}
          onClose={() => setEditingPoint(null)}
          onConfirm={(count) => handleEditPoint(editingPoint.id, count)}
          lng={editingPoint.lng}
          lat={editingPoint.lat}
          initialCount={editingPoint.count}
          isEdit={true}
        />
      )}
    </motion.div>
  );
};

export default MapMenu;

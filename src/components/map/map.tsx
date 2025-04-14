import { useEffect, useRef, useState } from "react";
import mapboxgl, { GeoJSONSource, Map, Marker } from "mapbox-gl";

type LatLng = [number, number];

function getDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

const InitMap = () => {
  const mapRef = useRef<Map>(null!);
  const markerRef = useRef<Marker | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const prevPositionRef = useRef<GeolocationPosition | null>(null);
  const routeRef = useRef<LatLng[]>([]);
  const [speed, setSpeed] = useState<number>(0);

  useEffect(() => {
    mapboxgl.accessToken =
      "pk.eyJ1Ijoia29uc3RhbnRpbmU4MTEiLCJhIjoiY2themphMDhpMGsyazJybWlpbDdmMGthdSJ9.m2RIe_g8m5dqbce0JrO73w";

    if (!mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/konstantine811/cm2c1hxz1002x01pk6r1yfagp",
      center: [24.0311, 49.8429],
      zoom: 16,
      pitch: 60,
      bearing: 0,
    });

    mapRef.current = map;

    const updateRouteOnMap = (coordinates: LatLng[]) => {
      const source = map.getSource("route") as GeoJSONSource;
      if (source) {
        source.setData({
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates,
          },
          properties: {},
        });
      }
    };

    map.on("load", () => {
      map.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: [],
          },
          properties: {},
        },
      });

      map.addLayer({
        id: "route-line",
        type: "line",
        source: "route",
        paint: {
          "line-color": "#ff0066",
          "line-width": 4,
        },
      });
    });

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, heading } = position.coords;
        const lngLat: LatLng = [longitude, latitude];

        // Ручне обчислення швидкості
        const prev = prevPositionRef.current;
        if (prev) {
          const timeDelta = (position.timestamp - prev.timestamp) / 1000;
          const dist = getDistance(
            prev.coords.latitude,
            prev.coords.longitude,
            latitude,
            longitude
          );

          if (timeDelta > 0 && dist >= 0) {
            const calculatedSpeed = dist / timeDelta;
            setSpeed(calculatedSpeed);
          }
        }
        prevPositionRef.current = position;

        // Оновлення маршруту
        routeRef.current.push(lngLat);
        updateRouteOnMap(routeRef.current);

        // Маркер
        if (!markerRef.current) {
          markerRef.current = new mapboxgl.Marker({ color: "red" })
            .setLngLat(lngLat)
            .addTo(mapRef.current);
        } else {
          markerRef.current.setLngLat(lngLat);
        }

        // Камера
        map.easeTo({
          center: lngLat,
          bearing: heading || map.getBearing(),
          duration: 1000,
          pitch: 60,
          zoom: 17,
        });
      },
      (error) => {
        console.error("Geolocation error:", error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      map.remove();
    };
  }, []);

  return (
    <div className="relative h-[calc(100vh-58.4px)]">
      <div
        ref={mapContainerRef}
        className="absolute top-0 left-0 right-0 bottom-0 w-full h-full"
      />
      <div className="absolute top-2 left-2 bg-white text-black px-4 py-2 rounded shadow">
        🚀 Швидкість: {speed.toFixed(2)} м/с
      </div>
    </div>
  );
};

export default InitMap;

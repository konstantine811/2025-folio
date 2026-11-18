export type SkillKind = "frontend" | "three" | "maps" | "backend" | "data" | "motion";

/** Concept copy; positions are in the ship's local coordinates. */
export const skillStations: { id: string; kind: SkillKind; title: string; skills: string[]; position: [number, number, number]; color: string }[] = [
  { id: "01", kind: "frontend", title: "FRONTEND", skills: ["Angular / React", "RxJS / Zustand", "UI systems"], position: [-3.1, 0.06, 12.2], color: "#8e82ff" },
  { id: "02", kind: "three", title: "3D / R3F", skills: ["Three.js / React Three Fiber", "Shaders / Physics", "WebGL"], position: [3.1, 0.06, 12.2], color: "#7b9fff" },
  { id: "03", kind: "maps", title: "MAPS / DATA VIS", skills: ["Mapbox / ArcGIS", "D3.js visualization", "Spatial interfaces"], position: [-3.1, 0.06, 8.7], color: "#71dcff" },
  { id: "04", kind: "backend", title: "BACKEND", skills: ["Node.js / Express", "Next.js", "APIs / Services"], position: [3.1, 0.06, 8.7], color: "#9b8cff" },
  { id: "05", kind: "data", title: "DATA", skills: ["IndexedDB", "MongoDB", "Firebase"], position: [-3.1, 0.06, 5.2], color: "#ac88ff" },
  { id: "06", kind: "motion", title: "MOTION", skills: ["GSAP", "Framer Motion", "Theatre.js"], position: [3.1, 0.06, 5.2], color: "#8fa9ff" },
];

export function isSkillStationNearby(distanceSquared: number, wasActive: boolean) {
  const radius = wasActive ? 4.5 : 4;
  return distanceSquared < radius * radius;
}

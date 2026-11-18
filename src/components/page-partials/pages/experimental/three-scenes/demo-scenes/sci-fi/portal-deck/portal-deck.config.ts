/** All coordinates are local to the ship; existing rear door is at z ≈ 36.75. */
export const portalDeckLayout = {
  floorY: 0.057,
  corridorStart: 36.5,
  hallStart: 51.5,
  hallEnd: 75.5,
  hallCenterZ: 63.5,
  corridorHalfWidth: 2.2,
  hallHalfWidth: 12,
  ceilingY: 5.6,
};

export const shipPortals = [
  { id: "01", title: "CUBIC WORLDS", scene: "three-cubic-worlds-game", position: [-11.65, 2.45, 56.5], rotation: Math.PI / 2, color: "#8f94ff" },
  { id: "02", title: "WIZARD REALM", scene: "three-wizard-game", position: [-11.65, 2.45, 63.5], rotation: Math.PI / 2, color: "#b78bff" },
  { id: "03", title: "SHADER OCEAN", scene: "three-shader-water", position: [-11.65, 2.45, 70.5], rotation: Math.PI / 2, color: "#65d8ff" },
  { id: "04", title: "PHYSICS LAB", scene: "three-physics-engine", position: [11.65, 2.45, 56.5], rotation: -Math.PI / 2, color: "#84c9ff" },
  { id: "05", title: "PARTICLE FIELD", scene: "three-vfx-particles", position: [11.65, 2.45, 63.5], rotation: -Math.PI / 2, color: "#a394ff" },
  { id: "06", title: "MOTION STUDIO", scene: "three-theatre-js", position: [11.65, 2.45, 70.5], rotation: -Math.PI / 2, color: "#ce9aff" },
  { id: "07", title: "WEBGPU FRONTIER", scene: "three-web-gpu", position: [-6, 2.45, 75.15], rotation: Math.PI, color: "#7ee5e8" },
] as const;

export type Vec3 = [number, number, number];
export type DeckBox = { position: Vec3; size: Vec3 };

// The hall has an entrance from the corridor and an exterior service hatch.
// The cinematic camera can still enter the ship along its existing centerline.
export const portalDeckWalls: DeckBox[] = [
  ...[-1, 1].map((side): DeckBox => ({ position: [side * 2.35, 2.8, 44], size: [0.3, 5.6, 15.4] })),
  ...[-1, 1].map((side): DeckBox => ({ position: [side * 12.15, 2.8, 63.5], size: [0.3, 5.6, 24.4] })),
  ...[51.5, 75.5].flatMap((z): DeckBox[] => [
    { position: [-7.1, 2.8, z], size: [9.8, 5.6, 0.3] },
    { position: [7.1, 2.8, z], size: [9.8, 5.6, 0.3] },
    { position: [0, 4.8, z], size: [4.4, 1.6, 0.3] },
  ]),
];


export const portalDeckFloors: DeckBox[] = [
  { position: [0, portalDeckLayout.floorY - 0.15, 44], size: [4.4, 0.3, 15.2] },
  { position: [0, portalDeckLayout.floorY - 0.15, 63.5], size: [24, 0.3, 24.3] },
];

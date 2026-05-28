/** Blender export anchor for door colliders (ship interior layout). */
export const SHIP_DOOR_EXPORT_ASSEMBLY_POSITION: [number, number, number] = [
  0, -0.101, 36.546,
];
export const SHIP_DOOR_EXPORT_ASSEMBLY_ROTATION: [number, number, number] = [
  Math.PI,
  0,
  Math.PI,
];

export function colliderLocalFromShipDoorExport(
  worldPos: [number, number, number],
): [number, number, number] {
  return [
    worldPos[0] - SHIP_DOOR_EXPORT_ASSEMBLY_POSITION[0],
    worldPos[1] - SHIP_DOOR_EXPORT_ASSEMBLY_POSITION[1],
    worldPos[2] - SHIP_DOOR_EXPORT_ASSEMBLY_POSITION[2],
  ];
}

/** Return portal in stylized landscape (faces spawn at +Z). */
export const STYLIZED_RETURN_DOOR_WORLD = {
  rootPosition: [0, 0, 2] as [number, number, number],
  assemblyPosition: [0, 0, 0] as [number, number, number],
  assemblyRotation: [0, Math.PI, 0] as [number, number, number],
  terrainSampleZ: 2,
};

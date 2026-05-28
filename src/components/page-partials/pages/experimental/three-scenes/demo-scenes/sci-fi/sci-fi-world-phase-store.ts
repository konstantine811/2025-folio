import { create } from "zustand";
import {
  DEFAULT_TERRAIN_PROFILE,
  sampleGroundTerrainHeight,
} from "@/components/page-partials/pages/experimental/three-scenes/games/stylized-world/experience/ground-terrain";
import {
  getSciFiCapsuleFeetToCenterOffset,
  sciFiScrollPlacement,
} from "./character/sci-fi.config";

export type SciFiWorldPhase = "ship" | "stylized";

export type Vec3Teleport = { x: number; y: number; z: number };

const STYLIZED_SPAWN_XZ = { x: 0, z: 6 };
const STYLIZED_WORLD_SEED = 42;

function capsuleCenterYFromGround(feetY: number) {
  return feetY + getSciFiCapsuleFeetToCenterOffset();
}

export function getStylizedWorldSpawn(): Vec3Teleport {
  const feetY = sampleGroundTerrainHeight({
    worldX: STYLIZED_SPAWN_XZ.x,
    worldZ: STYLIZED_SPAWN_XZ.z,
    seed: STYLIZED_WORLD_SEED,
    profile: DEFAULT_TERRAIN_PROFILE,
  });

  return {
    x: STYLIZED_SPAWN_XZ.x,
    y: capsuleCenterYFromGround(feetY),
    z: STYLIZED_SPAWN_XZ.z,
  };
}

/** Just inside the ship door after leaving stylized world. */
export function getShipDoorReturnSpawn(): Vec3Teleport {
  return {
    x: 0,
    y: sciFiScrollPlacement.floorY + getSciFiCapsuleFeetToCenterOffset(),
    z: 35.75,
  };
}

type SciFiWorldPhaseState = {
  phase: SciFiWorldPhase;
  pendingTeleport: Vec3Teleport | null;
  enterStylizedWorld: () => void;
  returnToShip: () => void;
  clearPendingTeleport: () => void;
};

export const useSciFiWorldPhaseStore = create<SciFiWorldPhaseState>((set) => ({
  phase: "ship",
  pendingTeleport: null,
  enterStylizedWorld: () =>
    set({
      phase: "stylized",
      pendingTeleport: getStylizedWorldSpawn(),
    }),
  returnToShip: () =>
    set({
      phase: "ship",
      pendingTeleport: getShipDoorReturnSpawn(),
    }),
  clearPendingTeleport: () => set({ pendingTeleport: null }),
}));

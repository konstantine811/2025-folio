import { CharacterAnimations } from "../../../character-controller/models/character-controller.model";
import { SCI_FI_CHARACTER_MODEL_PATH } from "./model/sci-fi-character.model";
import { normalizeRange } from "@/utils/math/normalize";

export const SciFiCharacterAnimations: CharacterAnimations = {
  idle: "Idle",
  walk: "Walk",
  run: "Run",
  jumpFalling: "FallingIdle",
  attack: "Idle",
};

export const sciFiCharacterConfig = {
  modelPath: SCI_FI_CHARACTER_MODEL_PATH,

  fallbackAnimationType: SciFiCharacterAnimations.idle,

  animations: {
    sitToStand: "StandUp",
    /** Scroll timeline walk — sad/slow variant. */
    walk: "SadWalking",
  },

  scroll: {
    standScrollEnd: 0.28,
    walkScrollStart: 0.26,
    walkScrollEnd: 1,
    walkDistance: 4.5,
    walkCycles: 3.6,
  },

  // Sholom GLB meshes use internal scale 0.011. Old character armature was also 0.011,
  // so group scale 90 kept the helmet ~1m in world space (90 × 0.011 × 0.011).
  // Full-scale character only needs group scale ≈ 1.
  helmet: {
    position: [0, 0.17, 0.017] as [number, number, number],
    rotation: [0, 0, 0] as [number, number, number],
    scale: 1,
  },

  stableWalkBoneTracks: ["mixamorighead", "mixamorigneck", "headtopend"],

  /** Controller-mode Rapier capsule — smaller than default CharacterController. */
  controllerCapsule: {
    halfHeight: 0.68,
    radius: 0.4,
  },

  /** Tuned for Sholom walk cycle — default controller uses moveSpeed 9, jump 2.5, gravityScale 3. */
  controllerMovement: {
    moveSpeed: 5,
    jumpForce: 1,
    gravityScale: 2,
  },
};

export function getSciFiCapsuleFeetToCenterOffset() {
  const { halfHeight, radius } = sciFiCharacterConfig.controllerCapsule;
  return halfHeight + radius;
}

/** Scroll group placement — must stay in sync with sci-fi-character-controller scroll wrapper. */
export const sciFiScrollPlacement = {
  groupY: 0.06,
  startZ: 13.821,
  floorY: 0.057,
};

export function getSciFiControllerSpawnFromScroll(
  scrollProgress: number,
): [number, number, number] {
  const walkProgress = normalizeRange(
    scrollProgress,
    sciFiCharacterConfig.scroll.walkScrollStart,
    sciFiCharacterConfig.scroll.walkScrollEnd,
  );

  return [
    0,
    sciFiScrollPlacement.floorY + getSciFiCapsuleFeetToCenterOffset(),
    sciFiScrollPlacement.startZ -
      sciFiCharacterConfig.scroll.walkDistance * walkProgress,
  ];
}

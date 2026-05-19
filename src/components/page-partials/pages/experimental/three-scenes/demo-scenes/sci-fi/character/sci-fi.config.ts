import { CharacterAnimations } from "../../../character-controller/models/character-controller.model";

export const SciFiCharacterAnimations: CharacterAnimations = {
  idle: "idle",
  walk: "sad_walk",
  run: "sad_run",
  jumpFalling: "sad_jump_falling",
  attack: "sad_attack",
};

export const sciFiCharacterConfig = {
  modelPath: "/3d-models/sci-fi/character.glb",

  fallbackAnimationType: SciFiCharacterAnimations.idle,

  animations: {
    sitToStand: "sit-to-stand",
    walk: "sad_walk",
  },

  scroll: {
    standScrollEnd: 0.28,
    walkScrollStart: 0.26,
    walkScrollEnd: 1,
    walkDistance: 4.5,
    walkCycles: 3.6,
  },

  helmet: {
    position: [0, 15, 1.5] as [number, number, number],
    rotation: [0, 0, 0] as [number, number, number],
    scale: 90,
  },

  stableWalkBoneTracks: ["mixamorighead", "mixamorigneck", "headtopend"],
};

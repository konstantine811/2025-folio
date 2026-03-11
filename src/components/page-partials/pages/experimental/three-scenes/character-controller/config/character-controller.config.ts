import {
  CharacterAnimations,
  PlayOptions,
} from "../models/character-controller.model";

export const characterAnimations: CharacterAnimations = {
  idle: "Idle",
  run: "Running",
  walk: "Walking",
  jumpFalling: "Falling",
  attack: "StandingAttack",
};

export const animationConfig: Record<string, PlayOptions> = {
  attack_1: {
    fadeDuration: 0.15,
    loopOnce: true,
    clampWhenFinished: true,
  },
  attack_2: { fadeDuration: 0.15, loopOnce: true, clampWhenFinished: true },
  locomotion: { fadeDuration: 0.15 },
};

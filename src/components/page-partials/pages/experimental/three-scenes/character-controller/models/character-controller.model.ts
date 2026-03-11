export interface CharacterAnimations {
  idle: string;
  run: string;
  walk: string;
  jumpFalling: string;
  attack: string;
}

export type CharacterAnimState =
  | { type: "idle" }
  | { type: "walk" }
  | { type: "run" }
  | { type: "fall" }
  | { type: "attack"; step: 1 | 2 | 3 };

export type Vec3 = { x: number; y: number; z: number };

export type PlayOptions = {
  fadeDuration?: number;
  loopOnce?: boolean;
  clampWhenFinished?: boolean;
  timeScale?: number;
  startAt?: number;
  transition?: "fade" | "stop";
  preserveTime?: boolean;
};

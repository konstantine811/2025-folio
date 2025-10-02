export enum ActionName {
  Idle = "Idle",
  Jump = "FallingIdle",
  Run = "Run",
  Walk = "Walk",
  JumpUp = "JumpUp",
  JumpIdle = "JumpIdle",
  JumpLand = "JumpLand",
}

export const keyboardMap = [
  { name: "forward", keys: ["ArrowUp", "KeyW"] },
  { name: "backward", keys: ["ArrowDown", "KeyS"] },
  { name: "leftward", keys: ["ArrowLeft", "KeyA"] },
  { name: "rightward", keys: ["ArrowRight", "KeyD"] },
  { name: "jump", keys: ["Space"] },
  { name: "run", keys: ["Shift"] },
];

export type AnimationSet = {
  idle?: string;
  walk?: string;
  run?: string;
  jump?: string;
  jumpIdle?: string;
  jumpLand?: string;
  fall?: string;
  action1?: string;
  action2?: string;
  action3?: string;
  action4?: string;
  sleeping?: string;
  standUp?: string;
};

export enum SceneObjectName {
  characterLight = "characterLight",
}

export const animationSet = {
  idle: "Idle",
  walk: "Walk",
  run: "Run",
  jump: "Fall",
  jumpIdle: "Fall",
  fall: "Fall",
  blink: "eye_blink",
  fightHand: "stable_attack",
  action1: "stable_attack",
  sleeping: "Sleep_Idle",
  standUp: "Standing_Up",
};

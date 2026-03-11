import { Vec3 } from "./character-controller.model";

export type AgentPathState = {
  path: Vec3[];
  pathIndex: number;
  lastPathMs: number;
  lastTargetPos: Vec3 | null;
  animState: AgentAnimState;
  moveDir: { x: number; z: number };
};

export type AgentAnimState = "idle" | "walk" | "attack";

export type AgentVisualState = {
  animState: "idle" | "walk" | "attack";
  moveDir: { x: number; z: number };
};

export type AgentPersonality = {
  moveSpeed: number;
  repathIntervalMs: number;
  stopDist: number;
  orbitRadius: number;
  orbitAngleOffset: number;
  attackCooldownMs: number;
  turnSpeed: number;
};

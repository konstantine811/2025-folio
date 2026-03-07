import { Vec3 } from "./character-controller.model";

export type AgentPathState = {
  path: Vec3[];
  pathIndex: number;
  lastPathMs: number;
  lastTargetPos: Vec3 | null;
};

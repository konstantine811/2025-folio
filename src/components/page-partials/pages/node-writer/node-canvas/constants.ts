import type { NodePort } from "../types/types";

export const CANVAS_MIN_W = 1600;
export const CANVAS_MIN_H = 1200;

export const DEFAULT_NODE_W = 220;
export const DEFAULT_NODE_H = 180;
export const MIN_NODE_W = 140;
export const MIN_NODE_H = 88;
export const MIN_DRAW_RECT = 40;

export const PORT_LABELS: Record<NodePort, string> = {
  n: "зверху",
  e: "справа",
  s: "знизу",
  w: "зліва",
};

export const PORT_HANDLE_POSITION: Record<NodePort, string> = {
  n: "left-1/2 top-0 -translate-x-1/2 -translate-y-1/2",
  s: "left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2",
  w: "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2",
  e: "right-0 top-1/2 translate-x-1/2 -translate-y-1/2",
};

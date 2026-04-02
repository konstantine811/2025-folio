import type { NodeData } from "../../types/types";
import { DEFAULT_NODE_H, DEFAULT_NODE_W } from "../constants";

export function resolveNodeLayout(
  node: NodeData | undefined,
  measured: { w: number; h: number } | undefined,
): { w: number; h: number } {
  const w = node?.width ?? measured?.w ?? DEFAULT_NODE_W;
  const h = node?.height ?? measured?.h ?? DEFAULT_NODE_H;
  return { w, h };
}

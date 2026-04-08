import { useMemo } from "react";
import type { Viewport } from "pixi-viewport";
import type { Project } from "../../../types/types";
import {
  buildMinimapData,
  collectCanvasContentItems,
} from "../utils/canvasContent";

export function useMinimapData(
  project: Project,
  viewport: Viewport | null,
  viewportVersion: number,
) {
  return useMemo(() => {
    if (!viewport) return null;
    const items = collectCanvasContentItems(project);
    return buildMinimapData(items, viewport);
  }, [project, viewport, viewportVersion]);
}

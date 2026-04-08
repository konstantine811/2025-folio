import { useEffect, useRef } from "react";
import type { Project } from "../../../types/types";
import { collectCanvasContentItems, contentBoundsFromItems, fitViewportToBounds } from "../utils/canvasContent";
import type { Viewport } from "pixi-viewport";

type Params = {
  project: Project;
  viewport: Viewport | null;
};

export function useInitialProjectFit({ project, viewport }: Params) {
  const fittedProjectIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!viewport) return;
    if (fittedProjectIdRef.current === project.id) return;

    const bounds = contentBoundsFromItems(collectCanvasContentItems(project));
    if (!bounds) {
      fittedProjectIdRef.current = project.id;
      return;
    }

    const runFit = () => {
      const didFit = fitViewportToBounds(viewport, bounds, 180);
      if (didFit) {
        fittedProjectIdRef.current = project.id;
      }
      return didFit;
    };

    if (runFit()) return;
    const rafId = window.requestAnimationFrame(() => {
      runFit();
    });
    return () => window.cancelAnimationFrame(rafId);
  }, [project, viewport]);
}

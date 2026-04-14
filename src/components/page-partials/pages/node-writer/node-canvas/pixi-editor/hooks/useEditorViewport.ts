import { useApplication } from "@pixi/react";
import { useEffect, useMemo } from "react";
import { Viewport } from "pixi-viewport";
import { CANVAS_ZOOM_MAX, CANVAS_ZOOM_MIN } from "../../constants";
import { useEditorStore } from "../store/editorStore";

const WORLD_WIDTH = 100000;
const WORLD_HEIGHT = 100000;

export function useEditorViewport() {
  const { app } = useApplication();
  const setViewport = useEditorStore((s) => s.setViewport);
  const bumpViewportVersion = useEditorStore((s) => s.bumpViewportVersion);

  const viewport = useMemo(() => {
    if (!app) return null;
    const renderer = app.renderer;
    const screen = app.screen ?? renderer?.screen;
    const screenWidth = screen?.width || window.innerWidth;
    const screenHeight = screen?.height || window.innerHeight;

    const instance = new Viewport({
      screenWidth,
      screenHeight,
      worldWidth: WORLD_WIDTH,
      worldHeight: WORLD_HEIGHT,
      events: renderer?.events,
    });
    instance.drag().pinch().decelerate();
    instance.clampZoom({
      minScale: CANVAS_ZOOM_MIN,
      maxScale: CANVAS_ZOOM_MAX,
    });
    return instance;
  }, [app]);

  useEffect(() => {
    if (!app || !viewport) return;
    const renderer = app.renderer;

    app.stage.addChild(viewport);
    setViewport(viewport);

    const handleResize = () => {
      const screen = app.screen ?? renderer?.screen;
      viewport.resize(
        screen?.width || window.innerWidth,
        screen?.height || window.innerHeight,
        WORLD_WIDTH,
        WORLD_HEIGHT,
      );
      bumpViewportVersion();
    };
    const handleViewportChanged = () => {
      bumpViewportVersion();
    };

    viewport.on("moved", handleViewportChanged);
    viewport.on("zoomed", handleViewportChanged);
    handleResize();

    return () => {
      viewport.off("moved", handleViewportChanged);
      viewport.off("zoomed", handleViewportChanged);
      setViewport(null);
      const stage = app.stage;
      if (stage && viewport.parent === stage) {
        stage.removeChild(viewport);
      } else if (viewport.parent) {
        viewport.parent.removeChild(viewport);
      }
      if (!viewport.destroyed) {
        viewport.destroy();
      }
    };
  }, [app, viewport, setViewport, bumpViewportVersion]);

  return viewport;
}

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
    const instance = new Viewport({
      screenWidth: app.screen.width || window.innerWidth,
      screenHeight: app.screen.height || window.innerHeight,
      worldWidth: WORLD_WIDTH,
      worldHeight: WORLD_HEIGHT,
      events: app.renderer.events,
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

    app.stage.addChild(viewport);
    setViewport(viewport);

    const handleResize = () => {
      viewport.resize(
        app.screen.width,
        app.screen.height,
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
      app.stage.removeChild(viewport);
      viewport.destroy();
    };
  }, [app, viewport, setViewport, bumpViewportVersion]);

  return viewport;
}

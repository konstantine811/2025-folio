import { useApplication } from "@pixi/react";
import type { Viewport } from "pixi-viewport";
import { useEffect, useMemo, useRef } from "react";
import type { Project, ProjectPatchFn } from "../../types/types";
import { type FederatedPointerEvent } from "pixi.js";
import { normalizeCanvasImageGeometry } from "./shared/types";
import { useEditorStore } from "./store/editorStore";

type Props = {
  viewport: Viewport;
  canvasImages: Project["canvasImages"];
  onProjectPatch: (fn: ProjectPatchFn) => void;
  readOnly?: boolean;
};

const CanvasImageLayer = ({
  viewport,
  canvasImages,
  onProjectPatch,
  readOnly = false,
}: Props) => {
  const { app } = useApplication();
  const viewportVersion = useEditorStore((s) => s.viewportVersion);
  const selectCanvasImage = useEditorStore((s) => s.selectCanvasImage);
  const mappedPointRef = useRef({ x: 0, y: 0 });
  const normalizedCanvasImages = useMemo(
    () =>
      (canvasImages ?? []).map((image) => ({
        ...image,
        ...normalizeCanvasImageGeometry(image),
      })),
    [canvasImages],
  );
  const visibleCanvasImages = useMemo(() => {
    const pad = 260;
    const screenW = viewport.screenWidth || window.innerWidth;
    const screenH = viewport.screenHeight || window.innerHeight;
    const a = viewport.toWorld({ x: 0, y: 0 });
    const b = viewport.toWorld({ x: screenW, y: screenH });
    const minX = Math.min(a.x, b.x) - pad;
    const maxX = Math.max(a.x, b.x) + pad;
    const minY = Math.min(a.y, b.y) - pad;
    const maxY = Math.max(a.y, b.y) + pad;

    return normalizedCanvasImages.filter((image) => {
      const x = image.x;
      const y = image.y;
      const w = Math.max(1, image.width);
      const h = Math.max(1, image.height);
      return x < maxX && x + w > minX && y < maxY && y + h > minY;
    });
  }, [normalizedCanvasImages, viewport, viewportVersion]);
  const dragDataRef = useRef<{
    isDragging: boolean;
    pointerId: number | null;
    imageId: string | null;
    offsetX: number;
    offsetY: number;
  }>({
    isDragging: false,
    pointerId: null,
    imageId: null,
    offsetX: 0,
    offsetY: 0,
  });
  const detachGlobalDragListenersRef = useRef<(() => void) | null>(null);

  const detachGlobalDragListeners = () => {
    if (!detachGlobalDragListenersRef.current) return;
    detachGlobalDragListenersRef.current();
    detachGlobalDragListenersRef.current = null;
  };

  useEffect(() => {
    return () => {
      detachGlobalDragListeners();
    };
  }, []);

  const handlePointerDown = (
    e: FederatedPointerEvent,
    imageId: string,
    imageX: number,
    imageY: number,
  ) => {
    e.stopPropagation();
    selectCanvasImage(imageId);
    if (readOnly) return;

    const world = viewport.toWorld(e.global);
    dragDataRef.current.isDragging = true;
    dragDataRef.current.pointerId = e.pointerId;
    dragDataRef.current.imageId = imageId;
    dragDataRef.current.offsetX = world.x - imageX;
    dragDataRef.current.offsetY = world.y - imageY;

    detachGlobalDragListeners();

    const activePointerId = e.pointerId;
    const handleWindowPointerMove = (event: PointerEvent) => {
      const drag = dragDataRef.current;
      if (!drag.isDragging || !drag.imageId) return;
      if (event.pointerId !== activePointerId) return;

      if (app) {
        app.renderer.events.mapPositionToPoint(
          mappedPointRef.current,
          event.clientX,
          event.clientY,
        );
      } else {
        mappedPointRef.current.x = event.clientX;
        mappedPointRef.current.y = event.clientY;
      }

      const world = viewport.toWorld(mappedPointRef.current);
      const nextX = world.x - drag.offsetX;
      const nextY = world.y - drag.offsetY;

      onProjectPatch((prev) => ({
        ...prev,
        canvasImages: (prev.canvasImages ?? []).map((candidate) =>
          candidate.id === drag.imageId
            ? { ...candidate, x: nextX, y: nextY }
            : candidate,
        ),
      }));
    };

    const finishDrag = () => {
      dragDataRef.current.isDragging = false;
      dragDataRef.current.pointerId = null;
      dragDataRef.current.imageId = null;
      detachGlobalDragListeners();
    };

    const handleWindowPointerUp = (event: PointerEvent) => {
      if (event.pointerId !== activePointerId) return;
      finishDrag();
    };

    const handleWindowBlur = () => {
      finishDrag();
    };

    window.addEventListener("pointermove", handleWindowPointerMove, {
      passive: true,
    });
    window.addEventListener("pointerup", handleWindowPointerUp);
    window.addEventListener("pointercancel", handleWindowPointerUp);
    window.addEventListener("blur", handleWindowBlur);

    detachGlobalDragListenersRef.current = () => {
      window.removeEventListener("pointermove", handleWindowPointerMove);
      window.removeEventListener("pointerup", handleWindowPointerUp);
      window.removeEventListener("pointercancel", handleWindowPointerUp);
      window.removeEventListener("blur", handleWindowBlur);
    };
  };

  const handlePointerUp = () => {
    dragDataRef.current.isDragging = false;
    dragDataRef.current.pointerId = null;
    dragDataRef.current.imageId = null;
    detachGlobalDragListeners();
  };

  return (
    <pixiContainer
      ref={(instance) => {
        if (instance && !viewport.children.includes(instance)) {
          viewport.addChild(instance);
        }
      }}
      eventMode="passive"
    >
      {visibleCanvasImages.map((image) => {
        return (
          <pixiContainer
            key={image.id}
            x={image.x}
            y={image.y}
            eventMode="static"
            cursor={readOnly ? "default" : "pointer"}
            onPointerDown={(e: FederatedPointerEvent) =>
              handlePointerDown(e, image.id, image.x, image.y)
            }
            onPointerUp={handlePointerUp}
            onPointerUpOutside={handlePointerUp}
          >
            <pixiGraphics
              draw={(g) => {
                g.clear();
                // Transparent PIXI hit-area under the HTML overlay.
                g.roundRect(0, 0, image.width, image.height, 22);
                g.fill({ color: 0x000000, alpha: 0 });
              }}
            />
          </pixiContainer>
        );
      })}
    </pixiContainer>
  );
};

export default CanvasImageLayer;

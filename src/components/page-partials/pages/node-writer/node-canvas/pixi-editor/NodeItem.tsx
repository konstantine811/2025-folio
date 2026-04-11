import { useApplication } from "@pixi/react";
import { useEffect, useRef } from "react";
import { Viewport } from "pixi-viewport";
import { useEditorStore } from "./store/editorStore";
import { FederatedPointerEvent } from "pixi.js";
import type { ProjectPatchFn } from "../../types/types";
import { parseHexRgb } from "../utils/node-accent";
import { EditorNode } from "./shared/types";

function hexToPixiRgb(hex: string | undefined): number | null {
  const rgb = hex?.trim() ? parseHexRgb(hex.trim()) : null;
  if (!rgb) return null;
  return ((rgb[0] << 16) | (rgb[1] << 8) | rgb[2]) >>> 0;
}

type Props = {
  node: EditorNode;
  viewport: Viewport;
  onProjectPatch: (fn: ProjectPatchFn) => void;
  readOnly?: boolean;
  isDark?: boolean;
};

const NodeItem = ({
  node,
  viewport,
  onProjectPatch,
  readOnly = false,
  isDark = true,
}: Props) => {
  const { app } = useApplication();
  const selectNode = useEditorStore((s) => s.selectNode);
  const mappedPointRef = useRef({ x: 0, y: 0 });

  const dragDataRef = useRef<{
    isDragging: boolean;
    pointerId: number | null;
    offsetX: number;
    offsetY: number;
  }>({
    isDragging: false,
    pointerId: null,
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

  const handlePointerDown = (e: FederatedPointerEvent) => {
    e.stopPropagation();
    selectNode(node.id);
    if (readOnly) return;

    const world = viewport.toWorld(e.global);
    dragDataRef.current.isDragging = true;
    dragDataRef.current.pointerId = e.pointerId;
    dragDataRef.current.offsetX = world.x - node.x;
    dragDataRef.current.offsetY = world.y - node.y;

    detachGlobalDragListeners();

    const activePointerId = e.pointerId;
    const handleWindowPointerMove = (event: PointerEvent) => {
      const drag = dragDataRef.current;
      if (!drag.isDragging) return;
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
        nodes: prev.nodes.map((candidate) =>
          candidate.id === node.id
            ? { ...candidate, x: nextX, y: nextY }
            : candidate,
        ),
      }));
    };

    const finishDrag = () => {
      dragDataRef.current.isDragging = false;
      dragDataRef.current.pointerId = null;
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
    detachGlobalDragListeners();
  };

  return (
    <pixiContainer
      x={node.x}
      y={node.y}
      eventMode="static"
      cursor={readOnly ? "default" : "pointer"}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerUpOutside={handlePointerUp}
    >
      <pixiGraphics
        draw={(g) => {
          g.clear();
          // Transparent PIXI hit-area under the HTML overlay.
          g.roundRect(0, 0, node.width, node.height, 22);
          g.fill({ color: 0x000000, alpha: 0 });

          // LOD preview: when HTML node is hidden at far zoom, show schematic card.
          const zoom = Math.max(Math.abs(viewport.scale.x || 1), 0.0001);
          const screenW = node.width * zoom;
          const screenH = node.height * zoom;
          const showSchematic = screenW < 48 || screenH < 40;
          if (!showSchematic) return;

          const strokeWidth = Math.max(0.8 / zoom, 0.0001);
          const radius = Math.min(18, Math.max(8, Math.min(node.width, node.height) * 0.08));
          const accentRgb = hexToPixiRgb(node.accentColor);
          const bodyFill = isDark ? 0x0a0f17 : 0xf4f8ff;
          const border =
            accentRgb ?? (isDark ? 0x9bd0ff : 0x3a6ea5);
          const headerFill = isDark ? 0x101827 : 0xe9f1ff;

          g.roundRect(0, 0, node.width, node.height, radius);
          g.fill({
            color: accentRgb ?? bodyFill,
            alpha: accentRgb ? (isDark ? 0.42 : 0.5) : isDark ? 0.58 : 0.68,
          });
          g.stroke({
            color: border,
            alpha: accentRgb ? (isDark ? 0.72 : 0.55) : isDark ? 0.44 : 0.36,
            width: strokeWidth,
          });

          const headerHeight = Math.max(16 / zoom, Math.min(node.height * 0.16, node.height));
          g.roundRect(0, 0, node.width, headerHeight, radius);
          g.fill({ color: headerFill, alpha: isDark ? 0.36 : 0.46 });
        }}
      />
    </pixiContainer>
  );
};

export default NodeItem;

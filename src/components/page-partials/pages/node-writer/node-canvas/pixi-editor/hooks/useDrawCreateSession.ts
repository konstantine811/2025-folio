import { useEffect, useRef, useState } from "react";
import type { FederatedPointerEvent } from "pixi.js";
import type { Application } from "pixi.js";
import type { Viewport } from "pixi-viewport";
import type { ProjectPatchFn } from "../../../types/types";
import {
  MIN_DRAW_RECT,
  MIN_LINK_KNIFE_PATH_LENGTH_PX,
  MIN_LINK_KNIFE_POLYGON_VERTICES,
  MIN_LINK_KNIFE_SAMPLE_PX,
} from "../../constants";
import {
  collectLinkKeysIntersectingLogicalPolygon,
  linkStableKey,
} from "../../utils/link-knife";
import { newMarkdownBlockId, newNodeId } from "../../utils/node-ids";
import {
  normalizeCanvasImageGeometry,
  normalizeNodeGeometry,
} from "../shared/types";

type DrawCreateState =
  | {
      mode: "newNodePending";
      pointerId: number;
      x0: number;
      y0: number;
    }
  | {
      mode: "newNode";
      pointerId: number;
      x0: number;
      y0: number;
      x1: number;
      y1: number;
    }
  | {
      mode: "linkKnife";
      pointerId: number;
      points: Array<{ x: number; y: number }>;
    }
  | null;

type Params = {
  app: Application | null;
  viewport: Viewport | null;
  readOnly: boolean;
  onProjectPatch: (fn: ProjectPatchFn) => void;
  onSelectNode: (id: string | null) => void;
  onSelectCanvasImage: (id: string | null) => void;
  onClearSelection: () => void;
  linkKnifeArmedRef: React.MutableRefObject<boolean>;
};

export function useDrawCreateSession({
  app,
  viewport,
  readOnly,
  onProjectPatch,
  onSelectNode,
  onSelectCanvasImage,
  onClearSelection,
  linkKnifeArmedRef,
}: Params) {
  const mappedPointRef = useRef({ x: 0, y: 0 });
  const [drawCreate, setDrawCreate] = useState<DrawCreateState>(null);
  const drawCreateRef = useRef(drawCreate);
  drawCreateRef.current = drawCreate;

  useEffect(() => {
    if (!drawCreate || !viewport) return;

    const activePointerId = drawCreate.pointerId;
    const dragPlugin = viewport.plugins.get("drag");
    dragPlugin?.pause();

    const handlePointerMove = (event: PointerEvent) => {
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
      setDrawCreate((prev) => {
        if (!prev || prev.pointerId !== activePointerId) return prev;
        if (prev.mode === "linkKnife") {
          const zoom = Math.max(viewport.scale.x || 1, 0.01);
          const minSampleLogical = MIN_LINK_KNIFE_SAMPLE_PX / zoom;
          const last = prev.points[prev.points.length - 1];
          if (
            last &&
            Math.hypot(world.x - last.x, world.y - last.y) < minSampleLogical
          ) {
            return prev;
          }
          return {
            ...prev,
            points: [...prev.points, { x: world.x, y: world.y }],
          };
        }
        if (prev.mode === "newNodePending") {
          const width = Math.abs(world.x - prev.x0);
          const height = Math.abs(world.y - prev.y0);
          const widthPx = width * Math.max(viewport.scale.x, 0.01);
          const heightPx = height * Math.max(viewport.scale.y, 0.01);
          if (widthPx < MIN_DRAW_RECT && heightPx < MIN_DRAW_RECT) {
            return prev;
          }
          return {
            mode: "newNode",
            pointerId: prev.pointerId,
            x0: prev.x0,
            y0: prev.y0,
            x1: world.x,
            y1: world.y,
          };
        }
        return {
          ...prev,
          x1: world.x,
          y1: world.y,
        };
      });
    };

    const finishDrawing = (event: PointerEvent) => {
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

      const current = drawCreateRef.current;
      if (current?.mode === "linkKnife") {
        const pts = [...current.points, { x: world.x, y: world.y }];
        const n = pts.length;
        if (n >= MIN_LINK_KNIFE_POLYGON_VERTICES) {
          let perimeterLogical = 0;
          for (let i = 0; i < n - 1; i += 1) {
            perimeterLogical += Math.hypot(
              pts[i + 1]!.x - pts[i]!.x,
              pts[i + 1]!.y - pts[i]!.y,
            );
          }
          perimeterLogical += Math.hypot(
            pts[0]!.x - pts[n - 1]!.x,
            pts[0]!.y - pts[n - 1]!.y,
          );
          const minPerimeterLogical =
            MIN_LINK_KNIFE_PATH_LENGTH_PX /
            Math.max(viewport.scale.x || 1, 0.01);
          if (perimeterLogical >= minPerimeterLogical) {
            onProjectPatch((prev) => {
              const normalizedNodes = prev.nodes.map((node) => ({
                ...node,
                ...normalizeNodeGeometry(node),
              }));
              const layoutOf = (nodeId: string) => {
                const node = normalizedNodes.find(
                  (nNode) => nNode.id === nodeId,
                );
                return {
                  w: node?.width ?? 220,
                  h: node?.height ?? 180,
                };
              };
              const normalizedImages = (prev.canvasImages ?? []).map(
                (image) => ({
                  ...image,
                  ...normalizeCanvasImageGeometry(image),
                }),
              );
              const cut = collectLinkKeysIntersectingLogicalPolygon(
                prev.links,
                normalizedNodes,
                normalizedImages,
                layoutOf,
                pts,
              );
              if (cut.size === 0) return prev;
              return {
                ...prev,
                links: prev.links.filter(
                  (link) => !cut.has(linkStableKey(link)),
                ),
              };
            });
          }
        }
      } else if (current?.mode === "newNode") {
        const x0 = current.x0;
        const y0 = current.y0;
        const x1 = world.x;
        const y1 = world.y;
        const left = Math.min(x0, x1);
        const top = Math.min(y0, y1);
        const width = Math.abs(x1 - x0);
        const height = Math.abs(y1 - y0);
        const widthPx = width * Math.max(viewport.scale.x, 0.01);
        const heightPx = height * Math.max(viewport.scale.y, 0.01);

        if (
          !readOnly &&
          widthPx >= MIN_DRAW_RECT &&
          heightPx >= MIN_DRAW_RECT
        ) {
          const createdNodeId = newNodeId();
          onProjectPatch((prev) => {
            const nextIndex = prev.nodes.length + 1;
            return {
              ...prev,
              nodes: [
                ...prev.nodes,
                {
                  id: createdNodeId,
                  label: `Нода ${nextIndex}`,
                  headingLevel: prev.nodes.length === 0 ? 1 : 2,
                  description: "",
                  markdownBlocks: [{ id: newMarkdownBlockId(), text: "" }],
                  type: "concept",
                  x: left,
                  y: top,
                  width,
                  height,
                },
              ],
            };
          });
          onSelectNode(createdNodeId);
        }
      }

      setDrawCreate(null);
      dragPlugin?.resume();
    };

    const cancelDrawing = () => {
      setDrawCreate(null);
      dragPlugin?.resume();
    };

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    window.addEventListener("pointerup", finishDrawing);
    window.addEventListener("pointercancel", finishDrawing);
    window.addEventListener("blur", cancelDrawing);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", finishDrawing);
      window.removeEventListener("pointercancel", finishDrawing);
      window.removeEventListener("blur", cancelDrawing);
      dragPlugin?.resume();
    };
  }, [
    app,
    drawCreate?.pointerId,
    onProjectPatch,
    onSelectNode,
    readOnly,
    viewport,
  ]);

  useEffect(() => {
    if (!drawCreate) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (readOnly) return;
      if (event.target instanceof Element) {
        const isTypingTarget = event.target.closest(
          "input,textarea,[contenteditable='true']",
        );
        if (isTypingTarget) return;
      }
      event.preventDefault();
      event.stopPropagation();
      setDrawCreate(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [drawCreate, readOnly]);

  const drawPreviewRect =
    drawCreate?.mode === "newNode"
      ? {
          x: Math.min(drawCreate.x0, drawCreate.x1),
          y: Math.min(drawCreate.y0, drawCreate.y1),
          width: Math.abs(drawCreate.x1 - drawCreate.x0),
          height: Math.abs(drawCreate.y1 - drawCreate.y0),
        }
      : null;
  const knifePolygonPreviewPoints =
    drawCreate?.mode === "linkKnife" ? drawCreate.points : null;

  const handleGridPointerDown = (e: FederatedPointerEvent) => {
    onClearSelection();
    if (readOnly) return;
    if (e.button !== 0) return;
    if (drawCreateRef.current) return;
    if (e.pointerType === "touch") {
      onSelectNode(null);
      onSelectCanvasImage(null);
      return;
    }

    e.stopPropagation();
    if (!viewport) return;
    const world = viewport.toWorld(e.global);
    onSelectNode(null);
    onSelectCanvasImage(null);

    if (linkKnifeArmedRef.current) {
      setDrawCreate({
        mode: "linkKnife",
        pointerId: e.pointerId,
        points: [{ x: world.x, y: world.y }],
      });
    } else {
      setDrawCreate({
        mode: "newNodePending",
        pointerId: e.pointerId,
        x0: world.x,
        y0: world.y,
      });
    }
  };

  return {
    drawPreviewRect,
    knifePolygonPreviewPoints,
    handleGridPointerDown,
  };
}

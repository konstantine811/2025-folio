import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MIN_NODE_H, MIN_NODE_W } from "../constants";
import { deriveMarkdownBlocks } from "../utils/node-markdown-blocks";
import { newMarkdownBlockId } from "../utils/node-ids";
import { linkBezierGeometry, linkUsesChildSlot } from "../utils";
import { isKeyboardTypingTarget } from "../utils/canvas-keyboard";
import type {
  LinkData,
  NodePort,
  Project,
  ProjectPatchFn,
} from "../../types/types";
import {
  normalizeCanvasImageGeometry,
  normalizeNodeGeometry,
} from "./shared/types";
import { useEditorStore } from "./store/editorStore";
import CanvasImageOverlayItem from "./CanvasImageOverlayItem";
import MarkdownNodeOverlayItem from "./MarkdownNodeOverlayItem";
import MarqueeOverlay from "./MarqueeOverlay";
import WirePreviewOverlay from "./WirePreviewOverlay";
import { inferPortFromClientPoint } from "./nodeOverlayHelpers";
import { NODE_WRITER_WORKSPACE_SCOPE } from "@/config/node-writer-access.config";
import { uploadNodeWriterCanvasPastedFile } from "@/services/firebase/node-writer-workspace";

type Props = {
  project: Project;
  onProjectPatch: (fn: ProjectPatchFn) => void;
  readOnly?: boolean;
  isDark?: boolean;
};

const NodeHtmlOverlayLayer = ({
  project,
  onProjectPatch,
  readOnly = false,
  isDark = true,
}: Props) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const viewport = useEditorStore((s) => s.viewport);
  const selectNode = useEditorStore((s) => s.selectNode);
  const selectCanvasImage = useEditorStore((s) => s.selectCanvasImage);
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId);
  const selectedCanvasImageId = useEditorStore((s) => s.selectedCanvasImageId);
  const viewportVersion = useEditorStore((s) => s.viewportVersion);
  const [wireSession, setWireSession] = useState<{
    pointerId: number;
    sourceKind: "node" | "canvasImage";
    sourceId: string;
    sourcePort: NodePort;
    sourceChildSlot: number;
    startClientX: number;
    startClientY: number;
  } | null>(null);
  const [wireCursorClient, setWireCursorClient] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [wireDropHighlight, setWireDropHighlight] = useState<
    | {
        targetKind: "node";
        nodeId: string;
        port: NodePort;
        dropAllowed: boolean;
      }
    | {
        targetKind: "canvasImage";
        imageId: string;
        port: NodePort;
        dropAllowed: boolean;
      }
    | null
  >(null);
  const [isShiftDown, setIsShiftDown] = useState(false);
  const [multiSelectedNodeIds, setMultiSelectedNodeIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [multiSelectedCanvasImageIds, setMultiSelectedCanvasImageIds] =
    useState<Set<string>>(() => new Set());
  const [marqueeRectClient, setMarqueeRectClient] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);
  const marqueeSessionRef = useRef<{
    pointerId: number;
    startClientX: number;
    startClientY: number;
  } | null>(null);
  const dragSessionRef = useRef<{
    pointerId: number;
    startClientX: number;
    startClientY: number;
    nodeOrigins: Array<{ id: string; x: number; y: number }>;
    canvasImageOrigins: Array<{ id: string; x: number; y: number }>;
  } | null>(null);
  const detachDragListenersRef = useRef<(() => void) | null>(null);
  const resizeSessionRef = useRef<{
    pointerId: number;
    nodeId: string;
    startClientX: number;
    startClientY: number;
    originWidth: number;
    originHeight: number;
  } | null>(null);
  const detachResizeListenersRef = useRef<(() => void) | null>(null);
  const imageDragSessionRef = useRef<{
    pointerId: number;
    imageId: string;
    startClientX: number;
    startClientY: number;
    originX: number;
    originY: number;
  } | null>(null);
  const detachImageDragListenersRef = useRef<(() => void) | null>(null);
  const imageResizeSessionRef = useRef<{
    pointerId: number;
    imageId: string;
    startClientX: number;
    startClientY: number;
    originWidth: number;
    originHeight: number;
  } | null>(null);
  const detachImageResizeListenersRef = useRef<(() => void) | null>(null);

  const detachDragListeners = () => {
    if (!detachDragListenersRef.current) return;
    detachDragListenersRef.current();
    detachDragListenersRef.current = null;
  };
  const detachResizeListeners = () => {
    if (!detachResizeListenersRef.current) return;
    detachResizeListenersRef.current();
    detachResizeListenersRef.current = null;
  };
  const detachImageDragListeners = () => {
    if (!detachImageDragListenersRef.current) return;
    detachImageDragListenersRef.current();
    detachImageDragListenersRef.current = null;
  };
  const detachImageResizeListeners = () => {
    if (!detachImageResizeListenersRef.current) return;
    detachImageResizeListenersRef.current();
    detachImageResizeListenersRef.current = null;
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Shift") {
        setIsShiftDown(true);
      }
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === "Shift") {
        setIsShiftDown(false);
      }
    };
    const handleWindowBlur = () => {
      setIsShiftDown(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleWindowBlur);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, []);

  useEffect(() => {
    return () => {
      marqueeSessionRef.current = null;
      setMarqueeRectClient(null);
      dragSessionRef.current = null;
      detachDragListeners();
      resizeSessionRef.current = null;
      detachResizeListeners();
      imageDragSessionRef.current = null;
      detachImageDragListeners();
      imageResizeSessionRef.current = null;
      detachImageResizeListeners();
    };
  }, []);

  useEffect(() => {
    if (selectedNodeId || selectedCanvasImageId) return;
    setMultiSelectedNodeIds(new Set());
    setMultiSelectedCanvasImageIds(new Set());
  }, [selectedNodeId, selectedCanvasImageId]);

  useEffect(() => {
    if (!wireSession) return;

    const handleWindowPointerMove = (event: PointerEvent) => {
      if (event.pointerId !== wireSession.pointerId) return;
      setWireCursorClient({ x: event.clientX, y: event.clientY });

      const target = document.elementFromPoint(
        event.clientX,
        event.clientY,
      ) as HTMLElement | null;
      const portEl = target?.closest("[data-link-port]") as HTMLElement | null;
      const nodeEl = target?.closest(
        "[data-overlay-node-id]",
      ) as HTMLElement | null;
      const canvasImageEl = target?.closest(
        "[data-overlay-canvas-image-id]",
      ) as HTMLElement | null;
      const targetNodeId =
        portEl?.dataset.nodeId ?? nodeEl?.dataset.overlayNodeId ?? null;
      const targetCanvasImageId =
        portEl?.dataset.canvasImageId ??
        canvasImageEl?.dataset.overlayCanvasImageId ??
        null;
      const targetId = targetNodeId ?? targetCanvasImageId;

      if (!targetId) {
        setWireDropHighlight(null);
        return;
      }

      const explicitTargetPort = portEl?.dataset.linkPort as
        | NodePort
        | undefined;
      const inferredPort =
        explicitTargetPort ??
        (nodeEl || canvasImageEl
          ? inferPortFromClientPoint(
              (nodeEl ?? canvasImageEl)!.getBoundingClientRect(),
              event.clientX,
              event.clientY,
            )
          : null);

      if (!inferredPort) {
        setWireDropHighlight(null);
        return;
      }

      const duplicate = project.links.some(
        (candidate) =>
          (candidate.source === wireSession.sourceId &&
            candidate.target === targetId) ||
          (candidate.source === targetId &&
            candidate.target === wireSession.sourceId),
      );
      const dropAllowed = targetId !== wireSession.sourceId && !duplicate;

      if (targetNodeId) {
        setWireDropHighlight({
          targetKind: "node",
          nodeId: targetNodeId,
          port: inferredPort,
          dropAllowed,
        });
      } else if (targetCanvasImageId) {
        setWireDropHighlight({
          targetKind: "canvasImage",
          imageId: targetCanvasImageId,
          port: inferredPort,
          dropAllowed,
        });
      } else {
        setWireDropHighlight(null);
      }
    };

    const finishWire = (event: PointerEvent) => {
      if (event.pointerId !== wireSession.pointerId) return;

      const target = document.elementFromPoint(
        event.clientX,
        event.clientY,
      ) as HTMLElement | null;
      const portEl = target?.closest("[data-link-port]") as HTMLElement | null;
      const nodeEl = target?.closest(
        "[data-overlay-node-id]",
      ) as HTMLElement | null;
      const canvasImageEl = target?.closest(
        "[data-overlay-canvas-image-id]",
      ) as HTMLElement | null;
      const targetNodeId =
        portEl?.dataset.nodeId ?? nodeEl?.dataset.overlayNodeId ?? null;
      const targetCanvasImageId =
        portEl?.dataset.canvasImageId ??
        canvasImageEl?.dataset.overlayCanvasImageId ??
        null;
      const targetId = targetNodeId ?? targetCanvasImageId;

      if (targetId && targetId !== wireSession.sourceId) {
        const explicitTargetPort = portEl?.dataset.linkPort as
          | NodePort
          | undefined;
        const targetPort =
          explicitTargetPort ??
          (nodeEl || canvasImageEl
            ? inferPortFromClientPoint(
                (nodeEl ?? canvasImageEl)!.getBoundingClientRect(),
                event.clientX,
                event.clientY,
              )
            : undefined);

        if (targetPort) {
          const nextLink: LinkData = {
            source: wireSession.sourceId,
            target: targetId,
            sourceIsCanvasImage: wireSession.sourceKind === "canvasImage",
            targetIsCanvasImage: Boolean(targetCanvasImageId),
            sourcePort: wireSession.sourcePort,
            sourceChildSlot: wireSession.sourceChildSlot,
            targetPort,
          };
          onProjectPatch((prev) => {
            const duplicate = prev.links.some(
              (candidate) =>
                (candidate.source === nextLink.source &&
                  candidate.target === nextLink.target) ||
                (candidate.source === nextLink.target &&
                  candidate.target === nextLink.source),
            );
            if (duplicate) return prev;
            return { ...prev, links: [...prev.links, nextLink] };
          });
        }
      }

      setWireSession(null);
      setWireCursorClient(null);
      setWireDropHighlight(null);
    };

    const cancelWire = () => {
      setWireSession(null);
      setWireCursorClient(null);
      setWireDropHighlight(null);
    };

    window.addEventListener("pointermove", handleWindowPointerMove, {
      passive: true,
    });
    window.addEventListener("pointerup", finishWire);
    window.addEventListener("pointercancel", finishWire);
    window.addEventListener("blur", cancelWire);

    return () => {
      window.removeEventListener("pointermove", handleWindowPointerMove);
      window.removeEventListener("pointerup", finishWire);
      window.removeEventListener("pointercancel", finishWire);
      window.removeEventListener("blur", cancelWire);
    };
  }, [onProjectPatch, wireSession]);

  const preparedNodes = useMemo(
    () =>
      project.nodes.map((node) => ({
        node,
        geometry: normalizeNodeGeometry(node),
        blocks: deriveMarkdownBlocks(node),
        isConnected: project.links.some(
          (link) => link.source === node.id || link.target === node.id,
        ),
      })),
    [project.links, project.nodes],
  );
  const preparedCanvasImages = useMemo(
    () =>
      (project.canvasImages ?? []).map((image) => ({
        image,
        geometry: normalizeCanvasImageGeometry(image),
        isConnected: project.links.some(
          (link) => link.source === image.id || link.target === image.id,
        ),
      })),
    [project.canvasImages, project.links],
  );
  const orderedOverlayItems = useMemo(() => {
    const imageCount = preparedCanvasImages.length;
    return [
      ...preparedCanvasImages.map((entry, index) => ({
        kind: "canvasImage" as const,
        layerZIndex: entry.image.zIndex ?? index,
        ...entry,
      })),
      ...preparedNodes.map((entry, index) => ({
        kind: "node" as const,
        layerZIndex: entry.node.zIndex ?? imageCount + index,
        ...entry,
      })),
    ]
      .sort((a, b) => a.layerZIndex - b.layerZIndex)
      .map((item, index) => ({ ...item, layerZIndex: index + 1 }));
  }, [preparedCanvasImages, preparedNodes]);
  const uploadMarkdownPasteImage = useCallback(
    async (file: File) => {
      return uploadNodeWriterCanvasPastedFile(
        NODE_WRITER_WORKSPACE_SCOPE,
        project.id,
        `md-${newMarkdownBlockId()}`,
        file,
      );
    },
    [project.id],
  );
  const marqueeRectLocal = useMemo(() => {
    if (!marqueeRectClient || !rootRef.current) return null;
    const rootRect = rootRef.current.getBoundingClientRect();
    return {
      left: marqueeRectClient.left - rootRect.left,
      top: marqueeRectClient.top - rootRect.top,
      width: marqueeRectClient.width,
      height: marqueeRectClient.height,
    };
  }, [marqueeRectClient, viewportVersion]);
  const canMarqueeSelect =
    !readOnly &&
    isShiftDown &&
    !wireSession &&
    !isKeyboardTypingTarget(
      typeof document !== "undefined" ? document.activeElement : null,
    );

  if (!viewport) return null;
  const zoom = viewport.scale.x || 1;
  const worldViewBounds = (() => {
    const pad = 320;
    const screenW = viewport.screenWidth || window.innerWidth;
    const screenH = viewport.screenHeight || window.innerHeight;
    const a = viewport.toWorld({ x: 0, y: 0 });
    const b = viewport.toWorld({ x: screenW, y: screenH });
    return {
      minX: Math.min(a.x, b.x) - pad,
      maxX: Math.max(a.x, b.x) + pad,
      minY: Math.min(a.y, b.y) - pad,
      maxY: Math.max(a.y, b.y) + pad,
    };
  })();

  const startWireFromChildSlot = (
    event: React.PointerEvent<HTMLButtonElement>,
    sourceId: string,
    sourcePort: NodePort,
    sourceChildSlot: number,
  ) => {
    if (readOnly) return;
    event.preventDefault();
    event.stopPropagation();

    onProjectPatch((prev) => ({
      ...prev,
      links: prev.links.filter(
        (link) =>
          !linkUsesChildSlot(link, sourceId, sourcePort, sourceChildSlot),
      ),
    }));

    selectNode(sourceId);
    setWireSession({
      pointerId: event.pointerId,
      sourceKind: "node",
      sourceId,
      sourcePort,
      sourceChildSlot,
      startClientX: event.clientX,
      startClientY: event.clientY,
    });
    setWireCursorClient({ x: event.clientX, y: event.clientY });
  };

  const startWireFromCanvasImage = (
    event: React.PointerEvent<HTMLButtonElement>,
    imageId: string,
    sourcePort: NodePort,
  ) => {
    if (readOnly) return;
    event.preventDefault();
    event.stopPropagation();

    onProjectPatch((prev) => ({
      ...prev,
      links: prev.links.filter(
        (link) => !linkUsesChildSlot(link, imageId, sourcePort, 1),
      ),
    }));

    selectCanvasImage(imageId);
    setWireSession({
      pointerId: event.pointerId,
      sourceKind: "canvasImage",
      sourceId: imageId,
      sourcePort,
      sourceChildSlot: 1,
      startClientX: event.clientX,
      startClientY: event.clientY,
    });
    setWireCursorClient({ x: event.clientX, y: event.clientY });
  };

  let wirePath: string | null = null;
  if (wireSession && wireCursorClient && rootRef.current) {
    const rect = rootRef.current.getBoundingClientRect();
    const ax = wireSession.startClientX - rect.left;
    const ay = wireSession.startClientY - rect.top;
    const bx = wireCursorClient.x - rect.left;
    const by = wireCursorClient.y - rect.top;
    const geometry = linkBezierGeometry(
      ax,
      ay,
      bx,
      by,
      wireSession.sourcePort,
      undefined,
    );
    wirePath = `M ${geometry.ax} ${geometry.ay} C ${geometry.cx1} ${geometry.cy1} ${geometry.cx2} ${geometry.cy2} ${geometry.bx} ${geometry.by}`;
  }

  const startNodeDrag = (
    event: React.PointerEvent<HTMLDivElement>,
    nodeId: string,
    nodeX: number,
    nodeY: number,
  ) => {
    if (readOnly) return;

    event.preventDefault();
    event.stopPropagation();
    const useGroupDrag = multiSelectedNodeIds.has(nodeId);
    const selectedNodeOrigins = useGroupDrag
      ? project.nodes
          .filter((candidate) => multiSelectedNodeIds.has(candidate.id))
          .map((candidate) => {
            const g = normalizeNodeGeometry(candidate);
            return { id: candidate.id, x: g.x, y: g.y };
          })
      : [{ id: nodeId, x: nodeX, y: nodeY }];
    const selectedCanvasImageOrigins = useGroupDrag
      ? (project.canvasImages ?? [])
          .filter((candidate) => multiSelectedCanvasImageIds.has(candidate.id))
          .map((candidate) => {
            const g = normalizeCanvasImageGeometry(candidate);
            return { id: candidate.id, x: g.x, y: g.y };
          })
      : [];
    if (!useGroupDrag) {
      setMultiSelectedNodeIds(new Set());
      setMultiSelectedCanvasImageIds(new Set());
    }
    selectNode(nodeId);
    detachDragListeners();

    const activePointerId = event.pointerId;
    dragSessionRef.current = {
      pointerId: activePointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      nodeOrigins: selectedNodeOrigins,
      canvasImageOrigins: selectedCanvasImageOrigins,
    };

    const handleWindowPointerMove = (moveEvent: PointerEvent) => {
      const drag = dragSessionRef.current;
      if (!drag) return;
      if (moveEvent.pointerId !== drag.pointerId) return;

      const zoomNow = Math.max(viewport.scale.x || 1, 0.01);
      const dx = (moveEvent.clientX - drag.startClientX) / zoomNow;
      const dy = (moveEvent.clientY - drag.startClientY) / zoomNow;
      const nodeNextById = new Map(
        drag.nodeOrigins.map((origin) => [
          origin.id,
          { x: origin.x + dx, y: origin.y + dy },
        ]),
      );
      const imageNextById = new Map(
        drag.canvasImageOrigins.map((origin) => [
          origin.id,
          { x: origin.x + dx, y: origin.y + dy },
        ]),
      );

      onProjectPatch((prev) => ({
        ...prev,
        nodes: prev.nodes.map((candidate) =>
          nodeNextById.has(candidate.id)
            ? {
                ...candidate,
                x: nodeNextById.get(candidate.id)!.x,
                y: nodeNextById.get(candidate.id)!.y,
              }
            : candidate,
        ),
        canvasImages: (prev.canvasImages ?? []).map((candidate) =>
          imageNextById.has(candidate.id)
            ? {
                ...candidate,
                x: imageNextById.get(candidate.id)!.x,
                y: imageNextById.get(candidate.id)!.y,
              }
            : candidate,
        ),
      }));
    };

    const finishDrag = () => {
      dragSessionRef.current = null;
      detachDragListeners();
    };

    const handleWindowPointerUp = (upEvent: PointerEvent) => {
      const drag = dragSessionRef.current;
      if (!drag) return;
      if (upEvent.pointerId !== drag.pointerId) return;
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

    detachDragListenersRef.current = () => {
      window.removeEventListener("pointermove", handleWindowPointerMove);
      window.removeEventListener("pointerup", handleWindowPointerUp);
      window.removeEventListener("pointercancel", handleWindowPointerUp);
      window.removeEventListener("blur", handleWindowBlur);
    };
  };

  const startNodeResize = (
    event: React.PointerEvent<HTMLDivElement>,
    nodeId: string,
    nodeWidth: number,
    nodeHeight: number,
  ) => {
    if (readOnly) return;

    event.preventDefault();
    event.stopPropagation();
    selectNode(nodeId);
    detachResizeListeners();

    const activePointerId = event.pointerId;
    resizeSessionRef.current = {
      pointerId: activePointerId,
      nodeId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      originWidth: nodeWidth,
      originHeight: nodeHeight,
    };

    const handleWindowPointerMove = (moveEvent: PointerEvent) => {
      const resize = resizeSessionRef.current;
      if (!resize) return;
      if (moveEvent.pointerId !== resize.pointerId) return;

      const zoomNow = Math.max(viewport.scale.x || 1, 0.01);
      const dx = (moveEvent.clientX - resize.startClientX) / zoomNow;
      const dy = (moveEvent.clientY - resize.startClientY) / zoomNow;
      const nextWidth = Math.max(MIN_NODE_W, resize.originWidth + dx);
      const nextHeight = Math.max(MIN_NODE_H, resize.originHeight + dy);

      onProjectPatch((prev) => ({
        ...prev,
        nodes: prev.nodes.map((candidate) =>
          candidate.id === resize.nodeId
            ? { ...candidate, width: nextWidth, height: nextHeight }
            : candidate,
        ),
      }));
    };

    const finishResize = () => {
      resizeSessionRef.current = null;
      detachResizeListeners();
    };

    const handleWindowPointerUp = (upEvent: PointerEvent) => {
      const resize = resizeSessionRef.current;
      if (!resize) return;
      if (upEvent.pointerId !== resize.pointerId) return;
      finishResize();
    };

    const handleWindowBlur = () => {
      finishResize();
    };

    window.addEventListener("pointermove", handleWindowPointerMove, {
      passive: true,
    });
    window.addEventListener("pointerup", handleWindowPointerUp);
    window.addEventListener("pointercancel", handleWindowPointerUp);
    window.addEventListener("blur", handleWindowBlur);

    detachResizeListenersRef.current = () => {
      window.removeEventListener("pointermove", handleWindowPointerMove);
      window.removeEventListener("pointerup", handleWindowPointerUp);
      window.removeEventListener("pointercancel", handleWindowPointerUp);
      window.removeEventListener("blur", handleWindowBlur);
    };
  };

  const startCanvasImageDrag = (
    event: React.PointerEvent<HTMLDivElement>,
    imageId: string,
    imageX: number,
    imageY: number,
  ) => {
    if (readOnly) return;
    event.preventDefault();
    event.stopPropagation();
    const useGroupDrag = multiSelectedCanvasImageIds.has(imageId);
    const selectedNodeOrigins = useGroupDrag
      ? project.nodes
          .filter((candidate) => multiSelectedNodeIds.has(candidate.id))
          .map((candidate) => {
            const g = normalizeNodeGeometry(candidate);
            return { id: candidate.id, x: g.x, y: g.y };
          })
      : [];
    const selectedCanvasImageOrigins = useGroupDrag
      ? (project.canvasImages ?? [])
          .filter((candidate) => multiSelectedCanvasImageIds.has(candidate.id))
          .map((candidate) => {
            const g = normalizeCanvasImageGeometry(candidate);
            return { id: candidate.id, x: g.x, y: g.y };
          })
      : [{ id: imageId, x: imageX, y: imageY }];
    if (!useGroupDrag) {
      setMultiSelectedNodeIds(new Set());
      setMultiSelectedCanvasImageIds(new Set());
    }
    selectCanvasImage(imageId);
    detachImageDragListeners();

    const activePointerId = event.pointerId;
    imageDragSessionRef.current = {
      pointerId: activePointerId,
      imageId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      originX: imageX,
      originY: imageY,
    };

    const handleWindowPointerMove = (moveEvent: PointerEvent) => {
      const drag = imageDragSessionRef.current;
      if (!drag) return;
      if (moveEvent.pointerId !== drag.pointerId) return;

      const zoomNow = Math.max(viewport.scale.x || 1, 0.01);
      const dx = (moveEvent.clientX - drag.startClientX) / zoomNow;
      const dy = (moveEvent.clientY - drag.startClientY) / zoomNow;
      const nodeNextById = new Map(
        selectedNodeOrigins.map((origin) => [
          origin.id,
          { x: origin.x + dx, y: origin.y + dy },
        ]),
      );
      const imageNextById = new Map(
        selectedCanvasImageOrigins.map((origin) => [
          origin.id,
          { x: origin.x + dx, y: origin.y + dy },
        ]),
      );

      onProjectPatch((prev) => ({
        ...prev,
        nodes: prev.nodes.map((candidate) =>
          nodeNextById.has(candidate.id)
            ? {
                ...candidate,
                x: nodeNextById.get(candidate.id)!.x,
                y: nodeNextById.get(candidate.id)!.y,
              }
            : candidate,
        ),
        canvasImages: (prev.canvasImages ?? []).map((candidate) =>
          imageNextById.has(candidate.id)
            ? {
                ...candidate,
                x: imageNextById.get(candidate.id)!.x,
                y: imageNextById.get(candidate.id)!.y,
              }
            : candidate,
        ),
      }));
    };

    const finishDrag = () => {
      imageDragSessionRef.current = null;
      detachImageDragListeners();
    };

    const handleWindowPointerUp = (upEvent: PointerEvent) => {
      const drag = imageDragSessionRef.current;
      if (!drag) return;
      if (upEvent.pointerId !== drag.pointerId) return;
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

    detachImageDragListenersRef.current = () => {
      window.removeEventListener("pointermove", handleWindowPointerMove);
      window.removeEventListener("pointerup", handleWindowPointerUp);
      window.removeEventListener("pointercancel", handleWindowPointerUp);
      window.removeEventListener("blur", handleWindowBlur);
    };
  };

  const startCanvasImageResize = (
    event: React.PointerEvent<HTMLDivElement>,
    imageId: string,
    imageWidth: number,
    imageHeight: number,
  ) => {
    if (readOnly) return;
    event.preventDefault();
    event.stopPropagation();
    selectCanvasImage(imageId);
    detachImageResizeListeners();

    const activePointerId = event.pointerId;
    imageResizeSessionRef.current = {
      pointerId: activePointerId,
      imageId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      originWidth: imageWidth,
      originHeight: imageHeight,
    };

    const handleWindowPointerMove = (moveEvent: PointerEvent) => {
      const resize = imageResizeSessionRef.current;
      if (!resize) return;
      if (moveEvent.pointerId !== resize.pointerId) return;

      const zoomNow = Math.max(viewport.scale.x || 1, 0.01);
      const dx = (moveEvent.clientX - resize.startClientX) / zoomNow;
      const dy = (moveEvent.clientY - resize.startClientY) / zoomNow;
      const nextWidth = Math.max(220, resize.originWidth + dx);
      const nextHeight = Math.max(180, resize.originHeight + dy);

      onProjectPatch((prev) => ({
        ...prev,
        canvasImages: (prev.canvasImages ?? []).map((candidate) =>
          candidate.id === resize.imageId
            ? { ...candidate, width: nextWidth, height: nextHeight }
            : candidate,
        ),
      }));
    };

    const finishResize = () => {
      imageResizeSessionRef.current = null;
      detachImageResizeListeners();
    };

    const handleWindowPointerUp = (upEvent: PointerEvent) => {
      const resize = imageResizeSessionRef.current;
      if (!resize) return;
      if (upEvent.pointerId !== resize.pointerId) return;
      finishResize();
    };

    const handleWindowBlur = () => {
      finishResize();
    };

    window.addEventListener("pointermove", handleWindowPointerMove, {
      passive: true,
    });
    window.addEventListener("pointerup", handleWindowPointerUp);
    window.addEventListener("pointercancel", handleWindowPointerUp);
    window.addEventListener("blur", handleWindowBlur);

    detachImageResizeListenersRef.current = () => {
      window.removeEventListener("pointermove", handleWindowPointerMove);
      window.removeEventListener("pointerup", handleWindowPointerUp);
      window.removeEventListener("pointercancel", handleWindowPointerUp);
      window.removeEventListener("blur", handleWindowBlur);
    };
  };

  const startMarqueeSelection = (event: React.PointerEvent<HTMLDivElement>) => {
    if (readOnly || !isShiftDown) return;
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    marqueeSessionRef.current = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
    };
    setMarqueeRectClient({
      left: event.clientX,
      top: event.clientY,
      width: 0,
      height: 0,
    });

    const updateRect = (clientX: number, clientY: number) => {
      const startX = marqueeSessionRef.current?.startClientX ?? clientX;
      const startY = marqueeSessionRef.current?.startClientY ?? clientY;
      setMarqueeRectClient({
        left: Math.min(startX, clientX),
        top: Math.min(startY, clientY),
        width: Math.abs(clientX - startX),
        height: Math.abs(clientY - startY),
      });
    };

    const finishSelection = (clientX: number, clientY: number) => {
      const root = rootRef.current;
      const session = marqueeSessionRef.current;
      marqueeSessionRef.current = null;
      if (!root || !session) {
        setMarqueeRectClient(null);
        return;
      }
      const rootRect = root.getBoundingClientRect();
      const left = Math.min(session.startClientX, clientX) - rootRect.left;
      const top = Math.min(session.startClientY, clientY) - rootRect.top;
      const right = Math.max(session.startClientX, clientX) - rootRect.left;
      const bottom = Math.max(session.startClientY, clientY) - rootRect.top;

      if (right - left < 3 || bottom - top < 3) {
        setMarqueeRectClient(null);
        return;
      }

      const selectedNodeIds: string[] = [];
      for (const node of project.nodes) {
        const g = normalizeNodeGeometry(node);
        const topLeft = viewport.toScreen(g.x, g.y);
        const bottomRight = viewport.toScreen(g.x + g.width, g.y + g.height);
        const itemLeft = Math.min(topLeft.x, bottomRight.x);
        const itemTop = Math.min(topLeft.y, bottomRight.y);
        const itemRight = Math.max(topLeft.x, bottomRight.x);
        const itemBottom = Math.max(topLeft.y, bottomRight.y);
        const intersects =
          itemRight >= left &&
          itemLeft <= right &&
          itemBottom >= top &&
          itemTop <= bottom;
        if (intersects) selectedNodeIds.push(node.id);
      }

      const selectedImageIds: string[] = [];
      for (const image of project.canvasImages ?? []) {
        const g = normalizeCanvasImageGeometry(image);
        const topLeft = viewport.toScreen(g.x, g.y);
        const bottomRight = viewport.toScreen(g.x + g.width, g.y + g.height);
        const itemLeft = Math.min(topLeft.x, bottomRight.x);
        const itemTop = Math.min(topLeft.y, bottomRight.y);
        const itemRight = Math.max(topLeft.x, bottomRight.x);
        const itemBottom = Math.max(topLeft.y, bottomRight.y);
        const intersects =
          itemRight >= left &&
          itemLeft <= right &&
          itemBottom >= top &&
          itemTop <= bottom;
        if (intersects) selectedImageIds.push(image.id);
      }

      setMultiSelectedNodeIds(new Set(selectedNodeIds));
      setMultiSelectedCanvasImageIds(new Set(selectedImageIds));
      if (selectedNodeIds.length > 0) {
        selectNode(selectedNodeIds[0]!);
      } else if (selectedImageIds.length > 0) {
        selectCanvasImage(selectedImageIds[0]!);
      } else {
        selectNode(null);
        selectCanvasImage(null);
      }
      setMarqueeRectClient(null);
    };

    const handleWindowPointerMove = (moveEvent: PointerEvent) => {
      const session = marqueeSessionRef.current;
      if (!session || moveEvent.pointerId !== session.pointerId) return;
      updateRect(moveEvent.clientX, moveEvent.clientY);
    };

    const handleWindowPointerUp = (upEvent: PointerEvent) => {
      const session = marqueeSessionRef.current;
      if (!session || upEvent.pointerId !== session.pointerId) return;
      finishSelection(upEvent.clientX, upEvent.clientY);
      cleanup();
    };

    const handleWindowBlur = () => {
      marqueeSessionRef.current = null;
      setMarqueeRectClient(null);
      cleanup();
    };

    const cleanup = () => {
      window.removeEventListener("pointermove", handleWindowPointerMove);
      window.removeEventListener("pointerup", handleWindowPointerUp);
      window.removeEventListener("pointercancel", handleWindowPointerUp);
      window.removeEventListener("blur", handleWindowBlur);
    };

    window.addEventListener("pointermove", handleWindowPointerMove, {
      passive: true,
    });
    window.addEventListener("pointerup", handleWindowPointerUp);
    window.addEventListener("pointercancel", handleWindowPointerUp);
    window.addEventListener("blur", handleWindowBlur);
  };

  return (
    <div
      ref={rootRef}
      className="pointer-events-none absolute inset-0 z-[96] overflow-hidden"
    >
      <MarqueeOverlay
        canMarqueeSelect={canMarqueeSelect}
        marqueeRectLocal={marqueeRectLocal}
        onStartMarqueeSelection={startMarqueeSelection}
      />
      {orderedOverlayItems.map((item) =>
        item.kind === "canvasImage" ? (
          <CanvasImageOverlayItem
            key={`canvas-image-html-${item.image.id}`}
            image={item.image}
            isConnected={item.isConnected}
            viewport={viewport}
            worldViewBounds={worldViewBounds}
            zoom={zoom}
            viewportVersion={viewportVersion}
            isDark={isDark}
            layerZIndex={item.layerZIndex}
            readOnly={readOnly}
            isSelected={
              selectedCanvasImageId === item.image.id ||
              multiSelectedCanvasImageIds.has(item.image.id)
            }
            wireSession={wireSession}
            wireDropHighlight={wireDropHighlight}
            onProjectPatch={onProjectPatch}
            onSelect={selectCanvasImage}
            onResetMultiSelection={() => {
              setMultiSelectedNodeIds(new Set());
              setMultiSelectedCanvasImageIds(new Set());
            }}
            onStartWireFromCanvasImage={startWireFromCanvasImage}
            onStartCanvasImageDrag={startCanvasImageDrag}
            onStartCanvasImageResize={startCanvasImageResize}
          />
        ) : (
          <MarkdownNodeOverlayItem
            key={item.node.id}
            node={{
              ...item.node,
              x: item.node.x ?? 0,
              y: item.node.y ?? 0,
              width: item.node.width ?? MIN_NODE_W,
              height: item.node.height ?? MIN_NODE_H,
            }}
            blocks={item.blocks}
            isConnected={item.isConnected}
            links={project.links}
            viewport={viewport}
            worldViewBounds={worldViewBounds}
            zoom={zoom}
            viewportVersion={viewportVersion}
            isDark={isDark}
            layerZIndex={item.layerZIndex}
            readOnly={readOnly}
            isSelected={
              selectedNodeId === item.node.id || multiSelectedNodeIds.has(item.node.id)
            }
            wireSession={wireSession}
            wireDropHighlight={wireDropHighlight}
            uploadMarkdownPasteImage={uploadMarkdownPasteImage}
            onProjectPatch={onProjectPatch}
            onSelect={selectNode}
            onResetMultiSelection={() => {
              setMultiSelectedNodeIds(new Set());
              setMultiSelectedCanvasImageIds(new Set());
            }}
            onStartWireFromChildSlot={startWireFromChildSlot}
            onStartNodeDrag={startNodeDrag}
            onStartNodeResize={startNodeResize}
          />
        ),
      )}
      <WirePreviewOverlay
        wirePath={wirePath}
        rootWidth={rootRef.current?.clientWidth ?? 0}
        rootHeight={rootRef.current?.clientHeight ?? 0}
      />
    </div>
  );
};

export default NodeHtmlOverlayLayer;

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { MIN_NODE_H, MIN_NODE_W } from "../constants";
import { deriveMarkdownBlocks } from "../utils/node-markdown-blocks";
import { newMarkdownBlockId } from "../utils/node-ids";
import {
  edgeChildSlotPoint,
  linkBezierGeometry,
  linkUsesChildSlot,
  visibleChildSlotCount,
} from "../utils";
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
import { clearNodeWriterMarkdownSelection } from "../utils/clear-markdown-selection";

type Props = {
  project: Project;
  onProjectPatch: (fn: ProjectPatchFn) => void;
  readOnly?: boolean;
  touchNavigationMode?: boolean;
  isDark?: boolean;
};

const NodeHtmlOverlayLayer = ({
  project,
  onProjectPatch,
  readOnly = false,
  touchNavigationMode = false,
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
  const touchReadOnlyNavigationRef = useRef<{
    pointers: Map<
      number,
      {
        startClientX: number;
        startClientY: number;
        clientX: number;
        clientY: number;
      }
    >;
    startCenter: { x: number; y: number };
    startScale: number;
    startDistance: number | null;
    startMidWorld: { x: number; y: number } | null;
    didMove: boolean;
    didMultiTouch: boolean;
    selectTarget: () => void;
    detach: (() => void) | null;
  } | null>(null);

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
  const detachTouchReadOnlyNavigation = () => {
    const session = touchReadOnlyNavigationRef.current;
    if (!session?.detach) return;
    session.detach();
    if (touchReadOnlyNavigationRef.current) {
      touchReadOnlyNavigationRef.current.detach = null;
    }
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
      detachTouchReadOnlyNavigation();
      touchReadOnlyNavigationRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (selectedNodeId || selectedCanvasImageId) return;
    setMultiSelectedNodeIds(new Set());
    setMultiSelectedCanvasImageIds(new Set());
    clearNodeWriterMarkdownSelection(rootRef.current);
  }, [selectedNodeId, selectedCanvasImageId, viewportVersion]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const body = document.body;

    if (selectedNodeId) {
      body.dataset.nwNodeMarkdownSelected = "true";
    } else {
      delete body.dataset.nwNodeMarkdownSelected;
    }

    return () => {
      delete body.dataset.nwNodeMarkdownSelected;
    };
  }, [selectedNodeId]);

  useEffect(() => {
    if (!wireSession) return;

    const autoPanViewportWhileWiring = (clientX: number, clientY: number) => {
      if (!viewport || !rootRef.current) return;
      const rect = rootRef.current.getBoundingClientRect();
      const edge = 84;
      const maxStepPx = 32;

      let dxPx = 0;
      let dyPx = 0;

      if (clientX < rect.left + edge) {
        const t = (rect.left + edge - clientX) / edge;
        dxPx = -Math.ceil(Math.min(1, t) * maxStepPx);
      } else if (clientX > rect.right - edge) {
        const t = (clientX - (rect.right - edge)) / edge;
        dxPx = Math.ceil(Math.min(1, t) * maxStepPx);
      }

      if (clientY < rect.top + edge) {
        const t = (rect.top + edge - clientY) / edge;
        dyPx = -Math.ceil(Math.min(1, t) * maxStepPx);
      } else if (clientY > rect.bottom - edge) {
        const t = (clientY - (rect.bottom - edge)) / edge;
        dyPx = Math.ceil(Math.min(1, t) * maxStepPx);
      }

      if (dxPx === 0 && dyPx === 0) return;

      const zoom = Math.max(Math.abs(viewport.scale.x || 1), 0.01);
      viewport.moveCenter(
        viewport.center.x + dxPx / zoom,
        viewport.center.y + dyPx / zoom,
      );
    };

    const handleWindowPointerMove = (event: PointerEvent) => {
      if (event.pointerId !== wireSession.pointerId) return;
      autoPanViewportWhileWiring(event.clientX, event.clientY);
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
    sourceChildSlot: number,
  ) => {
    if (readOnly) return;
    event.preventDefault();
    event.stopPropagation();

    onProjectPatch((prev) => ({
      ...prev,
      links: prev.links.filter(
        (link) =>
          !linkUsesChildSlot(link, imageId, sourcePort, sourceChildSlot),
      ),
    }));

    selectCanvasImage(imageId);
    setWireSession({
      pointerId: event.pointerId,
      sourceKind: "canvasImage",
      sourceId: imageId,
      sourcePort,
      sourceChildSlot,
      startClientX: event.clientX,
      startClientY: event.clientY,
    });
    setWireCursorClient({ x: event.clientX, y: event.clientY });
  };

  let wirePath: string | null = null;
  if (wireSession && wireCursorClient && rootRef.current) {
    const rect = rootRef.current.getBoundingClientRect();
    const bx = wireCursorClient.x - rect.left;
    const by = wireCursorClient.y - rect.top;
    let sourceWorldPoint: { x: number; y: number } | null = null;

    if (wireSession.sourceKind === "canvasImage") {
      const sourceImage = (project.canvasImages ?? []).find(
        (image) => image.id === wireSession.sourceId,
      );
      if (sourceImage) {
        const g = normalizeCanvasImageGeometry(sourceImage);
        const visibleSlots = visibleChildSlotCount(
          project.links,
          sourceImage.id,
          wireSession.sourcePort,
        );
        sourceWorldPoint = edgeChildSlotPoint(
          {
            id: sourceImage.id,
            label: sourceImage.title ?? "",
            type: "resource",
            x: g.x,
            y: g.y,
          },
          wireSession.sourcePort,
          wireSession.sourceChildSlot,
          visibleSlots,
          g.width,
          g.height,
        );
      }
    } else {
      const sourceNode = project.nodes.find(
        (node) => node.id === wireSession.sourceId,
      );
      if (sourceNode) {
        const g = normalizeNodeGeometry(sourceNode);
        const visibleSlots = visibleChildSlotCount(
          project.links,
          sourceNode.id,
          wireSession.sourcePort,
        );
        sourceWorldPoint = edgeChildSlotPoint(
          sourceNode,
          wireSession.sourcePort,
          wireSession.sourceChildSlot,
          visibleSlots,
          g.width,
          g.height,
        );
      }
    }

    if (!sourceWorldPoint) {
      sourceWorldPoint = viewport.toWorld({
        x: wireSession.startClientX - rect.left,
        y: wireSession.startClientY - rect.top,
      });
    }

    const sourceScreen = viewport.toScreen(
      sourceWorldPoint.x,
      sourceWorldPoint.y,
    );
    // `viewport.toScreen` already returns coordinates in viewport-local space.
    // Overlay SVG is also viewport-local, so subtracting root rect offsets
    // the start anchor and makes the wire appear detached.
    const ax = sourceScreen.x;
    const ay = sourceScreen.y;
    const geometry = linkBezierGeometry(ax, ay, bx, by, wireSession.sourcePort, undefined);
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

  const startTouchReadOnlyNavigation = (
    event: ReactPointerEvent<HTMLElement>,
    selectTarget: () => void,
  ): boolean => {
      if (!touchNavigationMode || !readOnly || !viewport) return false;
      if (event.pointerType !== "touch") return false;

      event.stopPropagation();

      const root = rootRef.current;
      const toLocalClientPoint = (clientX: number, clientY: number) => {
        const rect = root?.getBoundingClientRect();
        return {
          x: clientX - (rect?.left ?? 0),
          y: clientY - (rect?.top ?? 0),
        };
      };
      const emitMoved = () => {
        viewport.emit("moved", { viewport, type: "drag" });
      };
      const emitZoomed = () => {
        viewport.emit("zoomed", { viewport, type: "pinch" });
      };
      const pointersToArray = (
        pointers: NonNullable<
          typeof touchReadOnlyNavigationRef.current
        >["pointers"],
      ) => Array.from(pointers.values());
      const distance = (
        a: { clientX: number; clientY: number },
        b: { clientX: number; clientY: number },
      ) => Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      const midpoint = (
        a: { clientX: number; clientY: number },
        b: { clientX: number; clientY: number },
      ) => ({
        clientX: (a.clientX + b.clientX) / 2,
        clientY: (a.clientY + b.clientY) / 2,
      });
      const resetSingleTouchStart = (
        session: NonNullable<typeof touchReadOnlyNavigationRef.current>,
      ) => {
        const [onlyPointer] = pointersToArray(session.pointers);
        if (!onlyPointer) return;
        onlyPointer.startClientX = onlyPointer.clientX;
        onlyPointer.startClientY = onlyPointer.clientY;
        session.startCenter = { x: viewport.center.x, y: viewport.center.y };
        session.startScale = Math.max(viewport.scale.x || 1, 0.01);
        session.startDistance = null;
        session.startMidWorld = null;
      };
      const resetPinchStart = (
        session: NonNullable<typeof touchReadOnlyNavigationRef.current>,
      ) => {
        const [first, second] = pointersToArray(session.pointers);
        if (!first || !second) return;
        const mid = midpoint(first, second);
        const localMid = toLocalClientPoint(mid.clientX, mid.clientY);
        const worldMid = viewport.toWorld(localMid);
        session.startCenter = { x: viewport.center.x, y: viewport.center.y };
        session.startScale = Math.max(viewport.scale.x || 1, 0.01);
        session.startDistance = Math.max(distance(first, second), 1);
        session.startMidWorld = { x: worldMid.x, y: worldMid.y };
        session.didMultiTouch = true;
      };
      const cleanup = () => {
        const session = touchReadOnlyNavigationRef.current;
        if (!session) return;
        detachTouchReadOnlyNavigation();
        touchReadOnlyNavigationRef.current = null;
      };

      let session = touchReadOnlyNavigationRef.current;
      if (!session) {
        session = {
          pointers: new Map(),
          startCenter: { x: viewport.center.x, y: viewport.center.y },
          startScale: Math.max(viewport.scale.x || 1, 0.01),
          startDistance: null,
          startMidWorld: null,
          didMove: false,
          didMultiTouch: false,
          selectTarget,
          detach: null,
        };
        touchReadOnlyNavigationRef.current = session;

        const handlePointerMove = (moveEvent: PointerEvent) => {
          const active = touchReadOnlyNavigationRef.current;
          if (!active) return;
          const pointer = active.pointers.get(moveEvent.pointerId);
          if (!pointer) return;

          pointer.clientX = moveEvent.clientX;
          pointer.clientY = moveEvent.clientY;

          const activePointers = pointersToArray(active.pointers);
          if (activePointers.length >= 2) {
            if (moveEvent.cancelable) moveEvent.preventDefault();
            const [first, second] = activePointers;
            if (!first || !second) return;
            if (!active.startDistance || !active.startMidWorld) {
              resetPinchStart(active);
              return;
            }

            const nextDistance = Math.max(distance(first, second), 1);
            const nextScale = active.startScale * (nextDistance / active.startDistance);
            const mid = midpoint(first, second);
            const localMid = toLocalClientPoint(mid.clientX, mid.clientY);
            const movedMidPx = Math.hypot(
              mid.clientX -
                (first.startClientX + second.startClientX) / 2,
              mid.clientY -
                (first.startClientY + second.startClientY) / 2,
            );
            if (
              Math.abs(nextDistance - active.startDistance) > 3 ||
              movedMidPx > 3
            ) {
              active.didMove = true;
            }

            viewport.setZoom(nextScale, false);
            const anchoredScreen = viewport.toScreen(
              active.startMidWorld.x,
              active.startMidWorld.y,
            );
            viewport.x += localMid.x - anchoredScreen.x;
            viewport.y += localMid.y - anchoredScreen.y;
            viewport.plugins.reset();
            emitZoomed();
            emitMoved();
            return;
          }

          const dx = pointer.clientX - pointer.startClientX;
          const dy = pointer.clientY - pointer.startClientY;
          if (Math.hypot(dx, dy) <= 4) return;
          if (moveEvent.cancelable) moveEvent.preventDefault();
          active.didMove = true;
          const scaleNow = Math.max(active.startScale, 0.01);
          viewport.moveCenter(
            active.startCenter.x - dx / scaleNow,
            active.startCenter.y - dy / scaleNow,
          );
          emitMoved();
        };

        const handlePointerUp = (upEvent: PointerEvent) => {
          const active = touchReadOnlyNavigationRef.current;
          if (!active) return;
          if (!active.pointers.has(upEvent.pointerId)) return;

          active.pointers.delete(upEvent.pointerId);

          if (active.pointers.size === 0) {
            const shouldSelect = !active.didMove && !active.didMultiTouch;
            const select = active.selectTarget;
            cleanup();
            if (shouldSelect) select();
            return;
          }

          if (active.pointers.size === 1) {
            resetSingleTouchStart(active);
          } else {
            resetPinchStart(active);
          }
        };

        const handleWindowBlur = () => {
          cleanup();
        };

        window.addEventListener("pointermove", handlePointerMove, {
          capture: true,
          passive: false,
        });
        window.addEventListener("pointerup", handlePointerUp, {
          capture: true,
        });
        window.addEventListener("pointercancel", handlePointerUp, {
          capture: true,
        });
        window.addEventListener("blur", handleWindowBlur);

        session.detach = () => {
          window.removeEventListener("pointermove", handlePointerMove, {
            capture: true,
          });
          window.removeEventListener("pointerup", handlePointerUp, {
            capture: true,
          });
          window.removeEventListener("pointercancel", handlePointerUp, {
            capture: true,
          });
          window.removeEventListener("blur", handleWindowBlur);
        };
      }

      session.selectTarget = selectTarget;
      session.pointers.set(event.pointerId, {
        startClientX: event.clientX,
        startClientY: event.clientY,
        clientX: event.clientX,
        clientY: event.clientY,
      });

      if (session.pointers.size >= 2) {
        resetPinchStart(session);
      } else {
        resetSingleTouchStart(session);
      }

      return true;
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
            links={project.links}
            viewport={viewport}
            worldViewBounds={worldViewBounds}
            zoom={zoom}
            viewportVersion={viewportVersion}
            isDark={isDark}
            layerZIndex={item.layerZIndex}
            readOnly={readOnly}
            touchNavigationMode={touchNavigationMode}
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
            onStartTouchReadOnlyNavigation={startTouchReadOnlyNavigation}
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
            touchNavigationMode={touchNavigationMode}
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
            onStartTouchReadOnlyNavigation={startTouchReadOnlyNavigation}
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

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  CanvasImageItem,
  LinkData,
  NodeData,
  NodeMarkdownBlock,
  NodePort,
  Project,
  ProjectPatchFn,
} from "../types/types";
import { MIN_DRAW_RECT, MIN_NODE_H, MIN_NODE_W } from "./constants";
import { CanvasBoard } from "./components/CanvasBoard";
import { CanvasImageCard } from "./components/CanvasImageCard";
import { CanvasEmptyHint } from "./components/CanvasEmptyHint";
import { LinksPanel } from "./components/LinksPanel";
import { NodeCard } from "./components/NodeCard";
import { NodeGraphSvg } from "./components/NodeGraphSvg";
import { useCanvasPasteImages } from "./hooks/use-canvas-paste-images";
import { useCanvasWheelZoom } from "./hooks/use-canvas-wheel-zoom";
import { useNodeCanvasKeyboard } from "./hooks/use-node-canvas-keyboard";
import {
  useScrollPanSession,
  type ScrollPanSession,
} from "./hooks/use-scroll-pan-session";
import {
  bboxPortPoint,
  clientToCanvas,
  clientToScrollContent,
  descriptionFromBlocks,
  edgeChildSlotPoint,
  linkUsesChildSlot,
  logDocumentNodesSummary,
  newMarkdownBlockId,
  newNodeId,
  normalizeDrawRect,
  oppositePort,
  resolveNodeLayout,
  runFitViewToNodes,
  semanticNodesSnapshot,
  visibleChildSlotCount,
} from "./utils";

interface NodeCanvasProps {
  project: Project;
  onProjectPatch: (fn: ProjectPatchFn) => void;
}

const EMPTY_CANVAS_IMAGES: CanvasImageItem[] = [];

type WireSession =
  | {
      kind: "node";
      sourceId: string;
      sourceEdge: NodePort;
      sourceChildSlot: number;
      pointerId: number;
    }
  | {
      kind: "canvasImage";
      sourceId: string;
      sourceEdge: NodePort;
      pointerId: number;
    };

type ResizeSession =
  | {
      kind: "node";
      id: string;
      pointerId: number;
      startX: number;
      startY: number;
      originW: number;
      originH: number;
    }
  | {
      kind: "canvasImage";
      id: string;
      pointerId: number;
      startX: number;
      startY: number;
      originW: number;
      originH: number;
    };

const NodeCanvas = ({ project, onProjectPatch }: NodeCanvasProps) => {
  const { nodes, links } = project;
  const canvasImages = project.canvasImages ?? EMPTY_CANVAS_IMAGES;
  const semanticSnapshotRef = useRef(semanticNodesSnapshot(project));
  useEffect(() => {
    semanticSnapshotRef.current = semanticNodesSnapshot(project);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- лише при перемиканні документа
  }, [project.id]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const scaleRef = useRef(1);
  scaleRef.current = scale;

  const [tabPanArmed, setTabPanArmed] = useState(false);
  const tabPanArmedRef = useRef(false);
  tabPanArmedRef.current = tabPanArmed;

  const [panSession, setPanSession] = useState<ScrollPanSession | null>(null);
  const panCaptureElRef = useRef<HTMLElement | null>(null);

  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [nodeLayouts, setNodeLayouts] = useState<
    Map<string, { w: number; h: number }>
  >(() => new Map());

  const [drag, setDrag] = useState<{
    id: string;
    pointerCanvasX: number;
    pointerCanvasY: number;
    originX: number;
    originY: number;
  } | null>(null);

  const [resize, setResize] = useState<ResizeSession | null>(null);

  const [imageDrag, setImageDrag] = useState<{
    id: string;
    pointerCanvasX: number;
    pointerCanvasY: number;
    originX: number;
    originY: number;
  } | null>(null);

  /** Кутки жесту в px координатах контенту скролу (для прев’ю на весь спейсер). */
  const [drawCreate, setDrawCreate] = useState<{
    pointerId: number;
    x0: number;
    y0: number;
    x1: number;
    y1: number;
  } | null>(null);

  const [wireSession, setWireSession] = useState<WireSession | null>(null);
  const [wireCursor, setWireCursor] = useState({ x: 0, y: 0 });

  const patch = useCallback(
    (fn: ProjectPatchFn) => {
      onProjectPatch((prev) => {
        const next = fn(prev);
        const snap = semanticNodesSnapshot(next);
        if (snap !== semanticSnapshotRef.current) {
          semanticSnapshotRef.current = snap;
          logDocumentNodesSummary(next);
        }
        return next;
      });
    },
    [onProjectPatch],
  );

  const patchRef = useRef(patch);
  patchRef.current = patch;

  useCanvasWheelZoom(scrollRef, setScale);
  useScrollPanSession(
    panSession,
    scrollRef,
    panCaptureElRef,
    setPanSession,
  );

  useLayoutEffect(() => {
    const m = new Map<string, { w: number; h: number }>();
    for (const n of nodes) {
      const el = nodeRefs.current.get(n.id);
      if (el) {
        m.set(n.id, { w: el.offsetWidth, h: el.offsetHeight });
      }
    }
    setNodeLayouts(m);
  }, [
    nodes,
    links,
    canvasImages,
    drag,
    resize,
    wireSession,
    drawCreate,
    project.lastModified,
    scale,
  ]);

  const layoutOf = useMemo(
    () => (id: string) => {
      const n = nodes.find((x) => x.id === id);
      return resolveNodeLayout(n, nodeLayouts.get(id));
    },
    [nodes, nodeLayouts],
  );

  const updateNode = (id: string, nodePatch: Partial<NodeData>) => {
    patch((p) => ({
      ...p,
      nodes: p.nodes.map((n) => (n.id === id ? { ...n, ...nodePatch } : n)),
    }));
  };

  const removeNode = (id: string) => {
    patch((p) => ({
      ...p,
      nodes: p.nodes.filter((n) => n.id !== id),
      links: p.links.filter((l) => l.source !== id && l.target !== id),
    }));
  };

  const removeCanvasImage = (id: string) => {
    patch((p) => {
      const list = p.canvasImages ?? [];
      const img = list.find((i) => i.id === id);
      if (img?.url.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(img.url);
        } catch {
          /* ignore */
        }
      }
      return {
        ...p,
        canvasImages: list.filter((i) => i.id !== id),
        links: p.links.filter((l) => l.source !== id && l.target !== id),
      };
    });
  };

  const addProjectLink = useCallback(
    (link: LinkData) => {
      patch((p) => {
        if (
          p.links.some(
            (l) =>
              (l.source === link.source && l.target === link.target) ||
              (l.source === link.target && l.target === link.source),
          )
        )
          return p;
        return { ...p, links: [...p.links, link] };
      });
    },
    [patch],
  );

  const nodesRef = useRef(nodes);
  nodesRef.current = nodes;
  const layoutsRef = useRef(nodeLayouts);
  layoutsRef.current = nodeLayouts;
  const canvasImagesRef = useRef(canvasImages);
  canvasImagesRef.current = canvasImages;
  const addProjectLinkRef = useRef(addProjectLink);
  addProjectLinkRef.current = addProjectLink;

  const fitViewToNodes = useCallback(() => {
    runFitViewToNodes(
      () => scrollRef.current,
      nodesRef.current,
      layoutsRef.current,
      canvasImagesRef.current,
      setScale,
    );
  }, []);

  useNodeCanvasKeyboard({
    scrollRef,
    fitViewToNodes,
    setTabPanArmed,
  });

  const onImagePasted = useCallback(
    (item: CanvasImageItem) => {
      patch((p) => ({
        ...p,
        canvasImages: [...(p.canvasImages ?? []), item],
      }));
    },
    [patch],
  );

  useCanvasPasteImages({
    scrollRef,
    scaleRef,
    onImagePasted,
  });

  const removeLink = (source: string, target: string) => {
    patch((p) => ({
      ...p,
      links: p.links.filter(
        (l) =>
          !(l.source === source && l.target === target) &&
          !(l.source === target && l.target === source),
      ),
    }));
  };

  const onNodePointerDown = (e: React.PointerEvent, node: NodeData) => {
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const { x, y } = clientToCanvas(
      e.clientX,
      e.clientY,
      scrollRef.current,
      scaleRef.current,
    );
    setDrag({
      id: node.id,
      pointerCanvasX: x,
      pointerCanvasY: y,
      originX: node.x ?? 0,
      originY: node.y ?? 0,
    });
  };

  const onNodePointerMove = (e: React.PointerEvent) => {
    if (!drag) return;
    const { x, y } = clientToCanvas(
      e.clientX,
      e.clientY,
      scrollRef.current,
      scaleRef.current,
    );
    const dx = x - drag.pointerCanvasX;
    const dy = y - drag.pointerCanvasY;
    updateNode(drag.id, {
      x: Math.max(0, drag.originX + dx),
      y: Math.max(0, drag.originY + dy),
    });
  };

  const onNodePointerUp = (e: React.PointerEvent) => {
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    setDrag(null);
  };

  const updateCanvasImage = (id: string, imgPatch: Partial<CanvasImageItem>) => {
    patch((p) => ({
      ...p,
      canvasImages: (p.canvasImages ?? []).map((im) =>
        im.id === id ? { ...im, ...imgPatch } : im,
      ),
    }));
  };

  const onImagePointerDown = (e: React.PointerEvent, image: CanvasImageItem) => {
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const { x, y } = clientToCanvas(
      e.clientX,
      e.clientY,
      scrollRef.current,
      scaleRef.current,
    );
    setImageDrag({
      id: image.id,
      pointerCanvasX: x,
      pointerCanvasY: y,
      originX: image.x,
      originY: image.y,
    });
  };

  const onImagePointerMove = (e: React.PointerEvent) => {
    if (!imageDrag) return;
    const { x, y } = clientToCanvas(
      e.clientX,
      e.clientY,
      scrollRef.current,
      scaleRef.current,
    );
    const dx = x - imageDrag.pointerCanvasX;
    const dy = y - imageDrag.pointerCanvasY;
    updateCanvasImage(imageDrag.id, {
      x: Math.max(0, imageDrag.originX + dx),
      y: Math.max(0, imageDrag.originY + dy),
    });
  };

  const onImagePointerUp = (e: React.PointerEvent) => {
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    setImageDrag(null);
  };

  const startWireFromChildSlot = (
    e: React.PointerEvent,
    sourceId: string,
    edge: NodePort,
    slot: number,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    patch((p) => ({
      ...p,
      links: p.links.filter((l) => !linkUsesChildSlot(l, sourceId, edge, slot)),
    }));
    const { x, y } = clientToCanvas(
      e.clientX,
      e.clientY,
      scrollRef.current,
      scaleRef.current,
    );
    setWireCursor({ x, y });
    setWireSession({
      kind: "node",
      sourceId,
      sourceEdge: edge,
      sourceChildSlot: slot,
      pointerId: e.pointerId,
    });
  };

  const startWireFromCanvasImage = (
    e: React.PointerEvent,
    sourceId: string,
    edge: NodePort,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const { x, y } = clientToCanvas(
      e.clientX,
      e.clientY,
      scrollRef.current,
      scaleRef.current,
    );
    setWireCursor({ x, y });
    setWireSession({
      kind: "canvasImage",
      sourceId,
      sourceEdge: edge,
      pointerId: e.pointerId,
    });
  };

  useEffect(() => {
    if (!wireSession) return;

    const onMove = (e: PointerEvent) => {
      if (e.pointerId !== wireSession.pointerId) return;
      setWireCursor(
        clientToCanvas(
          e.clientX,
          e.clientY,
          scrollRef.current,
          scaleRef.current,
        ),
      );
    };

    const onUp = (e: PointerEvent) => {
      if (e.pointerId !== wireSession.pointerId) return;

      const el = document.elementFromPoint(e.clientX, e.clientY);
      const portEl = el?.closest("[data-link-port]") as HTMLElement | null;
      const nodeEl = el?.closest("[data-node-id]") as HTMLElement | null;
      const canvasImgEl = el?.closest(
        "[data-canvas-image-id]",
      ) as HTMLElement | null;

      const targetNodeId = portEl?.dataset.nodeId ?? nodeEl?.dataset.nodeId;
      const targetPortAttr = portEl?.dataset.linkPort as NodePort | undefined;
      const targetCanvasImageId = canvasImgEl?.dataset.canvasImageId;
      const imageTargetPort = canvasImgEl?.dataset.linkPort as
        | NodePort
        | undefined;

      if (wireSession.kind === "node") {
        const { sourceId, sourceEdge, sourceChildSlot } = wireSession;
        if (targetCanvasImageId && targetCanvasImageId !== sourceId) {
          addProjectLinkRef.current({
            source: sourceId,
            target: targetCanvasImageId,
            sourcePort: sourceEdge,
            targetPort: imageTargetPort ?? oppositePort(sourceEdge),
            sourceChildSlot,
            targetIsCanvasImage: true,
          });
        } else if (targetNodeId && targetNodeId !== sourceId) {
          const targetNode = nodesRef.current.find((n) => n.id === targetNodeId);
          if (targetNode) {
            const targetPort: NodePort =
              targetPortAttr ?? oppositePort(sourceEdge);
            addProjectLinkRef.current({
              source: sourceId,
              target: targetNodeId,
              sourcePort: sourceEdge,
              targetPort,
              sourceChildSlot,
            });
          }
        }
      } else {
        const { sourceId, sourceEdge } = wireSession;
        if (targetNodeId && targetNodeId !== sourceId) {
          const targetNode = nodesRef.current.find((n) => n.id === targetNodeId);
          if (targetNode) {
            addProjectLinkRef.current({
              source: sourceId,
              target: targetNodeId,
              sourcePort: sourceEdge,
              targetPort: targetPortAttr ?? oppositePort(sourceEdge),
              sourceIsCanvasImage: true,
            });
          }
        } else if (targetCanvasImageId && targetCanvasImageId !== sourceId) {
          addProjectLinkRef.current({
            source: sourceId,
            target: targetCanvasImageId,
            sourcePort: sourceEdge,
            targetPort: imageTargetPort ?? oppositePort(sourceEdge),
            sourceIsCanvasImage: true,
            targetIsCanvasImage: true,
          });
        }
      }

      setWireSession(null);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [wireSession]);

  const resizeRef = useRef(resize);
  resizeRef.current = resize;

  useEffect(() => {
    if (!resize) return;

    const onMove = (e: PointerEvent) => {
      const r = resizeRef.current;
      if (!r || e.pointerId !== r.pointerId) return;
      const s = scaleRef.current;
      const dx = (e.clientX - r.startX) / s;
      const dy = (e.clientY - r.startY) / s;
      const nw = Math.max(MIN_NODE_W, r.originW + dx);
      const nh = Math.max(MIN_NODE_H, r.originH + dy);
      patchRef.current((p) => {
        if (r.kind === "node") {
          return {
            ...p,
            nodes: p.nodes.map((n) =>
              n.id === r.id ? { ...n, width: nw, height: nh } : n,
            ),
          };
        }
        return {
          ...p,
          canvasImages: (p.canvasImages ?? []).map((im) =>
            im.id === r.id ? { ...im, width: nw, height: nh } : im,
          ),
        };
      });
    };

    const onUp = (e: PointerEvent) => {
      const r = resizeRef.current;
      if (!r || e.pointerId !== r.pointerId) return;
      setResize(null);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [resize]);

  const drawCreateRef = useRef(drawCreate);
  drawCreateRef.current = drawCreate;

  useEffect(() => {
    if (!drawCreate) return;

    const onMove = (e: PointerEvent) => {
      const d = drawCreateRef.current;
      if (!d || e.pointerId !== d.pointerId) return;
      const { x, y } = clientToScrollContent(
        e.clientX,
        e.clientY,
        scrollRef.current,
      );
      setDrawCreate({ ...d, x1: x, y1: y });
    };

    const onUp = (e: PointerEvent) => {
      const d = drawCreateRef.current;
      if (!d || e.pointerId !== d.pointerId) return;

      const { x: x1, y: y1 } = clientToScrollContent(
        e.clientX,
        e.clientY,
        scrollRef.current,
      );
      const { left: lpx, top: tpx, w: rwPx, h: rhPx } = normalizeDrawRect(
        d.x0,
        d.y0,
        x1,
        y1,
      );

      if (rwPx >= MIN_DRAW_RECT && rhPx >= MIN_DRAW_RECT) {
        const s = Math.max(scaleRef.current, 0.01);
        const left = lpx / s;
        const top = tpx / s;
        const rw = rwPx / s;
        const rh = rhPx / s;
        patchRef.current((p) => {
          const i = p.nodes.length;
          const node: NodeData = {
            id: newNodeId(),
            label: `Нода ${i + 1}`,
            headingLevel: p.nodes.length === 0 ? 1 : 2,
            description: "",
            markdownBlocks: [{ id: newMarkdownBlockId(), text: "" }],
            type: "concept",
            x: Math.max(0, left),
            y: Math.max(0, top),
            width: rw,
            height: rh,
          };
          return { ...p, nodes: [...p.nodes, node] };
        });
      }

      setDrawCreate(null);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [drawCreate]);

  const onCanvasPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    if (drawCreate || wireSession || resize || panSession || imageDrag) return;

    if (tabPanArmedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      const el = scrollRef.current;
      if (!el) return;
      const captureEl = e.currentTarget as HTMLElement;
      panCaptureElRef.current = captureEl;
      try {
        captureEl.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      setPanSession({
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        scrollLeft0: el.scrollLeft,
        scrollTop0: el.scrollTop,
      });
      return;
    }

    const { x, y } = clientToScrollContent(
      e.clientX,
      e.clientY,
      scrollRef.current,
    );
    setDrawCreate({
      pointerId: e.pointerId,
      x0: x,
      y0: y,
      x1: x,
      y1: y,
    });
  };

  const wireStart: { x: number; y: number } | null = wireSession
    ? (() => {
        if (wireSession.kind === "canvasImage") {
          const img = canvasImages.find((i) => i.id === wireSession.sourceId);
          if (!img) return null;
          return bboxPortPoint(
            img.x,
            img.y,
            img.width,
            img.height,
            wireSession.sourceEdge,
          );
        }
        const n = nodes.find((x) => x.id === wireSession.sourceId);
        if (!n) return null;
        const { w, h } = layoutOf(wireSession.sourceId);
        const vis = visibleChildSlotCount(
          links,
          wireSession.sourceId,
          wireSession.sourceEdge,
        );
        return edgeChildSlotPoint(
          n,
          wireSession.sourceEdge,
          wireSession.sourceChildSlot,
          vis,
          w,
          h,
        );
      })()
    : null;

  const drawPreviewPx = drawCreate
    ? normalizeDrawRect(
        drawCreate.x0,
        drawCreate.y0,
        drawCreate.x1,
        drawCreate.y1,
      )
    : null;

  const setNodeRef = (id: string) => (el: HTMLDivElement | null) => {
    if (el) nodeRefs.current.set(id, el);
    else nodeRefs.current.delete(id);
  };

  const startResize = (e: React.PointerEvent, node: NodeData) => {
    e.preventDefault();
    e.stopPropagation();
    const { w, h } = layoutOf(node.id);
    setResize({
      kind: "node",
      id: node.id,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originW: node.width ?? w,
      originH: node.height ?? h,
    });
  };

  const startCanvasImageResize = (
    e: React.PointerEvent,
    image: CanvasImageItem,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setResize({
      kind: "canvasImage",
      id: image.id,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originW: image.width,
      originH: image.height,
    });
  };

  const wireDragging = wireSession !== null;

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <CanvasBoard
        scrollRef={scrollRef}
        scale={scale}
        canvasOverlayCursorClass={
          tabPanArmed || panSession
            ? panSession
              ? "cursor-grabbing"
              : "cursor-grab"
            : "cursor-crosshair"
        }
        onCanvasPointerDown={onCanvasPointerDown}
        drawPreviewRect={drawPreviewPx}
        graphLayer={({ spacerW, spacerH, scale: s }) => (
          <NodeGraphSvg
            scrollPxW={spacerW}
            scrollPxH={spacerH}
            pixelScale={s}
            links={links}
            nodes={nodes}
            canvasImages={canvasImages}
            layoutOf={layoutOf}
            wireStart={wireStart}
            wireCursor={wireCursor}
          />
        )}
      >
        {nodes.map((node) => (
          <NodeCard
            key={node.id}
            node={node}
            links={links}
            zIndex={drag?.id === node.id ? 25 : 2}
            wireDragging={wireDragging}
            onStartWireFromChildSlot={startWireFromChildSlot}
            onDragPointerDown={onNodePointerDown}
            onDragPointerMove={onNodePointerMove}
            onDragPointerUp={onNodePointerUp}
            onResizePointerDown={startResize}
            onLabelChange={(id, label) => updateNode(id, { label })}
            onHeadingLevelChange={(id, headingLevel) =>
              updateNode(id, { headingLevel })
            }
            onAccentColorChange={(id, hex) =>
              updateNode(id, { accentColor: hex })
            }
            onMarkdownBlocksChange={(
              id: string,
              blocks: NodeMarkdownBlock[],
            ) => {
              const safe =
                blocks.length > 0
                  ? blocks
                  : [{ id: newMarkdownBlockId(), text: "" }];
              updateNode(id, {
                markdownBlocks: safe,
                description: descriptionFromBlocks(safe),
              });
            }}
            onRemove={removeNode}
            setNodeRef={setNodeRef}
          />
        ))}

        {canvasImages.map((image) => (
          <CanvasImageCard
            key={image.id}
            image={image}
            zIndex={imageDrag?.id === image.id ? 25 : 3}
            wireDragging={wireDragging}
            onStartWireFromEdge={startWireFromCanvasImage}
            onDragPointerDown={onImagePointerDown}
            onDragPointerMove={onImagePointerMove}
            onDragPointerUp={onImagePointerUp}
            onResizePointerDown={startCanvasImageResize}
            onTitleChange={(id, t) =>
              updateCanvasImage(id, { title: t.trim() ? t : undefined })
            }
            onRemove={removeCanvasImage}
          />
        ))}

        <CanvasEmptyHint
          visible={
            nodes.length === 0 && canvasImages.length === 0 && !drawCreate
          }
        />
      </CanvasBoard>

      <LinksPanel
        links={links}
        nodes={nodes}
        canvasImages={canvasImages}
        onRemoveLink={removeLink}
      />
    </div>
  );
};

export default NodeCanvas;

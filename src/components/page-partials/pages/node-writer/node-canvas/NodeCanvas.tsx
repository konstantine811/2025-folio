import { MousePointer, Plus, Scissors } from "lucide-react";
import type { RefObject } from "react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import type {
  CanvasImageItem,
  LinkData,
  NodeData,
  NodeMarkdownBlock,
  NodePort,
  Project,
  ProjectPatchFn,
} from "../types/types";
import {
  MIN_DRAW_RECT,
  MIN_LINK_KNIFE_PATH_LENGTH_PX,
  MIN_LINK_KNIFE_POLYGON_VERTICES,
  MIN_LINK_KNIFE_SAMPLE_PX,
  MIN_MARQUEE_SELECT_RECT,
  MIN_NODE_H,
  MIN_NODE_W,
} from "./constants";
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
  computeCanvasImageResize,
  resolveCanvasImageAspectRatio,
} from "./utils/canvas-image-aspect";
import { NODE_WRITER_WORKSPACE_SCOPE } from "@/config/node-writer-access.config";
import { uploadNodeWriterCanvasPastedFile } from "@/services/firebase/node-writer-workspace";
import {
  activeElementAllowsCanvasShortcuts,
  isKeyboardTypingTarget,
  isLinkKnifeArmKeyDown,
  isLinkKnifeArmKeyUp,
} from "./utils/canvas-keyboard";
import {
  bboxPortPoint,
  clientToCanvas,
  clientToScrollContent,
  collectLinkKeysIntersectingLogicalPolygon,
  descriptionFromBlocks,
  edgeChildSlotPoint,
  inferPortAtPoint,
  linkStableKey,
  linkUsesChildSlot,
  logDocumentNodesSummary,
  newMarkdownBlockId,
  newNodeId,
  normalizeDrawRect,
  rectsIntersectLogical,
  resolveNodeLayout,
  runFitViewToNodes,
  semanticNodesSnapshot,
  visibleChildSlotCount,
} from "./utils";
import {
  layoutGetterFromRefs,
  resolveWireDropHighlight,
  type WireDropHighlight,
} from "./utils/wire-drop-highlight";

interface NodeCanvasProps {
  project: Project;
  onProjectPatch: (fn: ProjectPatchFn) => void;
  /** Лише перегляд і панорама (Tab+тягти), без редагування. */
  readOnly?: boolean;
  /**
   * Шапка + полотно: щоб гарячі клавіші працювали, коли фокус у тулбарі документа,
   * а не лише всередині скролу канвасу.
   */
  shortcutShellRef?: RefObject<HTMLElement | null>;
}

const EMPTY_CANVAS_IMAGES: CanvasImageItem[] = [];

/** Lucide не має MousePointerPlus — курсор + «плюс» як режим додавання до виділення (Shift). */
function ShiftSelectionIcon() {
  return (
    <span className="relative inline-flex h-4 w-4 shrink-0">
      <MousePointer
        className="absolute left-0 top-0 size-3.5 text-sky-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]"
        strokeWidth={2.25}
        aria-hidden
      />
      <Plus
        className="absolute -right-0.5 top-0 size-2 text-sky-200 drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]"
        strokeWidth={3}
        aria-hidden
      />
    </span>
  );
}

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
      /** naturalWidth / naturalHeight */
      aspectRatio: number;
    };

type DrawCreateNewNode = {
  mode: "newNode";
  pointerId: number;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
};
type DrawCreateMarqueeSelect = {
  mode: "marqueeSelect";
  pointerId: number;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
};
type DrawCreateLinkKnife = {
  mode: "linkKnife";
  pointerId: number;
  pointsScrollPx: Array<{ x: number; y: number }>;
};

const NodeCanvas = ({
  project,
  onProjectPatch,
  readOnly = false,
  shortcutShellRef,
}: NodeCanvasProps) => {
  const { nodes, links } = project;
  const canvasImages = project.canvasImages ?? EMPTY_CANVAS_IMAGES;
  const semanticSnapshotRef = useRef(semanticNodesSnapshot(project));
  useEffect(() => {
    semanticSnapshotRef.current = semanticNodesSnapshot(project);
    setSelectedNodeIds(new Set());
    setSelectedCanvasImageIds(new Set());
    // eslint-disable-next-line react-hooks/exhaustive-deps -- лише при перемиканні документа
  }, [project.id]);

  useEffect(() => {
    const valid = new Set(nodes.map((n) => n.id));
    setSelectedNodeIds((prev) => {
      const next = new Set([...prev].filter((id) => valid.has(id)));
      if (next.size === prev.size && [...prev].every((id) => next.has(id))) {
        return prev;
      }
      return next;
    });
  }, [nodes]);

  useEffect(() => {
    const valid = new Set(canvasImages.map((i) => i.id));
    setSelectedCanvasImageIds((prev) => {
      const next = new Set([...prev].filter((id) => valid.has(id)));
      if (next.size === prev.size && [...prev].every((id) => next.has(id))) {
        return prev;
      }
      return next;
    });
  }, [canvasImages]);

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

  /** Виділення нод (Shift+клік); перетягування рухає всю групу разом із canvas images. */
  const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(
    () => new Set(),
  );
  const selectedNodeIdsRef = useRef<Set<string>>(selectedNodeIds);
  selectedNodeIdsRef.current = selectedNodeIds;

  const [selectedCanvasImageIds, setSelectedCanvasImageIds] = useState<
    Set<string>
  >(() => new Set());
  const selectedCanvasImageIdsRef = useRef<Set<string>>(selectedCanvasImageIds);
  selectedCanvasImageIdsRef.current = selectedCanvasImageIds;

  const [drag, setDrag] = useState<{
    nodeIds: string[];
    canvasImageIds: string[];
    pointerId: number;
    pointerCanvasX: number;
    pointerCanvasY: number;
    nodeOrigins: Record<string, { x: number; y: number }>;
    canvasOrigins: Record<string, { x: number; y: number }>;
  } | null>(null);
  const dragRef = useRef(drag);
  dragRef.current = drag;

  /** Якщо pointerup не дійшов до ручки (втрата capture тощо), drag лишається — блокує клік по полотні й рухає ноди при move. */
  useEffect(() => {
    if (!drag) return;
    const pid = drag.pointerId;
    const endDrag = (e: PointerEvent) => {
      if (e.pointerId !== pid) return;
      setDrag(null);
    };
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);
    return () => {
      window.removeEventListener("pointerup", endDrag);
      window.removeEventListener("pointercancel", endDrag);
    };
  }, [drag]);

  const [resize, setResize] = useState<ResizeSession | null>(null);

  /** Жест малювання: нода — прямокутник; ніж — полігон у px скролу. */
  const [drawCreate, setDrawCreate] = useState<
    DrawCreateNewNode | DrawCreateMarqueeSelect | DrawCreateLinkKnife | null
  >(null);

  /** Затиснута K / «л» (UK) — малювання смугою перетинає й видаляє звʼязки. */
  const linkKnifeArmedRef = useRef(false);
  const [linkKnifeArmedUi, setLinkKnifeArmedUi] = useState(false);

  const setLinkKnifeArmed = useCallback((armed: boolean) => {
    linkKnifeArmedRef.current = armed;
    setLinkKnifeArmedUi(armed);
    if (!armed) setLinkKnifePointerClient(null);
  }, []);

  /** Позиція курсора (viewport) — плаваючі ножиці замість ненадійного `cursor: url()`. */
  const [linkKnifePointerClient, setLinkKnifePointerClient] = useState<{
    clientX: number;
    clientY: number;
  } | null>(null);

  const [wireSession, setWireSession] = useState<WireSession | null>(null);
  const [wireCursor, setWireCursor] = useState({ x: 0, y: 0 });
  const [wireDropHighlight, setWireDropHighlight] =
    useState<WireDropHighlight | null>(null);

  const patch = useCallback(
    (fn: ProjectPatchFn) => {
      if (readOnly) return;
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
    [onProjectPatch, readOnly],
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
    setSelectedNodeIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    patch((p) => ({
      ...p,
      nodes: p.nodes.filter((n) => n.id !== id),
      links: p.links.filter((l) => l.source !== id && l.target !== id),
    }));
  };

  const removeCanvasImage = (id: string) => {
    setSelectedCanvasImageIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
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
  const canvasImagesRef = useRef(canvasImages);
  canvasImagesRef.current = canvasImages;
  const linksRef = useRef(links);
  linksRef.current = links;
  const layoutsRef = useRef(nodeLayouts);
  layoutsRef.current = nodeLayouts;
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
    shortcutShellRef,
    fitViewToNodes,
    setTabPanArmed,
  });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (!isLinkKnifeArmKeyDown(e)) return;
      if (isKeyboardTypingTarget(e.target)) return;
      if (
        !activeElementAllowsCanvasShortcuts(
          scrollRef.current,
          shortcutShellRef?.current ?? null,
        )
      )
        return;
      setLinkKnifeArmed(true);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (!isLinkKnifeArmKeyUp(e)) return;
      setLinkKnifeArmed(false);
    };
    const onBlur = () => {
      setLinkKnifeArmed(false);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    };
  }, [setLinkKnifeArmed, shortcutShellRef]);

  useEffect(() => {
    if (!linkKnifeArmedUi || readOnly) {
      setLinkKnifePointerClient(null);
      return;
    }
    const sync = (e: PointerEvent) => {
      setLinkKnifePointerClient({ clientX: e.clientX, clientY: e.clientY });
    };
    window.addEventListener("pointermove", sync, { passive: true });
    window.addEventListener("pointerdown", sync, { passive: true });
    return () => {
      window.removeEventListener("pointermove", sync);
      window.removeEventListener("pointerdown", sync);
    };
  }, [linkKnifeArmedUi, readOnly]);

  const [shiftHeldUi, setShiftHeldUi] = useState(false);
  const [shiftPointerClient, setShiftPointerClient] = useState<{
    clientX: number;
    clientY: number;
  } | null>(null);

  useEffect(() => {
    const allowShiftUi = (target: EventTarget | null) => {
      if (readOnly) return false;
      if (isKeyboardTypingTarget(target)) return false;
      return activeElementAllowsCanvasShortcuts(
        scrollRef.current,
        shortcutShellRef?.current ?? null,
      );
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Shift") return;
      if (!allowShiftUi(e.target)) return;
      setShiftHeldUi(true);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key !== "Shift") return;
      setShiftHeldUi(false);
    };
    const onBlur = () => {
      setShiftHeldUi(false);
    };
    const onFocusIn = (e: Event) => {
      if (isKeyboardTypingTarget(e.target)) setShiftHeldUi(false);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focusin", onFocusIn);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focusin", onFocusIn);
    };
  }, [readOnly, shortcutShellRef]);

  useEffect(() => {
    if (!shiftHeldUi || readOnly || linkKnifeArmedUi) {
      setShiftPointerClient(null);
      return;
    }
    const sync = (e: PointerEvent) => {
      setShiftPointerClient({ clientX: e.clientX, clientY: e.clientY });
    };
    window.addEventListener("pointermove", sync, { passive: true });
    window.addEventListener("pointerdown", sync, { passive: true });
    return () => {
      window.removeEventListener("pointermove", sync);
      window.removeEventListener("pointerdown", sync);
    };
  }, [shiftHeldUi, readOnly, linkKnifeArmedUi]);

  const onImagePasted = useCallback(
    (item: CanvasImageItem, file: File) => {
      const projectId = project.id;
      const itemId = item.id;
      patch((p) => ({
        ...p,
        canvasImages: [...(p.canvasImages ?? []), item],
      }));
      void uploadNodeWriterCanvasPastedFile(
        NODE_WRITER_WORKSPACE_SCOPE,
        projectId,
        itemId,
        file,
      )
        .then((httpsUrl) => {
          patch((p) => {
            if (p.id !== projectId) return p;
            const list = p.canvasImages ?? [];
            if (!list.some((i) => i.id === itemId)) return p;
            const im = list.find((i) => i.id === itemId);
            const oldUrl = im?.url ?? "";
            if (oldUrl.startsWith("blob:")) {
              try {
                URL.revokeObjectURL(oldUrl);
              } catch {
                /* ignore */
              }
            }
            return {
              ...p,
              canvasImages: list.map((i) =>
                i.id === itemId ? { ...i, url: httpsUrl } : i,
              ),
            };
          });
        })
        .catch((e) => {
          console.error(
            "[Node writer] Не вдалося завантажити вставлене зображення в Storage",
            e,
          );
        });
    },
    [patch, project.id],
  );

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

  useCanvasPasteImages({
    scrollRef,
    shortcutShellRef,
    scaleRef,
    onImagePasted,
    enabled: !readOnly,
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
    if (readOnly) return;
    if (e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      setSelectedNodeIds((prev) => {
        const next = new Set(prev);
        if (next.has(node.id)) next.delete(node.id);
        else next.add(node.id);
        return next;
      });
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const { x, y } = clientToCanvas(
      e.clientX,
      e.clientY,
      scrollRef.current,
      scaleRef.current,
    );
    const selN = selectedNodeIdsRef.current;
    const selI = selectedCanvasImageIdsRef.current;
    if (!selN.has(node.id)) {
      setSelectedNodeIds(new Set([node.id]));
      setSelectedCanvasImageIds(new Set());
    }
    const nodeIdsToMove = selN.has(node.id) ? [...selN] : [node.id];
    const canvasIdsToMove = selN.has(node.id) ? [...selI] : [];
    const nodeOrigins: Record<string, { x: number; y: number }> = {};
    for (const id of nodeIdsToMove) {
      const n = nodes.find((item) => item.id === id);
      if (n) nodeOrigins[id] = { x: n.x ?? 0, y: n.y ?? 0 };
    }
    const canvasOrigins: Record<string, { x: number; y: number }> = {};
    for (const id of canvasIdsToMove) {
      const im = canvasImages.find((item) => item.id === id);
      if (im) canvasOrigins[id] = { x: im.x, y: im.y };
    }
    const nids = nodeIdsToMove.filter((id) => nodeOrigins[id] != null);
    const cids = canvasIdsToMove.filter((id) => canvasOrigins[id] != null);
    if (nids.length === 0 && cids.length === 0) return;
    setDrag({
      nodeIds: nids,
      canvasImageIds: cids,
      pointerId: e.pointerId,
      pointerCanvasX: x,
      pointerCanvasY: y,
      nodeOrigins,
      canvasOrigins,
    });
  };

  const onDragGroupPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d || e.pointerId !== d.pointerId) return;
    const { x, y } = clientToCanvas(
      e.clientX,
      e.clientY,
      scrollRef.current,
      scaleRef.current,
    );
    const dx = x - d.pointerCanvasX;
    const dy = y - d.pointerCanvasY;
    patch((p) => ({
      ...p,
      nodes: p.nodes.map((n) => {
        if (!d.nodeIds.includes(n.id)) return n;
        const o = d.nodeOrigins[n.id];
        if (!o) return n;
        return {
          ...n,
          x: Math.max(0, o.x + dx),
          y: Math.max(0, o.y + dy),
        };
      }),
      canvasImages: (p.canvasImages ?? []).map((im) => {
        if (!d.canvasImageIds.includes(im.id)) return im;
        const o = d.canvasOrigins[im.id];
        if (!o) return im;
        return {
          ...im,
          x: Math.max(0, o.x + dx),
          y: Math.max(0, o.y + dy),
        };
      }),
    }));
  };

  const onNodePointerUp = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (d && e.pointerId !== d.pointerId) return;
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
    if (readOnly) return;
    if (e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      setSelectedCanvasImageIds((prev) => {
        const next = new Set(prev);
        if (next.has(image.id)) next.delete(image.id);
        else next.add(image.id);
        return next;
      });
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const { x, y } = clientToCanvas(
      e.clientX,
      e.clientY,
      scrollRef.current,
      scaleRef.current,
    );
    const selN = selectedNodeIdsRef.current;
    const selI = selectedCanvasImageIdsRef.current;
    if (!selI.has(image.id)) {
      setSelectedCanvasImageIds(new Set([image.id]));
      setSelectedNodeIds(new Set());
    }
    const canvasIdsToMove = selI.has(image.id) ? [...selI] : [image.id];
    const nodeIdsToMove = selI.has(image.id) ? [...selN] : [];
    const nodeOrigins: Record<string, { x: number; y: number }> = {};
    for (const id of nodeIdsToMove) {
      const n = nodes.find((item) => item.id === id);
      if (n) nodeOrigins[id] = { x: n.x ?? 0, y: n.y ?? 0 };
    }
    const canvasOrigins: Record<string, { x: number; y: number }> = {};
    for (const id of canvasIdsToMove) {
      const im = canvasImages.find((item) => item.id === id);
      if (im) canvasOrigins[id] = { x: im.x, y: im.y };
    }
    const nids = nodeIdsToMove.filter((id) => nodeOrigins[id] != null);
    const cids = canvasIdsToMove.filter((id) => canvasOrigins[id] != null);
    if (nids.length === 0 && cids.length === 0) return;
    setDrag({
      nodeIds: nids,
      canvasImageIds: cids,
      pointerId: e.pointerId,
      pointerCanvasX: x,
      pointerCanvasY: y,
      nodeOrigins,
      canvasOrigins,
    });
  };

  const onImagePointerUp = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (d && e.pointerId !== d.pointerId) return;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    setDrag(null);
  };

  const startWireFromChildSlot = (
    e: React.PointerEvent,
    sourceId: string,
    edge: NodePort,
    slot: number,
  ) => {
    if (readOnly) return;
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
    if (readOnly) return;
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
      const lg = layoutGetterFromRefs(
        nodesRef.current,
        layoutsRef.current,
      );
      setWireDropHighlight(
        resolveWireDropHighlight(
          e.clientX,
          e.clientY,
          wireSession,
          scrollRef.current,
          scaleRef.current,
          nodesRef.current,
          canvasImagesRef.current,
          lg,
          linksRef.current,
        ),
      );
    };

    const onUp = (e: PointerEvent) => {
      if (e.pointerId !== wireSession.pointerId) return;

      setWireDropHighlight(null);

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

      const dropPt = clientToCanvas(
        e.clientX,
        e.clientY,
        scrollRef.current,
        scaleRef.current,
      );
      const layoutFor = (id: string) =>
        resolveNodeLayout(
          nodesRef.current.find((n) => n.id === id),
          layoutsRef.current.get(id),
        );

      if (wireSession.kind === "node") {
        const { sourceId, sourceEdge, sourceChildSlot } = wireSession;
        if (targetCanvasImageId && targetCanvasImageId !== sourceId) {
          const img = canvasImagesRef.current.find(
            (i) => i.id === targetCanvasImageId,
          );
          if (img) {
            const targetPort: NodePort =
              imageTargetPort ??
              inferPortAtPoint(
                dropPt.x,
                dropPt.y,
                img.x,
                img.y,
                img.width,
                img.height,
              );
            addProjectLinkRef.current({
              source: sourceId,
              target: targetCanvasImageId,
              sourcePort: sourceEdge,
              targetPort,
              sourceChildSlot,
              targetIsCanvasImage: true,
            });
          }
        } else if (targetNodeId && targetNodeId !== sourceId) {
          const targetNode = nodesRef.current.find((n) => n.id === targetNodeId);
          if (targetNode) {
            const { w, h } = layoutFor(targetNodeId);
            const targetPort: NodePort =
              targetPortAttr ??
              inferPortAtPoint(
                dropPt.x,
                dropPt.y,
                targetNode.x ?? 0,
                targetNode.y ?? 0,
                w,
                h,
              );
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
            const { w, h } = layoutFor(targetNodeId);
            const targetPort: NodePort =
              targetPortAttr ??
              inferPortAtPoint(
                dropPt.x,
                dropPt.y,
                targetNode.x ?? 0,
                targetNode.y ?? 0,
                w,
                h,
              );
            addProjectLinkRef.current({
              source: sourceId,
              target: targetNodeId,
              sourcePort: sourceEdge,
              targetPort,
              sourceIsCanvasImage: true,
            });
          }
        } else if (targetCanvasImageId && targetCanvasImageId !== sourceId) {
          const img = canvasImagesRef.current.find(
            (i) => i.id === targetCanvasImageId,
          );
          if (img) {
            const targetPort: NodePort =
              imageTargetPort ??
              inferPortAtPoint(
                dropPt.x,
                dropPt.y,
                img.x,
                img.y,
                img.width,
                img.height,
              );
            addProjectLinkRef.current({
              source: sourceId,
              target: targetCanvasImageId,
              sourcePort: sourceEdge,
              targetPort,
              sourceIsCanvasImage: true,
              targetIsCanvasImage: true,
            });
          }
        }
      }

      setWireSession(null);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      setWireDropHighlight(null);
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
      patchRef.current((p) => {
        if (r.kind === "node") {
          const nw = Math.max(MIN_NODE_W, r.originW + dx);
          const nh = Math.max(MIN_NODE_H, r.originH + dy);
          return {
            ...p,
            nodes: p.nodes.map((n) =>
              n.id === r.id ? { ...n, width: nw, height: nh } : n,
            ),
          };
        }
        const { w: nw, h: nh } = computeCanvasImageResize(
          r.originW,
          r.originH,
          dx,
          dy,
          r.aspectRatio,
          MIN_NODE_W,
          MIN_NODE_H,
        );
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
      if (d.mode === "linkKnife") {
        const pts = d.pointsScrollPx;
        const last = pts[pts.length - 1];
        if (
          last &&
          Math.hypot(x - last.x, y - last.y) < MIN_LINK_KNIFE_SAMPLE_PX
        ) {
          return;
        }
        setDrawCreate({
          ...d,
          pointsScrollPx: [...pts, { x, y }],
        });
        return;
      }
      if (d.mode === "newNode" || d.mode === "marqueeSelect") {
        setDrawCreate({ ...d, x1: x, y1: y });
      }
    };

    const onUp = (e: PointerEvent) => {
      const d = drawCreateRef.current;
      if (!d || e.pointerId !== d.pointerId) return;

      const { x: x1, y: y1 } = clientToScrollContent(
        e.clientX,
        e.clientY,
        scrollRef.current,
      );

      if (d.mode === "linkKnife") {
        let pts = d.pointsScrollPx;
        const last = pts[pts.length - 1];
        if (
          !last ||
          Math.hypot(x1 - last.x, y1 - last.y) >= MIN_LINK_KNIFE_SAMPLE_PX
        ) {
          pts = [...pts, { x: x1, y: y1 }];
        }
        const n = pts.length;
        if (n >= MIN_LINK_KNIFE_POLYGON_VERTICES) {
          let per = 0;
          for (let i = 0; i < n - 1; i++) {
            per += Math.hypot(pts[i + 1]!.x - pts[i]!.x, pts[i + 1]!.y - pts[i]!.y);
          }
          per += Math.hypot(pts[0]!.x - pts[n - 1]!.x, pts[0]!.y - pts[n - 1]!.y);
          if (per >= MIN_LINK_KNIFE_PATH_LENGTH_PX) {
            const s = Math.max(scaleRef.current, 0.01);
            const polyLogical = pts.map((p) => ({
              x: p.x / s,
              y: p.y / s,
            }));
            patchRef.current((p) => {
              const layoutGetter = (id: string) => {
                const node = p.nodes.find((x) => x.id === id);
                return resolveNodeLayout(node, layoutsRef.current.get(id));
              };
              const cut = collectLinkKeysIntersectingLogicalPolygon(
                p.links,
                p.nodes,
                p.canvasImages ?? EMPTY_CANVAS_IMAGES,
                layoutGetter,
                polyLogical,
              );
              if (cut.size === 0) return p;
              return {
                ...p,
                links: p.links.filter((l) => !cut.has(linkStableKey(l))),
              };
            });
          }
        }
        setDrawCreate(null);
        return;
      }

      const { left: lpx, top: tpx, w: rwPx, h: rhPx } = normalizeDrawRect(
        d.x0,
        d.y0,
        x1,
        y1,
      );

      if (d.mode === "marqueeSelect") {
        if (rwPx >= MIN_MARQUEE_SELECT_RECT && rhPx >= MIN_MARQUEE_SELECT_RECT) {
          const s = Math.max(scaleRef.current, 0.01);
          const selLeft = lpx / s;
          const selTop = tpx / s;
          const selW = rwPx / s;
          const selH = rhPx / s;
          const selRect = {
            left: selLeft,
            top: selTop,
            w: selW,
            h: selH,
          };
          const pickedNodes: string[] = [];
          for (const n of nodesRef.current) {
            const layout = resolveNodeLayout(n, layoutsRef.current.get(n.id));
            const nx = n.x ?? 0;
            const ny = n.y ?? 0;
            const nodeRect = {
              left: nx,
              top: ny,
              w: layout.w,
              h: layout.h,
            };
            if (rectsIntersectLogical(selRect, nodeRect)) {
              pickedNodes.push(n.id);
            }
          }
          const pickedImages: string[] = [];
          for (const im of canvasImagesRef.current) {
            const nodeRect = {
              left: im.x,
              top: im.y,
              w: im.width,
              h: im.height,
            };
            if (rectsIntersectLogical(selRect, nodeRect)) {
              pickedImages.push(im.id);
            }
          }
          if (pickedNodes.length > 0 || pickedImages.length > 0) {
            if (pickedNodes.length > 0) {
              setSelectedNodeIds((prev) => {
                const next = new Set(prev);
                for (const id of pickedNodes) next.add(id);
                return next;
              });
            }
            if (pickedImages.length > 0) {
              setSelectedCanvasImageIds((prev) => {
                const next = new Set(prev);
                for (const id of pickedImages) next.add(id);
                return next;
              });
            }
          }
        }
        setDrawCreate(null);
        return;
      }

      if (d.mode === "newNode" && rwPx >= MIN_DRAW_RECT && rhPx >= MIN_DRAW_RECT) {
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

  useEffect(() => {
    if (!drawCreate) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (isKeyboardTypingTarget(e.target)) return;
      e.preventDefault();
      e.stopPropagation();
      setDrawCreate(null);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [drawCreate]);

  const onCanvasPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    if (drag) setDrag(null);
    if (drawCreate || wireSession || resize || panSession) return;

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

    if (readOnly) return;

    const { x, y } = clientToScrollContent(
      e.clientX,
      e.clientY,
      scrollRef.current,
    );
    if (linkKnifeArmedRef.current) {
      setSelectedNodeIds(new Set());
      setSelectedCanvasImageIds(new Set());
      setDrawCreate({
        mode: "linkKnife",
        pointerId: e.pointerId,
        pointsScrollPx: [{ x, y }],
      });
    } else if (e.shiftKey) {
      setDrawCreate({
        mode: "marqueeSelect",
        pointerId: e.pointerId,
        x0: x,
        y0: y,
        x1: x,
        y1: y,
      });
    } else {
      setSelectedNodeIds(new Set());
      setSelectedCanvasImageIds(new Set());
      setDrawCreate({
        mode: "newNode",
        pointerId: e.pointerId,
        x0: x,
        y0: y,
        x1: x,
        y1: y,
      });
    }
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

  const drawPreviewPx =
    drawCreate?.mode === "newNode" || drawCreate?.mode === "marqueeSelect"
      ? normalizeDrawRect(
          drawCreate.x0,
          drawCreate.y0,
          drawCreate.x1,
          drawCreate.y1,
        )
      : null;

  const knifePolygonPreviewPoints =
    drawCreate?.mode === "linkKnife" ? drawCreate.pointsScrollPx : null;

  const setNodeRef = (id: string) => (el: HTMLDivElement | null) => {
    if (el) nodeRefs.current.set(id, el);
    else nodeRefs.current.delete(id);
  };

  const startResize = (e: React.PointerEvent, node: NodeData) => {
    if (readOnly) return;
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
    if (readOnly) return;
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
      aspectRatio: resolveCanvasImageAspectRatio(image),
    });
  };

  const linkedCanvasImageIds = useMemo(() => {
    const ids = new Set<string>();
    for (const l of links) {
      if (l.sourceIsCanvasImage === true) ids.add(l.source);
      if (l.targetIsCanvasImage === true) ids.add(l.target);
    }
    return ids;
  }, [links]);

  const wireDragging = wireSession !== null;

  const linkKnifeScissorsProps = {
    className:
      "size-3.5 shrink-0 text-red-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]",
    strokeWidth: 2.25 as const,
  };

  const showShiftChrome =
    !readOnly && shiftHeldUi && !linkKnifeArmedUi;

  const shiftCursorPortal =
    typeof document !== "undefined" &&
    showShiftChrome &&
    shiftPointerClient
      ? createPortal(
          <div
            className="pointer-events-none fixed left-0 top-0 z-[99998]"
            style={{
              transform: `translate(${shiftPointerClient.clientX}px, ${shiftPointerClient.clientY}px)`,
            }}
            aria-hidden
          >
            <ShiftSelectionIcon />
          </div>,
          document.body,
        )
      : null;

  const linkKnifeCursorPortal =
    typeof document !== "undefined" &&
    !readOnly &&
    linkKnifeArmedUi &&
    linkKnifePointerClient
      ? createPortal(
          <div
            className="pointer-events-none fixed left-0 top-0 z-[99999]"
            style={{
              transform: `translate(${linkKnifePointerClient.clientX}px, ${linkKnifePointerClient.clientY}px)`,
            }}
            aria-hidden
          >
            <Scissors {...linkKnifeScissorsProps} aria-hidden />
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      {shiftCursorPortal}
      {linkKnifeCursorPortal}
      {!readOnly && (linkKnifeArmedUi || showShiftChrome) ? (
        <div className="pointer-events-none absolute top-3 right-4 z-[80] flex flex-col items-end gap-2">
          {linkKnifeArmedUi ? (
            <div
              className="flex items-center gap-1.5 rounded-full border border-red-400/40 bg-red-950/55 px-2.5 py-1 text-[10px] font-medium text-red-100/95 shadow-md backdrop-blur-sm"
              role="status"
              aria-live="polite"
            >
              <Scissors {...linkKnifeScissorsProps} aria-hidden />
              Ніж по звʼязках
            </div>
          ) : null}
          {showShiftChrome ? (
            <div
              className="flex items-center gap-1.5 rounded-full border border-sky-400/40 bg-sky-950/55 px-2.5 py-1 text-[10px] font-medium text-sky-100/95 shadow-md backdrop-blur-sm"
              role="status"
              aria-live="polite"
            >
              <ShiftSelectionIcon />
              Shift — група · рамка
            </div>
          ) : null}
        </div>
      ) : null}
      <CanvasBoard
        scrollRef={scrollRef}
        scale={scale}
        linkKnifeDrawPreview={drawCreate?.mode === "linkKnife"}
        canvasOverlayCursorClass={
          tabPanArmed || panSession
            ? panSession
              ? "cursor-grabbing"
              : "cursor-grab"
            : readOnly
              ? "cursor-default"
              : linkKnifeArmedUi
                ? "cursor-none"
                : showShiftChrome
                  ? "cursor-none"
                  : "cursor-crosshair"
        }
        onCanvasPointerDown={onCanvasPointerDown}
        drawPreviewRect={drawPreviewPx}
        marqueeSelectPreview={drawCreate?.mode === "marqueeSelect"}
        knifePolygonPreviewPoints={knifePolygonPreviewPoints}
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
            readOnly={readOnly}
            node={node}
            links={links}
            zIndex={
              drag?.nodeIds.includes(node.id) ? 25 : 2
            }
            wireDragging={wireDragging}
            multiSelected={selectedNodeIds.has(node.id)}
            onStartWireFromChildSlot={startWireFromChildSlot}
            onDragPointerDown={onNodePointerDown}
            onDragPointerMove={onDragGroupPointerMove}
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
            uploadMarkdownPasteImage={
              readOnly ? undefined : uploadMarkdownPasteImage
            }
            onRemove={removeNode}
            setNodeRef={setNodeRef}
            wireDropHighlightPort={
              wireDropHighlight?.targetKind === "node" &&
              wireDropHighlight.nodeId === node.id
                ? wireDropHighlight.port
                : null
            }
            wireDropHighlightAllowed={
              wireDropHighlight?.targetKind === "node" &&
              wireDropHighlight.nodeId === node.id
                ? wireDropHighlight.dropAllowed
                : true
            }
          />
        ))}

        {canvasImages.map((image) => (
          <CanvasImageCard
            key={image.id}
            readOnly={readOnly}
            linked={linkedCanvasImageIds.has(image.id)}
            image={image}
            zIndex={
              drag?.canvasImageIds.includes(image.id) ? 25 : 3
            }
            wireDragging={wireDragging}
            multiSelected={selectedCanvasImageIds.has(image.id)}
            highlightDropPort={
              wireDropHighlight?.targetKind === "canvasImage" &&
              wireDropHighlight.imageId === image.id
                ? wireDropHighlight.port
                : null
            }
            highlightDropAllowed={
              wireDropHighlight?.targetKind === "canvasImage" &&
              wireDropHighlight.imageId === image.id
                ? wireDropHighlight.dropAllowed
                : true
            }
            onStartWireFromEdge={startWireFromCanvasImage}
            onDragPointerDown={onImagePointerDown}
            onDragPointerMove={onDragGroupPointerMove}
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
        readOnly={readOnly}
        links={links}
        nodes={nodes}
        canvasImages={canvasImages}
        onRemoveLink={removeLink}
      />
    </div>
  );
};

export default NodeCanvas;

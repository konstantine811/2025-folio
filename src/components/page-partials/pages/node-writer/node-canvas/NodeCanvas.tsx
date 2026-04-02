import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  LinkData,
  NodeData,
  NodePort,
  Project,
  ProjectPatchFn,
} from "../types/types";
import {
  DEFAULT_NODE_H,
  DEFAULT_NODE_W,
  MIN_DRAW_RECT,
  MIN_NODE_H,
  MIN_NODE_W,
} from "./constants";
import { CanvasBoard } from "./components/CanvasBoard";
import { CanvasEmptyHint } from "./components/CanvasEmptyHint";
import { LinksPanel } from "./components/LinksPanel";
import { NodeCanvasToolbar } from "./components/NodeCanvasToolbar";
import { NodeCard } from "./components/NodeCard";
import { NodeGraphSvg } from "./components/NodeGraphSvg";
import {
  clientToCanvas,
  inferPortAtPoint,
  linkUsesPort,
  newNodeId,
  normalizeDrawRect,
  portPoint,
  resolveNodeLayout,
} from "./utils";

interface NodeCanvasProps {
  project: Project;
  onProjectPatch: (fn: ProjectPatchFn) => void;
}

const NodeCanvas = ({ project, onProjectPatch }: NodeCanvasProps) => {
  const { nodes, links } = project;
  const scrollRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [nodeLayouts, setNodeLayouts] = useState<
    Map<string, { w: number; h: number }>
  >(() => new Map());

  const [drag, setDrag] = useState<{
    id: string;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  const [resize, setResize] = useState<{
    id: string;
    pointerId: number;
    startX: number;
    startY: number;
    originW: number;
    originH: number;
  } | null>(null);

  const [drawCreate, setDrawCreate] = useState<{
    pointerId: number;
    x0: number;
    y0: number;
    x1: number;
    y1: number;
  } | null>(null);

  const [wireSession, setWireSession] = useState<{
    sourceId: string;
    sourcePort: NodePort;
    pointerId: number;
  } | null>(null);
  const [wireCursor, setWireCursor] = useState({ x: 0, y: 0 });

  const patch = useCallback(
    (fn: ProjectPatchFn) => {
      onProjectPatch(fn);
    },
    [onProjectPatch],
  );

  const patchRef = useRef(patch);
  patchRef.current = patch;

  useLayoutEffect(() => {
    const m = new Map<string, { w: number; h: number }>();
    for (const n of nodes) {
      const el = nodeRefs.current.get(n.id);
      if (el) {
        m.set(n.id, { w: el.offsetWidth, h: el.offsetHeight });
      }
    }
    setNodeLayouts(m);
  }, [nodes, links, drag, resize, wireSession, drawCreate, project.lastModified]);

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

  const addLinkWithPorts = useCallback(
    (
      source: string,
      target: string,
      sourcePort: NodePort,
      targetPort: NodePort,
    ) => {
      if (source === target) return;
      patch((p) => {
        const exists = p.links.some(
          (l) =>
            (l.source === source && l.target === target) ||
            (l.source === target && l.target === source),
        );
        if (exists) return p;
        const link: LinkData = {
          source,
          target,
          sourcePort,
          targetPort,
        };
        return { ...p, links: [...p.links, link] };
      });
    },
    [patch],
  );

  const nodesRef = useRef(nodes);
  nodesRef.current = nodes;
  const layoutsRef = useRef(nodeLayouts);
  layoutsRef.current = nodeLayouts;
  const addLinkRef = useRef(addLinkWithPorts);
  addLinkRef.current = addLinkWithPorts;

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
    setDrag({
      id: node.id,
      startX: e.clientX,
      startY: e.clientY,
      originX: node.x ?? 0,
      originY: node.y ?? 0,
    });
  };

  const onNodePointerMove = (e: React.PointerEvent) => {
    if (!drag) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
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

  const startWire = (
    e: React.PointerEvent,
    sourceId: string,
    sourcePort: NodePort,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    patch((p) => ({
      ...p,
      links: p.links.filter((l) => !linkUsesPort(l, sourceId, sourcePort)),
    }));
    const { x, y } = clientToCanvas(e.clientX, e.clientY, scrollRef.current);
    setWireCursor({ x, y });
    setWireSession({
      sourceId,
      sourcePort,
      pointerId: e.pointerId,
    });
  };

  useEffect(() => {
    if (!wireSession) return;

    const onMove = (e: PointerEvent) => {
      if (e.pointerId !== wireSession.pointerId) return;
      setWireCursor(
        clientToCanvas(e.clientX, e.clientY, scrollRef.current),
      );
    };

    const onUp = (e: PointerEvent) => {
      if (e.pointerId !== wireSession.pointerId) return;

      const scrollEl = scrollRef.current;
      const { x: px, y: py } = clientToCanvas(
        e.clientX,
        e.clientY,
        scrollEl,
      );

      const el = document.elementFromPoint(e.clientX, e.clientY);
      const portEl = el?.closest("[data-link-port]") as HTMLElement | null;
      const nodeEl = el?.closest("[data-node-id]") as HTMLElement | null;

      const targetIdAttr = portEl?.dataset.nodeId ?? nodeEl?.dataset.nodeId;
      const targetPortAttr = portEl?.dataset.linkPort as NodePort | undefined;

      const { sourceId, sourcePort } = wireSession;

      if (targetIdAttr && targetIdAttr !== sourceId) {
        const targetNode = nodesRef.current.find((n) => n.id === targetIdAttr);
        if (targetNode) {
          const layout =
            layoutsRef.current.get(targetIdAttr) ?? {
              w: targetNode.width ?? DEFAULT_NODE_W,
              h: targetNode.height ?? DEFAULT_NODE_H,
            };
          const tx = targetNode.x ?? 0;
          const ty = targetNode.y ?? 0;
          const targetPort: NodePort =
            targetPortAttr ??
            inferPortAtPoint(px, py, tx, ty, layout.w, layout.h);
          addLinkRef.current(sourceId, targetIdAttr, sourcePort, targetPort);
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
      const dx = e.clientX - r.startX;
      const dy = e.clientY - r.startY;
      const nw = Math.max(MIN_NODE_W, r.originW + dx);
      const nh = Math.max(MIN_NODE_H, r.originH + dy);
      patchRef.current((p) => ({
        ...p,
        nodes: p.nodes.map((n) =>
          n.id === r.id ? { ...n, width: nw, height: nh } : n,
        ),
      }));
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
      const { x, y } = clientToCanvas(e.clientX, e.clientY, scrollRef.current);
      setDrawCreate({ ...d, x1: x, y1: y });
    };

    const onUp = (e: PointerEvent) => {
      const d = drawCreateRef.current;
      if (!d || e.pointerId !== d.pointerId) return;

      const { x: x1, y: y1 } = clientToCanvas(
        e.clientX,
        e.clientY,
        scrollRef.current,
      );
      const { left, top, w: rw, h: rh } = normalizeDrawRect(
        d.x0,
        d.y0,
        x1,
        y1,
      );

      if (rw >= MIN_DRAW_RECT && rh >= MIN_DRAW_RECT) {
        patchRef.current((p) => {
          const i = p.nodes.length;
          const node: NodeData = {
            id: newNodeId(),
            label: `Нода ${i + 1}`,
            description: "",
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
    if (drawCreate || wireSession || resize) return;
    const { x, y } = clientToCanvas(e.clientX, e.clientY, scrollRef.current);
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
        const n = nodes.find((x) => x.id === wireSession.sourceId);
        if (!n) return null;
        const { w, h } = layoutOf(wireSession.sourceId);
        return portPoint(n, wireSession.sourcePort, w, h);
      })()
    : null;

  const drawRectPreview = drawCreate
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
      id: node.id,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originW: node.width ?? w,
      originH: node.height ?? h,
    });
  };

  const wireDragging = wireSession !== null;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <NodeCanvasToolbar />

      <CanvasBoard scrollRef={scrollRef} onCanvasPointerDown={onCanvasPointerDown}>
        <NodeGraphSvg
          links={links}
          nodes={nodes}
          layoutOf={layoutOf}
          wireStart={wireStart}
          wireCursor={wireCursor}
          drawRect={drawRectPreview}
        />

        {nodes.map((node) => (
          <NodeCard
            key={node.id}
            node={node}
            zIndex={drag?.id === node.id ? 25 : 2}
            wireDragging={wireDragging}
            onStartWire={startWire}
            onDragPointerDown={onNodePointerDown}
            onDragPointerMove={onNodePointerMove}
            onDragPointerUp={onNodePointerUp}
            onResizePointerDown={startResize}
            onLabelChange={(id, label) => updateNode(id, { label })}
            onDescriptionChange={(id, description) =>
              updateNode(id, { description })
            }
            onRemove={removeNode}
            setNodeRef={setNodeRef}
          />
        ))}

        <CanvasEmptyHint visible={nodes.length === 0 && !drawCreate} />
      </CanvasBoard>

      <LinksPanel links={links} nodes={nodes} onRemoveLink={removeLink} />
    </div>
  );
};

export default NodeCanvas;

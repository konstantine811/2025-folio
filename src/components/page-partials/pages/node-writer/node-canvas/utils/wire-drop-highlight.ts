import type {
  CanvasImageItem,
  LinkData,
  NodeData,
  NodePort,
} from "../../types/types";
import { clientToCanvas } from "./canvas-coords";
import { inferPortAtPoint, type LayoutGetter } from "./geometry";
import { resolveNodeLayout } from "./layout";

export type WireDropHighlight =
  | { targetKind: "node"; nodeId: string; port: NodePort; dropAllowed: boolean }
  | {
      targetKind: "canvasImage";
      imageId: string;
      port: NodePort;
      dropAllowed: boolean;
    };

/** Чи вже є звʼязок між цими двома елементами (незалежно від напрямку). */
export function endpointsAlreadyLinked(
  links: LinkData[],
  a: string,
  b: string,
): boolean {
  return links.some(
    (l) =>
      (l.source === a && l.target === b) ||
      (l.source === b && l.target === a),
  );
}

type WireKind = "node" | "canvasImage";

function sourceIdFromSession(session: {
  kind: WireKind;
  sourceId: string;
}): string {
  return session.sourceId;
}

/**
 * Який порт цілі підсвітити під час ведення звʼязку (під курсором).
 */
export function resolveWireDropHighlight(
  clientX: number,
  clientY: number,
  session: { kind: WireKind; sourceId: string },
  scrollEl: HTMLDivElement | null,
  scale: number,
  nodes: NodeData[],
  canvasImages: CanvasImageItem[],
  layoutGetter: LayoutGetter,
  links: LinkData[],
): WireDropHighlight | null {
  const src = sourceIdFromSession(session);
  const el = document.elementFromPoint(clientX, clientY);
  if (!el) return null;

  const portEl = el.closest("[data-link-port]") as HTMLElement | null;
  const portAttr = portEl?.dataset.linkPort as NodePort | undefined;

  if (portEl && portAttr) {
    const nid = portEl.dataset.nodeId;
    if (nid) {
      if (nid === src) return null;
      return {
        targetKind: "node",
        nodeId: nid,
        port: portAttr,
        dropAllowed: !endpointsAlreadyLinked(links, src, nid),
      };
    }
    const iid = portEl.dataset.canvasImageId;
    if (iid) {
      if (iid === src) return null;
      return {
        targetKind: "canvasImage",
        imageId: iid,
        port: portAttr,
        dropAllowed: !endpointsAlreadyLinked(links, src, iid),
      };
    }
  }

  const { x: px, y: py } = clientToCanvas(clientX, clientY, scrollEl, scale);

  const nodeEl = el.closest("[data-node-id]") as HTMLElement | null;
  const nodeIdBody = nodeEl?.dataset.nodeId;
  if (nodeIdBody) {
    if (nodeIdBody === src) return null;
    const n = nodes.find((x) => x.id === nodeIdBody);
    if (!n) return null;
    const { w, h } = layoutGetter(nodeIdBody);
    const port = inferPortAtPoint(px, py, n.x ?? 0, n.y ?? 0, w, h);
    return {
      targetKind: "node",
      nodeId: nodeIdBody,
      port,
      dropAllowed: !endpointsAlreadyLinked(links, src, nodeIdBody),
    };
  }

  const imgEl = el.closest("[data-canvas-image-id]") as HTMLElement | null;
  const imgId = imgEl?.dataset.canvasImageId;
  if (imgId) {
    if (imgId === src) return null;
    const im = canvasImages.find((i) => i.id === imgId);
    if (!im) return null;
    const port = inferPortAtPoint(px, py, im.x, im.y, im.width, im.height);
    return {
      targetKind: "canvasImage",
      imageId: imgId,
      port,
      dropAllowed: !endpointsAlreadyLinked(links, src, imgId),
    };
  }

  return null;
}

/** Layout для `resolveWireDropHighlight` з виміряних розмірів нод. */
export function layoutGetterFromRefs(
  nodes: NodeData[],
  layouts: Map<string, { w: number; h: number }>,
): LayoutGetter {
  return (id: string) => {
    const n = nodes.find((x) => x.id === id);
    return resolveNodeLayout(n, layouts.get(id));
  };
}

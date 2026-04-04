import type { CSSProperties } from "react";
import type { LinkData, NodePort } from "../../types/types";
import {
  NODE_PORT_EDGE_INSET,
  NODE_PORT_HANDLE_PX,
  NODE_PORT_SLOT_GAP,
  PORT_LABELS,
} from "../constants";
import { visibleChildSlotCount } from "../utils";

const EDGES: NodePort[] = ["n", "e", "s", "w"];

const SLOT_FLEX_GAP_PX = NODE_PORT_SLOT_GAP - NODE_PORT_HANDLE_PX;

export interface ChildSlotsProps {
  /** Якщо true — слоти не показуються (режим перегляду). */
  readOnly?: boolean;
  nodeId: string;
  links: LinkData[];
  wireDragging: boolean;
  /** Підсвітка боку, куди зараз «приліпить» звʼязок під курсором. */
  highlightDropPort?: NodePort | null;
  /** Якщо false — пара вже зʼєднана; показуємо червону обводку замість білої. */
  highlightDropAllowed?: boolean;
  onPointerDown: (
    e: React.PointerEvent,
    nodeId: string,
    edge: NodePort,
    slot: number,
  ) => void;
}

function edgeGroupPositionStyle(edge: NodePort): CSSProperties {
  const d = NODE_PORT_EDGE_INSET;
  switch (edge) {
    case "n":
      return { left: "50%", top: d, transform: "translateX(-50%)" };
    case "s":
      return { left: "50%", bottom: d, transform: "translateX(-50%)" };
    case "e":
      return { right: d, top: "50%", transform: "translateY(-50%)" };
    case "w":
      return { left: d, top: "50%", transform: "translateY(-50%)" };
  }
}

function edgeGroupLayoutClass(edge: NodePort): string {
  return edge === "n" || edge === "s"
    ? "flex flex-row items-center justify-center"
    : "flex flex-col items-center justify-center";
}

/** Кольори портів за стороною (як у node-based AI UI: різні типи «каналів»). */
const EDGE_PORT_RING: Record<NodePort, string> = {
  e: "border-sky-400/80 bg-sky-400 text-sky-950 shadow-[0_0_10px_rgba(56,189,248,0.45)]",
  w: "border-emerald-400/80 bg-emerald-400 text-emerald-950 shadow-[0_0_10px_rgba(52,211,153,0.4)]",
  n: "border-amber-400/80 bg-amber-400 text-amber-950 shadow-[0_0_10px_rgba(251,191,36,0.45)]",
  s: "border-rose-400/80 bg-rose-400 text-rose-950 shadow-[0_0_10px_rgba(251,113,133,0.4)]",
};

function EdgeSlotGroup({
  nodeId,
  links,
  edge,
  wireDragging,
  highlightDropPort,
  highlightDropAllowed = true,
  onPointerDown,
}: ChildSlotsProps & { edge: NodePort }) {
  const count = visibleChildSlotCount(links, nodeId, edge);
  const slots = Array.from({ length: count }, (_, i) => i + 1);

  return (
    <div
      className={`absolute z-[45] ${edgeGroupLayoutClass(edge)}`}
      style={{
        ...edgeGroupPositionStyle(edge),
        gap: SLOT_FLEX_GAP_PX,
      }}
    >
      {slots.map((slot) => (
        <button
          key={slot}
          type="button"
          data-node-id={nodeId}
          data-link-port={edge}
          data-source-child-edge={edge}
          data-source-child-slot={String(slot)}
          title={`${PORT_LABELS[edge]} · слот ${slot}`}
          className={`flex cursor-crosshair touch-manipulation items-center justify-center rounded-full border border-solid p-0 font-mono text-[6px] font-bold leading-none transition-all ${EDGE_PORT_RING[edge]} ${
            highlightDropPort === edge
              ? highlightDropAllowed
                ? "z-[55] scale-110 opacity-100 ring-2 ring-white/95 ring-offset-2 ring-offset-zinc-950"
                : "z-[55] scale-110 opacity-100 ring-2 ring-red-500 ring-offset-2 ring-offset-zinc-950 shadow-[0_0_12px_rgba(239,68,68,0.55)]"
              : wireDragging
                ? "opacity-100"
                : "opacity-0 group-hover/node-card:opacity-100"
          } hover:scale-110`}
          style={{
            width: NODE_PORT_HANDLE_PX,
            minWidth: NODE_PORT_HANDLE_PX,
            height: NODE_PORT_HANDLE_PX,
          }}
          onPointerDown={(e) => onPointerDown(e, nodeId, edge, slot)}
        >
          {slot}
        </button>
      ))}
    </div>
  );
}

export function ChildSlotHandles(props: ChildSlotsProps) {
  if (props.readOnly) return null;
  return (
    <>
      {EDGES.map((edge) => (
        <EdgeSlotGroup key={edge} {...props} edge={edge} />
      ))}
    </>
  );
}

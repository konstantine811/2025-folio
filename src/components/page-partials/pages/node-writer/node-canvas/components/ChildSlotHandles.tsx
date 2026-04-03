import type { CSSProperties } from "react";
import type { LinkData, NodePort } from "../../types/types";
import { PORT_LABELS } from "../constants";
import { visibleChildSlotCount } from "../utils";

const EDGES: NodePort[] = ["n", "e", "s", "w"];

export interface ChildSlotsProps {
  nodeId: string;
  links: LinkData[];
  wireDragging: boolean;
  onPointerDown: (
    e: React.PointerEvent,
    nodeId: string,
    edge: NodePort,
    slot: number,
  ) => void;
}

function edgePositionStyle(
  edge: NodePort,
  slot: number,
  count: number,
): CSSProperties {
  const t = `${(slot / (count + 1)) * 100}%`;
  switch (edge) {
    case "e":
      return { top: t, right: 0 };
    case "w":
      return { top: t, left: 0 };
    case "n":
      return { left: t, top: 0 };
    case "s":
      return { left: t, bottom: 0 };
  }
}

function edgeTransformClass(edge: NodePort): string {
  switch (edge) {
    case "e":
      return "translate-x-1/2 -translate-y-1/2";
    case "w":
      return "-translate-x-1/2 -translate-y-1/2";
    case "n":
      return "-translate-x-1/2 -translate-y-1/2";
    case "s":
      return "-translate-x-1/2 translate-y-1/2";
  }
}

function EdgeSlotRow({
  nodeId,
  links,
  edge,
  wireDragging,
  onPointerDown,
}: ChildSlotsProps & { edge: NodePort }) {
  const count = visibleChildSlotCount(links, nodeId, edge);
  const slots = Array.from({ length: count }, (_, i) => i + 1);
  const tf = edgeTransformClass(edge);

  return (
    <>
      {slots.map((slot) => (
        <button
          key={slot}
          type="button"
          data-node-id={nodeId}
          data-source-child-edge={edge}
          data-source-child-slot={String(slot)}
          title={`${PORT_LABELS[edge]} · слот ${slot}`}
          style={edgePositionStyle(edge, slot, count)}
          className={`absolute z-[45] flex h-6 min-w-6 cursor-crosshair touch-manipulation items-center justify-center rounded-full border border-border/40 bg-primary px-1 font-mono text-[9px] font-bold text-primary-foreground shadow-sm transition-opacity ${tf} ${
            wireDragging
              ? "opacity-100"
              : "opacity-0 group-hover/node-card:opacity-100"
          } hover:scale-110 hover:bg-primary/90`}
          onPointerDown={(e) => onPointerDown(e, nodeId, edge, slot)}
        >
          {slot}
        </button>
      ))}
    </>
  );
}

export function ChildSlotHandles(props: ChildSlotsProps) {
  return (
    <>
      {EDGES.map((edge) => (
        <EdgeSlotRow key={edge} {...props} edge={edge} />
      ))}
    </>
  );
}

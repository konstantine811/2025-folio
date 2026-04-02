import { useId } from "react";
import type { LinkData, NodeData } from "../../types/types";
import { getLinkEndpoints, type LayoutGetter } from "../utils";

interface NodeGraphSvgProps {
  links: LinkData[];
  nodes: NodeData[];
  layoutOf: LayoutGetter;
  wireStart: { x: number; y: number } | null;
  wireCursor: { x: number; y: number };
  drawRect: { left: number; top: number; w: number; h: number } | null;
}

export function NodeGraphSvg({
  links,
  nodes,
  layoutOf,
  wireStart,
  wireCursor,
  drawRect,
}: NodeGraphSvgProps) {
  const rawId = useId();
  const uid = rawId.replace(/:/g, "");
  const arrowId = `link-arrow-${uid}`;
  const arrowWireId = `wire-arrow-${uid}`;

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-[1] h-full w-full"
      aria-hidden
    >
      <defs>
        <marker
          id={arrowId}
          viewBox="0 0 12 12"
          refX="11"
          refY="6"
          markerWidth="18"
          markerHeight="18"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path
            d="M0 0 L12 6 L0 12 Z"
            fill="rgba(0,255,156,0.92)"
            stroke="rgba(0,0,0,0.45)"
            strokeWidth={0.75}
            strokeLinejoin="round"
          />
        </marker>
        <marker
          id={arrowWireId}
          viewBox="0 0 12 12"
          refX="11"
          refY="6"
          markerWidth="18"
          markerHeight="18"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path
            d="M0 0 L12 6 L0 12 Z"
            fill="rgba(0,255,156,1)"
            stroke="rgba(0,0,0,0.5)"
            strokeWidth={0.75}
            strokeLinejoin="round"
          />
        </marker>
      </defs>

      {links.map((l) => {
        const ends = getLinkEndpoints(l, nodes, layoutOf);
        if (!ends) return null;
        return (
          <line
            key={`${l.source}-${l.target}`}
            x1={ends.a.x}
            y1={ends.a.y}
            x2={ends.b.x}
            y2={ends.b.y}
            stroke="rgba(0,255,156,0.4)"
            strokeWidth={2}
            markerEnd={`url(#${arrowId})`}
          />
        );
      })}
      {wireStart && (
        <line
          x1={wireStart.x}
          y1={wireStart.y}
          x2={wireCursor.x}
          y2={wireCursor.y}
          stroke="rgba(0,255,156,0.75)"
          strokeWidth={2}
          strokeDasharray="6 4"
          markerEnd={`url(#${arrowWireId})`}
        />
      )}
      {drawRect && (
        <rect
          x={drawRect.left}
          y={drawRect.top}
          width={drawRect.w}
          height={drawRect.h}
          fill="rgba(0,255,156,0.06)"
          stroke="rgba(0,255,156,0.5)"
          strokeWidth={1}
          strokeDasharray="4 3"
        />
      )}
    </svg>
  );
}

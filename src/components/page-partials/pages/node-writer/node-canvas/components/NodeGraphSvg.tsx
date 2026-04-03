import { useId } from "react";
import type { CanvasImageItem, LinkData, NodeData } from "../../types/types";
import { getLinkEndpoints, type LayoutGetter } from "../utils";

interface NodeGraphSvgProps {
  /** Ширина/висота SVG у px контенту скролу (як спейсер). */
  scrollPxW: number;
  scrollPxH: number;
  /** Множник логічних координат полотна → px скролу (поточний zoom). */
  pixelScale: number;
  links: LinkData[];
  nodes: NodeData[];
  canvasImages: CanvasImageItem[];
  layoutOf: LayoutGetter;
  wireStart: { x: number; y: number } | null;
  wireCursor: { x: number; y: number };
}

export function NodeGraphSvg({
  scrollPxW,
  scrollPxH,
  pixelScale,
  links,
  nodes,
  canvasImages,
  layoutOf,
  wireStart,
  wireCursor,
}: NodeGraphSvgProps) {
  const rawId = useId();
  const uid = rawId.replace(/:/g, "");
  const arrowId = `link-arrow-${uid}`;
  const arrowWireId = `wire-arrow-${uid}`;
  const ps = pixelScale > 0 ? pixelScale : 1;
  const sx = (x: number) => x * ps;
  const sy = (y: number) => y * ps;

  return (
    <svg
      width={scrollPxW}
      height={scrollPxH}
      className="pointer-events-none absolute left-0 top-0 block"
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
            fill="var(--primary)"
            fillOpacity={0.92}
            stroke="var(--foreground)"
            strokeOpacity={0.35}
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
            fill="var(--primary)"
            stroke="var(--foreground)"
            strokeOpacity={0.4}
            strokeWidth={0.75}
            strokeLinejoin="round"
          />
        </marker>
      </defs>

      {links.map((l) => {
        const ends = getLinkEndpoints(l, nodes, canvasImages, layoutOf, links);
        if (!ends) return null;
        return (
          <line
            key={`${l.source}-${l.target}-${String(l.sourceIsCanvasImage)}-${String(l.targetIsCanvasImage)}-${l.sourcePort ?? ""}-${l.targetPort ?? ""}-${l.sourceChildSlot ?? ""}`}
            x1={sx(ends.a.x)}
            y1={sy(ends.a.y)}
            x2={sx(ends.b.x)}
            y2={sy(ends.b.y)}
            stroke="var(--primary)"
            strokeOpacity={0.45}
            strokeWidth={2}
            markerEnd={`url(#${arrowId})`}
          />
        );
      })}
      {wireStart && (
        <line
          x1={sx(wireStart.x)}
          y1={sy(wireStart.y)}
          x2={sx(wireCursor.x)}
          y2={sy(wireCursor.y)}
          stroke="var(--primary)"
          strokeOpacity={0.75}
          strokeWidth={2}
          strokeDasharray="6 4"
          markerEnd={`url(#${arrowWireId})`}
        />
      )}
    </svg>
  );
}

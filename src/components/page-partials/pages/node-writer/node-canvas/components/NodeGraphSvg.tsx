import { useId } from "react";
import type { CanvasImageItem, LinkData, NodeData } from "../../types/types";
import {
  getLinkEndpoints,
  linkBezierPathD,
  resolveLinkSourcePortForBezier,
  type LayoutGetter,
} from "../utils";

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

/** Номер на імпульсі збігається з номером слота порту джерела (або 1 для legacy / зображення). */
function linkPulseSlotLabel(link: LinkData): string {
  if (typeof link.sourceChildSlot === "number") return String(link.sourceChildSlot);
  return "1";
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
  const pulseBlurId = `nw-pulse-blur-${uid}`;
  const ps = pixelScale > 0 ? pixelScale : 1;
  const sx = (x: number) => x * ps;
  const sy = (y: number) => y * ps;

  return (
    <svg
      width={scrollPxW}
      height={scrollPxH}
      className="pointer-events-none absolute left-0 top-0 block text-foreground/55"
      aria-hidden
    >
      <defs>
        <marker
          id={arrowId}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path
            d="M0 0 L10 5 L0 10 Z"
            fill="currentColor"
            fillOpacity={0.5}
          />
        </marker>
        <marker
          id={arrowWireId}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="8"
          markerHeight="8"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path
            d="M0 0 L10 5 L0 10 Z"
            fill="currentColor"
            fillOpacity={0.65}
          />
        </marker>
        <filter
          id={pulseBlurId}
          x="-80%"
          y="-80%"
          width="260%"
          height="260%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {links.map((l, linkIdx) => {
        const ends = getLinkEndpoints(l, nodes, canvasImages, layoutOf, links);
        if (!ends) return null;
        const x1 = sx(ends.a.x);
        const y1 = sy(ends.a.y);
        const x2 = sx(ends.b.x);
        const y2 = sy(ends.b.y);
        const d = linkBezierPathD(
          x1,
          y1,
          x2,
          y2,
          resolveLinkSourcePortForBezier(l),
          l.targetPort,
        );
        const pathId = `nw-lk-${uid}-${linkIdx}`;
        const rowKey = `${l.source}-${l.target}-${String(l.sourceIsCanvasImage)}-${String(l.targetIsCanvasImage)}-${l.sourcePort ?? ""}-${l.targetPort ?? ""}-${l.sourceChildSlot ?? ""}`;
        const slotLabel = linkPulseSlotLabel(l);
        /** Тривалість проходу вздовж звʼязку — більше = повільніший сигнал. */
        const durSec = 5.2 + (linkIdx % 5) * 0.45;
        const beginSec = ((linkIdx * 0.41) % 2.8).toFixed(2);
        const pulsePhase = ((linkIdx * 0.31) % 1.2).toFixed(2);
        const pulseDur = 1.55 + (linkIdx % 3) * 0.12;

        return (
          <g key={rowKey}>
            <path
              id={pathId}
              d={d}
              fill="none"
              stroke="currentColor"
              strokeOpacity={0.38}
              strokeWidth={1.65}
              strokeLinecap="round"
              strokeLinejoin="round"
              markerEnd={`url(#${arrowId})`}
            />
            <g>
              <animateMotion
                dur={`${durSec}s`}
                repeatCount="indefinite"
                rotate="0"
                begin={`${beginSec}s`}
                calcMode="linear"
              >
                <mpath href={`#${pathId}`} />
              </animateMotion>
              {/* Зовнішнє м’яке світіння — пульс прозорості */}
              <circle r={11} cx={0} cy={0} fill="currentColor" fillOpacity={0.06}>
                <animate
                  attributeName="fill-opacity"
                  values="0.02;0.09;0.02"
                  dur={`${pulseDur}s`}
                  repeatCount="indefinite"
                  begin={`${pulsePhase}s`}
                  calcMode="spline"
                  keySplines="0.4 0 0.2 1;0.4 0 0.2 1"
                  keyTimes="0;0.5;1"
                />
              </circle>
              <circle
                r={6}
                cx={0}
                cy={0}
                fill="currentColor"
                fillOpacity={0.1}
                filter={`url(#${pulseBlurId})`}
              >
                <animate
                  attributeName="fill-opacity"
                  values="0.04;0.2;0.04"
                  dur={`${pulseDur}s`}
                  repeatCount="indefinite"
                  begin={`${pulsePhase}s`}
                  calcMode="spline"
                  keySplines="0.4 0 0.2 1;0.4 0 0.2 1"
                  keyTimes="0;0.5;1"
                />
              </circle>
              {/* Ледь помітне ядро */}
              <circle
                r={3.1}
                cx={0}
                cy={0}
                fill="currentColor"
                fillOpacity={0.22}
                stroke="currentColor"
                strokeOpacity={0.18}
                strokeWidth={0.55}
              >
                <animate
                  attributeName="fill-opacity"
                  values="0.14;0.32;0.14"
                  dur={`${pulseDur}s`}
                  repeatCount="indefinite"
                  begin={`${pulsePhase}s`}
                  calcMode="spline"
                  keySplines="0.4 0 0.2 1;0.4 0 0.2 1"
                  keyTimes="0;0.5;1"
                />
                <animate
                  attributeName="stroke-opacity"
                  values="0.1;0.28;0.1"
                  dur={`${pulseDur}s`}
                  repeatCount="indefinite"
                  begin={`${pulsePhase}s`}
                  calcMode="spline"
                  keySplines="0.4 0 0.2 1;0.4 0 0.2 1"
                  keyTimes="0;0.5;1"
                />
              </circle>
              <text
                x={0}
                y={0}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={7}
                fontWeight={600}
                fill="currentColor"
                fillOpacity={0.42}
                className="pointer-events-none select-none"
              >
                <animate
                  attributeName="fill-opacity"
                  values="0.28;0.52;0.28"
                  dur={`${pulseDur}s`}
                  repeatCount="indefinite"
                  begin={`${pulsePhase}s`}
                  calcMode="spline"
                  keySplines="0.4 0 0.2 1;0.4 0 0.2 1"
                  keyTimes="0;0.5;1"
                />
                {slotLabel}
              </text>
            </g>
          </g>
        );
      })}
      {wireStart && (
        <path
          d={linkBezierPathD(
            sx(wireStart.x),
            sy(wireStart.y),
            sx(wireCursor.x),
            sy(wireCursor.y),
            undefined,
            undefined,
          )}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.55}
          strokeWidth={1.65}
          strokeLinecap="round"
          strokeDasharray="5 4"
          markerEnd={`url(#${arrowWireId})`}
        />
      )}
    </svg>
  );
}

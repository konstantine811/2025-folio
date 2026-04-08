import type { Viewport } from "pixi-viewport";
import { useTick } from "@pixi/react";
import { useMemo, useState } from "react";
import type { LinkData, NodeData, Project } from "../../types/types";
import {
  getLinkEndpoints,
  linkBezierGeometry,
  resolveLinkSourcePortForBezier,
} from "../utils";
import {
  normalizeCanvasImageGeometry,
  normalizeNodeGeometry,
} from "./shared/types";
import { useEditorStore } from "./store/editorStore";

type Props = {
  viewport: Viewport;
  nodes: NodeData[];
  links: LinkData[];
  canvasImages: Project["canvasImages"];
};

const LINK_COLOR = 0x94a3b8;
const LINK_ALPHA = 0.58;
const LINK_WIDTH = 2.25;
const ARROW_LENGTH = 11;
const ARROW_HALF_WIDTH = 4.5;

function cubicBezierPoint(
  p0: number,
  p1: number,
  p2: number,
  p3: number,
  t: number,
) {
  const mt = 1 - t;
  return (
    mt * mt * mt * p0 +
    3 * mt * mt * t * p1 +
    3 * mt * t * t * p2 +
    t * t * t * p3
  );
}

const LinkLayer = ({ viewport, nodes, links, canvasImages }: Props) => {
  const viewportVersion = useEditorStore((s) => s.viewportVersion);
  void viewportVersion;
  const [animTimeMs, setAnimTimeMs] = useState(0);
  useTick((ticker) => {
    if (links.length === 0) return;
    setAnimTimeMs((prev) => prev + ticker.deltaMS);
  });

  const normalizedCanvasImages = useMemo(
    () =>
      canvasImages.map((image) => ({
        ...image,
        ...normalizeCanvasImageGeometry(image),
      })),
    [canvasImages],
  );

  const normalizedNodes = useMemo(
    () =>
      nodes.map((node) => {
        const geometry = normalizeNodeGeometry(node);
        return {
          ...node,
          ...geometry,
        };
      }),
    [nodes],
  );

  const nodeLayoutMap = useMemo(
    () =>
      new Map(
        normalizedNodes.map((node) => [
          node.id,
          { w: node.width ?? 220, h: node.height ?? 180 },
        ]),
      ),
    [normalizedNodes],
  );

  return (
    <pixiContainer
      ref={(instance) => {
        if (instance && !viewport.children.includes(instance)) {
          viewport.addChild(instance);
        }
      }}
    >
      <pixiGraphics
        draw={(g) => {
          g.clear();
          const pad = 280;
          const screenW = viewport.screenWidth || window.innerWidth;
          const screenH = viewport.screenHeight || window.innerHeight;
          const va = viewport.toWorld({ x: 0, y: 0 });
          const vb = viewport.toWorld({ x: screenW, y: screenH });
          const minX = Math.min(va.x, vb.x) - pad;
          const maxX = Math.max(va.x, vb.x) + pad;
          const minY = Math.min(va.y, vb.y) - pad;
          const maxY = Math.max(va.y, vb.y) + pad;

          const layoutOf = (nodeId: string) => {
            return nodeLayoutMap.get(nodeId) ?? { w: 220, h: 180 };
          };

          for (const [linkIndex, link] of links.entries()) {
            const endpoints = getLinkEndpoints(
              link,
              normalizedNodes,
              normalizedCanvasImages,
              layoutOf,
              links,
            );

            if (!endpoints) continue;
            const minLx = Math.min(endpoints.a.x, endpoints.b.x);
            const maxLx = Math.max(endpoints.a.x, endpoints.b.x);
            const minLy = Math.min(endpoints.a.y, endpoints.b.y);
            const maxLy = Math.max(endpoints.a.y, endpoints.b.y);
            if (maxLx < minX || minLx > maxX || maxLy < minY || minLy > maxY) {
              continue;
            }

            const geometry = linkBezierGeometry(
              endpoints.a.x,
              endpoints.a.y,
              endpoints.b.x,
              endpoints.b.y,
              resolveLinkSourcePortForBezier(link),
              link.targetPort,
            );

            g.setStrokeStyle({
              width: LINK_WIDTH,
              color: LINK_COLOR,
              alpha: LINK_ALPHA,
              cap: "round",
              join: "round",
            });
            g.moveTo(geometry.ax, geometry.ay);
            g.bezierCurveTo(
              geometry.cx1,
              geometry.cy1,
              geometry.cx2,
              geometry.cy2,
              geometry.bx,
              geometry.by,
            );
            g.stroke();

            const tangentX = geometry.bx - geometry.cx2;
            const tangentY = geometry.by - geometry.cy2;
            const tangentLength = Math.hypot(tangentX, tangentY) || 1;
            const dirX = tangentX / tangentLength;
            const dirY = tangentY / tangentLength;
            const normalX = -dirY;
            const normalY = dirX;

            const baseX = geometry.bx - dirX * ARROW_LENGTH;
            const baseY = geometry.by - dirY * ARROW_LENGTH;

            g.moveTo(geometry.bx, geometry.by);
            g.lineTo(
              baseX + normalX * ARROW_HALF_WIDTH,
              baseY + normalY * ARROW_HALF_WIDTH,
            );
            g.lineTo(
              baseX - normalX * ARROW_HALF_WIDTH,
              baseY - normalY * ARROW_HALF_WIDTH,
            );
            g.closePath();
            g.fill({ color: LINK_COLOR, alpha: LINK_ALPHA });

            const durationMs = 5200 + (linkIndex % 5) * 450;
            const phaseMs = (linkIndex * 410) % durationMs;
            const t = ((animTimeMs + phaseMs) % durationMs) / durationMs;
            const pulseX = cubicBezierPoint(
              geometry.ax,
              geometry.cx1,
              geometry.cx2,
              geometry.bx,
              t,
            );
            const pulseY = cubicBezierPoint(
              geometry.ay,
              geometry.cy1,
              geometry.cy2,
              geometry.by,
              t,
            );

            const pulseWave =
              0.5 +
              0.5 *
                Math.sin(
                  (animTimeMs / 1000) * ((Math.PI * 2) / 1.55) +
                    linkIndex * 0.31,
                );

            g.circle(pulseX, pulseY, 11);
            g.fill({ color: LINK_COLOR, alpha: 0.04 + pulseWave * 0.06 });

            g.circle(pulseX, pulseY, 6);
            g.fill({ color: LINK_COLOR, alpha: 0.08 + pulseWave * 0.12 });

            g.circle(pulseX, pulseY, 3.1);
            g.fill({ color: LINK_COLOR, alpha: 0.14 + pulseWave * 0.18 });
          }
        }}
      />
    </pixiContainer>
  );
};

export default LinkLayer;

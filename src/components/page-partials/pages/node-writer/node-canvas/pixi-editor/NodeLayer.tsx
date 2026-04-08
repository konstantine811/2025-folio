import { Viewport } from "pixi-viewport";
import { useMemo } from "react";
import type { ProjectPatchFn } from "../../types/types";
import type { EditorNode } from "./shared/types";
import NodeItem from "./NodeItem";
import { useEditorStore } from "./store/editorStore";

type Props = {
  viewport: Viewport;
  nodes: EditorNode[];
  onProjectPatch: (fn: ProjectPatchFn) => void;
  readOnly?: boolean;
  isDark?: boolean;
};

const NodeLayer = ({
  viewport,
  nodes,
  onProjectPatch,
  readOnly = false,
  isDark = true,
}: Props) => {
  const viewportVersion = useEditorStore((s) => s.viewportVersion);
  const visibleNodes = useMemo(() => {
    const pad = 260;
    const screenW = viewport.screenWidth || window.innerWidth;
    const screenH = viewport.screenHeight || window.innerHeight;
    const a = viewport.toWorld({ x: 0, y: 0 });
    const b = viewport.toWorld({ x: screenW, y: screenH });
    const minX = Math.min(a.x, b.x) - pad;
    const maxX = Math.max(a.x, b.x) + pad;
    const minY = Math.min(a.y, b.y) - pad;
    const maxY = Math.max(a.y, b.y) + pad;

    return nodes.filter((node) => {
      const x = node.x ?? 0;
      const y = node.y ?? 0;
      const w = Math.max(1, node.width ?? 220);
      const h = Math.max(1, node.height ?? 180);
      return x < maxX && x + w > minX && y < maxY && y + h > minY;
    });
  }, [nodes, viewport, viewportVersion]);

  return (
    <pixiContainer
      ref={(instance) => {
        if (instance && !viewport.children.includes(instance)) {
          viewport.addChild(instance);
        }
      }}
    >
      {visibleNodes.map((node) => (
        <NodeItem
          key={node.id}
          node={node}
          viewport={viewport}
          onProjectPatch={onProjectPatch}
          readOnly={readOnly}
          isDark={isDark}
        />
      ))}
    </pixiContainer>
  );
};

export default NodeLayer;

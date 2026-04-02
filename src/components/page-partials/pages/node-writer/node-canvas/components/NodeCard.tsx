import type { NodeData, NodePort } from "../../types/types";
import { DEFAULT_NODE_H, DEFAULT_NODE_W } from "../constants";
import { NodePortHandle } from "./NodePortHandle";

const PORTS: NodePort[] = ["n", "s", "w", "e"];

interface NodeCardProps {
  node: NodeData;
  zIndex: number;
  wireDragging: boolean;
  onStartWire: (e: React.PointerEvent, nodeId: string, port: NodePort) => void;
  onDragPointerDown: (e: React.PointerEvent, node: NodeData) => void;
  onDragPointerMove: (e: React.PointerEvent) => void;
  onDragPointerUp: (e: React.PointerEvent) => void;
  onResizePointerDown: (e: React.PointerEvent, node: NodeData) => void;
  onLabelChange: (id: string, label: string) => void;
  onDescriptionChange: (id: string, description: string) => void;
  onRemove: (id: string) => void;
  setNodeRef: (id: string) => (el: HTMLDivElement | null) => void;
}

export function NodeCard({
  node,
  zIndex,
  wireDragging,
  onStartWire,
  onDragPointerDown,
  onDragPointerMove,
  onDragPointerUp,
  onResizePointerDown,
  onLabelChange,
  onDescriptionChange,
  onRemove,
  setNodeRef,
}: NodeCardProps) {
  const x = node.x ?? 0;
  const y = node.y ?? 0;
  const nw = node.width ?? DEFAULT_NODE_W;
  const nh = node.height ?? DEFAULT_NODE_H;

  return (
    <div
      ref={setNodeRef(node.id)}
      data-node-id={node.id}
      style={{
        left: x,
        top: y,
        width: nw,
        height: nh,
        zIndex,
      }}
      className="group/node-card absolute flex flex-col overflow-hidden border border-white/15 bg-black/90 shadow-lg transition-[border-color] hover:border-white/25"
    >
      {PORTS.map((port) => (
        <NodePortHandle
          key={port}
          nodeId={node.id}
          port={port}
          wireDragging={wireDragging}
          onPointerDown={onStartWire}
        />
      ))}

      <div className="flex min-h-0 shrink-0 items-stretch gap-0 border-b border-white/10">
        <div
          title="Перетягнути"
          className="flex w-7 shrink-0 cursor-grab touch-none items-center justify-center border-r border-white/10 bg-white/[0.03] text-[10px] text-white/35 active:cursor-grabbing"
          onPointerDown={(e) => onDragPointerDown(e, node)}
          onPointerMove={onDragPointerMove}
          onPointerUp={onDragPointerUp}
          onPointerCancel={onDragPointerUp}
        >
          ⋮⋮
        </div>
        <div className="flex min-w-0 flex-1 items-center justify-between gap-1 py-1.5 pr-2 pl-1">
          <input
            value={node.label}
            onChange={(e) => onLabelChange(node.id, e.target.value)}
            className="min-w-0 flex-1 bg-transparent px-1 py-0.5 text-[11px] font-bold tracking-tight text-white uppercase outline-none"
            onPointerDown={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            title="Видалити ноду"
            className="mono shrink-0 px-1.5 py-0.5 text-[10px] text-white/30 hover:text-red-400"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onRemove(node.id);
            }}
          >
            ×
          </button>
        </div>
      </div>
      <textarea
        value={node.description ?? ""}
        onChange={(e) => onDescriptionChange(node.id, e.target.value)}
        placeholder="Текст…"
        className="min-h-0 flex-1 resize-none bg-transparent p-2 text-[12px] leading-snug text-white/80 outline-none placeholder:text-white/20"
        onPointerDown={(e) => e.stopPropagation()}
      />
      <div className="shrink-0 border-t border-white/5 px-2 py-1 mono text-[8px] tracking-widest text-white/25 uppercase">
        ⋮⋮ рух · кут — розмір · порт — звʼязок
      </div>

      <div
        role="separator"
        aria-hidden
        title="Змінити розмір"
        className="absolute right-0 bottom-0 z-[40] h-4 w-4 cursor-nwse-resize touch-manipulation border-t border-l border-white/20 bg-white/[0.06] hover:border-[#00FF9C]/60 hover:bg-[#00FF9C]/10"
        onPointerDown={(e) => onResizePointerDown(e, node)}
      />
    </div>
  );
}

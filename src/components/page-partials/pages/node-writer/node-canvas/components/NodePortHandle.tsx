import type { NodePort } from "../../types/types";
import { PORT_HANDLE_POSITION, PORT_LABELS } from "../constants";

interface NodePortHandleProps {
  nodeId: string;
  port: NodePort;
  wireDragging: boolean;
  onPointerDown: (e: React.PointerEvent, nodeId: string, port: NodePort) => void;
}

export function NodePortHandle({
  nodeId,
  port,
  wireDragging,
  onPointerDown,
}: NodePortHandleProps) {
  return (
    <button
      type="button"
      data-node-id={nodeId}
      data-link-port={port}
      title={`Зв'язок (${PORT_LABELS[port]})`}
      className={`absolute z-[35] h-3.5 w-3.5 rounded-full border-2 border-black bg-[#00FF9C] shadow-[0_0_10px_rgba(0,255,156,0.45)] transition-opacity touch-manipulation ${PORT_HANDLE_POSITION[port]} ${
        wireDragging
          ? "opacity-100"
          : "opacity-0 group-hover/node-card:opacity-100"
      } hover:scale-125 hover:bg-white`}
      onPointerDown={(e) => onPointerDown(e, nodeId, port)}
    />
  );
}

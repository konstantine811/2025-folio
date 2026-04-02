import type { RefObject } from "react";
import { CANVAS_MIN_H, CANVAS_MIN_W } from "../constants";

interface CanvasBoardProps {
  scrollRef: RefObject<HTMLDivElement | null>;
  onCanvasPointerDown: (e: React.PointerEvent) => void;
  children: React.ReactNode;
}

export function CanvasBoard({
  scrollRef,
  onCanvasPointerDown,
  children,
}: CanvasBoardProps) {
  return (
    <div
      ref={scrollRef}
      className="relative flex-1 overflow-auto bg-[#050505]"
    >
      <div className="relative min-h-[1200px] min-w-[1600px]">
        <div
          role="presentation"
          aria-hidden
          className="absolute inset-0 z-0 cursor-crosshair"
          style={{ minWidth: CANVAS_MIN_W, minHeight: CANVAS_MIN_H }}
          onPointerDown={onCanvasPointerDown}
        />
        {children}
      </div>
    </div>
  );
}

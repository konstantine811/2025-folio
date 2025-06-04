import { useHeaderSizeStore } from "@/storage/headerSizeStore";
import { useRef, useState } from "react";

type Props = {
  left?: React.ReactNode;
  center: React.ReactNode;
  right?: React.ReactNode;
  initialWidths?: {
    left?: number;
    right?: number;
  };
};

const ResizableColumns = ({ left, center, right, initialWidths }: Props) => {
  const [leftWidth, setLeftWidth] = useState(initialWidths?.left ?? 300);
  const [rightWidth, setRightWidth] = useState(initialWidths?.right ?? 300);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef<null | "left" | "right">(null);
  const hS = useHeaderSizeStore((s) => s.size);

  const handleMouseDown = (side: "left" | "right") => {
    isDragging.current = side;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!containerRef.current || !isDragging.current) return;
    const containerWidth = containerRef.current.offsetWidth;

    if (isDragging.current === "left") {
      const newLeft = Math.min(
        Math.max(100, e.clientX),
        containerWidth - rightWidth - 100
      );
      setLeftWidth(newLeft);
    } else if (isDragging.current === "right") {
      const newRight = Math.min(
        Math.max(100, containerWidth - e.clientX),
        containerWidth - leftWidth - 100
      );
      setRightWidth(newRight);
    }
  };

  const handleMouseUp = () => {
    isDragging.current = null;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      ref={containerRef}
      className="flex w-full relative"
      style={{ minHeight: `calc(100vh - ${hS}px)` }}
    >
      {left && (
        <>
          <div style={{ width: leftWidth }}>{left}</div>

          <div
            onMouseDown={() => handleMouseDown("left")}
            className="w-[1px] px-2  cursor-col-resize flex flex-col"
          >
            <div className="bg-muted-foreground/50 w-[1px] h-full"></div>
          </div>
        </>
      )}

      <div className="flex-1 p-2">{center}</div>

      {right && (
        <>
          <div
            onMouseDown={() => handleMouseDown("right")}
            className="w-[1px] px-2  cursor-col-resize flex flex-col"
          >
            <div className="bg-muted-foreground/50 w-[1px] h-full"></div>
          </div>

          <div style={{ width: rightWidth }}>{right}</div>
        </>
      )}
    </div>
  );
};

export default ResizableColumns;

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  type PointerEvent,
} from "react";
import { ImagePixelData, canvasToImagePixelData } from "../experience/utils/loadImagePixelData";
import { RgbColor, rgbToCss } from "../experience/utils/mapImagePalette";

export type PaintCanvasHandle = {
  getPixelData: () => ImagePixelData;
  fill: (color: RgbColor) => void;
};

type PaintCanvasProps = {
  size: number;
  brushColor: RgbColor;
  brushSize: number;
  initialFill: RgbColor;
  label: string;
};

export const PaintCanvas = forwardRef<PaintCanvasHandle, PaintCanvasProps>(
  function PaintCanvas(
    { size, brushColor, brushSize, initialFill, label },
    ref,
  ) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawingRef = useRef(false);

    const fillCanvas = (color: RgbColor) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext("2d");
      if (!context) return;

      context.fillStyle = rgbToCss(color);
      context.fillRect(0, 0, size, size);
    };

    useImperativeHandle(ref, () => ({
      getPixelData: () => {
        const canvas = canvasRef.current;
        if (!canvas) {
          throw new Error("Paint canvas is not ready");
        }

        return canvasToImagePixelData(canvas);
      },
      fill: fillCanvas,
    }));

    useEffect(() => {
      fillCanvas(initialFill);
    }, [initialFill, size]);

    const paintAt = (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext("2d");
      if (!context) return;

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = Math.floor((clientX - rect.left) * scaleX);
      const y = Math.floor((clientY - rect.top) * scaleY);

      context.fillStyle = rgbToCss(brushColor);
      context.fillRect(x, y, brushSize, brushSize);
    };

    const handlePointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
      event.currentTarget.setPointerCapture(event.pointerId);
      isDrawingRef.current = true;
      paintAt(event.clientX, event.clientY);
    };

    const handlePointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawingRef.current) return;
      paintAt(event.clientX, event.clientY);
    };

    const handlePointerUp = (event: PointerEvent<HTMLCanvasElement>) => {
      isDrawingRef.current = false;
      event.currentTarget.releasePointerCapture(event.pointerId);
    };

    return (
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-white/70">
          {label}
        </span>
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className="aspect-square w-full max-w-[min(100%,420px)] cursor-crosshair rounded-md border border-white/20 bg-black touch-none image-rendering-pixelated"
          style={{ imageRendering: "pixelated" }}
        />
      </div>
    );
  },
);

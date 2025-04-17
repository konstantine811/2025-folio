import { useCallback, useEffect, useImperativeHandle, useRef } from "react";

type CanvasOverlayProps = {
  callbackResize: () => void;
  ref?: React.Ref<HTMLCanvasElement>;
  mixBlend?: boolean;
  offsetTop?: number;
  zIndex?: number;
};

const CanvasOverlay = ({
  callbackResize,
  mixBlend = true,
  ref,
  offsetTop = 0,
  zIndex = 100000,
}: CanvasOverlayProps) => {
  const internalRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = (ref ?? internalRef) as React.RefObject<HTMLCanvasElement>;

  // Expose the internal ref to the parent via forwardRef
  useImperativeHandle(ref, () => canvasRef.current as HTMLCanvasElement, []);
  const handleResizeWindow = useCallback(() => {
    if (canvasRef.current) {
      canvasRef.current.width = window.innerWidth;
      canvasRef.current.height = window.innerHeight - offsetTop;
    }
    callbackResize();
  }, [callbackResize, canvasRef, offsetTop]);

  useEffect(() => {
    handleResizeWindow();
    window.addEventListener("resize", handleResizeWindow);
    return () => {
      window.removeEventListener("resize", handleResizeWindow);
    };
  }, [handleResizeWindow]);

  return (
    <canvas
      className={`fixed inset-0 pointer-events-none ${
        mixBlend && "mix-blend-difference"
      }`}
      ref={ref}
      style={{
        top: offsetTop ? `${offsetTop}px` : "0px",
        zIndex: zIndex,
      }}
    ></canvas>
  );
};

export default CanvasOverlay;

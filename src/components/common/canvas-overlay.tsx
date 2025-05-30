import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  forwardRef,
} from "react";

type CanvasOverlayProps = {
  callbackResize: () => void;
  mixBlend?: boolean;
  offsetTop?: number;
  zIndex?: number;
};

const CanvasOverlay = forwardRef<HTMLCanvasElement, CanvasOverlayProps>(
  (
    { callbackResize, mixBlend = true, offsetTop = 0, zIndex = 100000 },
    ref
  ) => {
    const internalRef = useRef<HTMLCanvasElement>(null);

    // expose the DOM node
    useImperativeHandle(
      ref,
      () => internalRef.current as HTMLCanvasElement,
      []
    );

    const handleResizeWindow = useCallback(() => {
      if (internalRef.current) {
        internalRef.current.width = window.innerWidth;
        internalRef.current.height = window.innerHeight - offsetTop;
      }
      callbackResize();
    }, [callbackResize, offsetTop]);

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
          mixBlend && "mix-blend-difference z-50"
        }`}
        ref={internalRef}
        style={{
          top: offsetTop ? `${offsetTop}px` : "0px",
          zIndex: zIndex,
        }}
      ></canvas>
    );
  }
);

export default CanvasOverlay;

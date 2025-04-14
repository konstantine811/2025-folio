import { useCallback, useEffect, useRef } from "react";

const MouseTrail = ({
  lineWidth = 24,
  strokeStyle = "rgba(255, 255, 255, 0.8)",
  lineCap = "round",
  filter = "blur(12px)",
}: {
  lineWidth?: number;
  strokeStyle?: string;
  lineCap?: CanvasLineCap;
  filter?: string;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const lastAxis = useRef({ x: 0, y: 0 });
  const hasMouseMoved = useRef(false);
  const lastMoveTimeRef = useRef<number>(0);
  const lastMoveData = useRef({ x: 0, y: 0, time: 0 });
  const SPEED_THRESHOLD = 0.5; // експериментуй з цим значенням (0.3 - 1.0)
  const OFFSET = 0;

  const drawLine = useCallback((newX: number, newY: number) => {
    if (ctxRef.current) {
      const ctx = ctxRef.current;
      if (lastAxis.current.x !== null && lastAxis.current.y !== null) {
        ctx.beginPath();
        ctx.moveTo(
          lastAxis.current.x - OFFSET,
          lastAxis.current.y + OFFSET / 2
        );
        ctx.lineTo(newX - OFFSET, newY + OFFSET / 2);
        ctx.stroke();
      }
      lastAxis.current.x = newX;
      lastAxis.current.y = newY;
    }
  }, []);

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      lastMoveTimeRef.current = performance.now();
      const now = performance.now();
      const newX = event.clientX;
      const newY = event.clientY;

      const { x: lastX, y: lastY, time: lastTime } = lastMoveData.current;
      const dx = newX - lastX;
      const dy = newY - lastY;
      const dt = now - lastTime;

      const distance = Math.sqrt(dx * dx + dy * dy);
      const speed = distance / dt; // px/ms

      lastMoveTimeRef.current = now;
      lastMoveData.current = { x: newX, y: newY, time: now };

      if (!hasMouseMoved.current) {
        lastAxis.current.x = event.clientX;
        lastAxis.current.y = event.clientY;
        hasMouseMoved.current = true;
      } else {
        mousePos.current.x = event.clientX;
        mousePos.current.y = event.clientY;
        if (speed > SPEED_THRESHOLD) {
          drawLine(newX, newY);
        }
      }
    },
    [drawLine]
  );

  const applyCanvasStyles = useCallback(() => {
    const ctx = ctxRef.current;
    if (ctx) {
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = strokeStyle;
      ctx.lineCap = lineCap;
      ctx.filter = filter;
    }
  }, [lineWidth, strokeStyle, lineCap, filter]);

  const handleResizeWindow = useCallback(() => {
    if (canvasRef.current) {
      canvasRef.current.width = window.innerWidth;
      canvasRef.current.height = Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.clientHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight
      );
    }
    applyCanvasStyles();
  }, [applyCanvasStyles]);

  const animateRender = useCallback(() => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;

    if (ctx && canvas) {
      const now = performance.now();
      if (now - lastMoveTimeRef.current > 1000) {
        hasMouseMoved.current = false;
      }

      // Накладаємо "прозору" плівку, яка трохи стирає попередні сліди
      ctx.save();
      ctx.globalCompositeOperation = "destination-out"; // прибирає альфа-канал
      ctx.fillStyle = `rgba(0, 0, 0, ${hasMouseMoved.current ? 0.1 : 1.0})`; // 0.05 = повільне стирання
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }

    return requestAnimationFrame(animateRender);
  }, []);

  // For mouse position tracking
  useEffect(() => {
    const animationFrameId = animateRender();
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [animateRender]);

  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctxRef.current = ctx;
      applyCanvasStyles();
    }
  }, [applyCanvasStyles]);

  useEffect(() => {
    handleResizeWindow();
    window.addEventListener("resize", handleResizeWindow);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("resize", handleResizeWindow);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [handleResizeWindow, handleMouseMove]);
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none mix-blend-difference z-[100000] "
    ></canvas>
  );
};

export default MouseTrail;

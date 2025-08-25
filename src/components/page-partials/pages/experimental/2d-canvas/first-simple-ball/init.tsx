import { useHeaderSizeStore } from "@/storage/headerSizeStore";
import { useCallback, useEffect, useRef } from "react";

const radius = 20;
const color = "#0000ff";
const g = 0.1; // acceleration due to gravity
let x = 50; // initial horizontal position
let y = 50; // initial vertical position
const vx = 2; // initial horizontal speed
let vy = 0; // initial vertical speed

const FirstSimpleBall = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const hs = useHeaderSizeStore((s) => s.size);

  const drawBall = useCallback(
    (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI, true);
      ctx.closePath();
      ctx.fill();
    },
    []
  );

  const onEachStep = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;
    vy += g; // gravity increases the vertical speed;
    x += vx; // horizontal speed increases horizontal position
    y += vy; // vertical speed increases vertical position;

    if (y > canvas.height - radius) {
      // if ball hits the ground
      y = canvas.height - radius; // reposition at ground level
      vy *= -0.8; // reverse vertical speed and apply damping
    }

    if (x > canvas.width - radius) {
      // if ball goes beyond canvas
      x = -radius; // reposition inside the canvas
    }
    drawBall(canvas, ctx);
    animationFrameId.current = requestAnimationFrame(onEachStep);
  }, [drawBall]);

  useEffect(() => {
    if (canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      ctxRef.current = context;
      canvasRef.current.width = window.innerWidth - 20;
      canvasRef.current.height = window.innerHeight - hs - 4;
      animationFrameId.current = requestAnimationFrame(onEachStep);
    }
    return () => {
      if (animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [onEachStep, hs]);

  return <canvas className={"border"} ref={canvasRef}></canvas>;
};

export default FirstSimpleBall;

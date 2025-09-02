import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useImperativeHandle,
} from "react";
import { useHeaderSizeStore } from "@/storage/headerSizeStore";

export type SketchHandle = {
  start: () => void;
  stop: () => void;
  resize: () => void;
  clear: () => void;
  setOnEachStep: (fn: () => void) => void; // <- ось це
  getCanvas: () => HTMLCanvasElement | null;
  getCtx: () => CanvasRenderingContext2D | null;
  setPlugin: (plugin: SketchPlugin | null) => void;
};

export interface SketchPlugin {
  id: string;
  name: string;
  mount(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void;
  frame(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    dt: number
  ): void;
  dispose(): void;
  onResize?: (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => void; // NEW
}

let t0 = new Date().getTime();

const Init2DSketch = forwardRef<SketchHandle>((_, ref) => {
  const hs = useHeaderSizeStore((s) => s.size);

  const canvasRef = useRef<HTMLCanvasElement>(null!);
  const ctxRef = useRef<CanvasRenderingContext2D>(null!);
  const rafRef = useRef<number | null>(null);
  const onEachStepRef = useRef<() => void>(() => {}); // початково no-op
  const pluginRef = useRef<SketchPlugin | null>(null!);

  const setCanvasSize = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    c.width = window.innerWidth - 4;
    c.height = window.innerHeight - hs - 4;
  }, [hs]);

  const loop = useCallback(() => {
    onEachStepRef.current?.();
    const t1 = new Date().getTime(); // current time in milliseconds
    const dt = 0.002 * (t1 - t0);
    t0 = t1;
    pluginRef.current?.frame(ctxRef.current, canvasRef.current, dt);
    rafRef.current = requestAnimationFrame(loop);
  }, []);

  const start = useCallback(() => {
    if (rafRef.current == null) rafRef.current = requestAnimationFrame(loop);
  }, [loop]);

  const stop = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const clear = useCallback(() => {
    const c = canvasRef.current;
    const ctx = ctxRef.current;
    if (c && ctx) ctx.clearRect(0, 0, c.width, c.height);
  }, []);

  const resize = useCallback(() => {
    setCanvasSize();
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    const plugin = pluginRef.current;
    if (ctx && canvas && plugin) {
      if (plugin.onResize) plugin.onResize(ctx, canvas);
      else plugin.mount(ctx, canvas); // fallback, якщо плагін статичний
    }
  }, [setCanvasSize]);

  const setOnEachStep = useCallback((fn: () => void) => {
    onEachStepRef.current = fn ?? (() => {});
  }, []);

  const setPlugin = useCallback(
    (plugin: SketchPlugin | null) => {
      // знімаємо попередній
      pluginRef.current?.dispose();
      pluginRef.current = null;

      // чистимо полотно
      clear();

      if (plugin) {
        const ctx = ctxRef.current;
        const canvas = canvasRef.current;
        if (ctx && canvas) {
          plugin.mount(ctx, canvas);
          pluginRef.current = plugin;
        }
      }
    },
    [clear]
  );

  useImperativeHandle(
    ref,
    () => ({
      start,
      stop,
      resize,
      clear,
      setOnEachStep,
      setPlugin,
      getCanvas: () => canvasRef.current,
      getCtx: () => ctxRef.current,
    }),
    [start, stop, resize, clear, setOnEachStep, setPlugin]
  );

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    ctxRef.current = c.getContext("2d") as CanvasRenderingContext2D;

    setCanvasSize();
    start();
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      stop();
    };
  }, [setCanvasSize, start, stop, resize]);

  return <canvas className="border" ref={canvasRef} />;
});

export default Init2DSketch;

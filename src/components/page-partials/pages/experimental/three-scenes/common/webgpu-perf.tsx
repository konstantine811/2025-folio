import { useFrame, useThree } from "@react-three/fiber";
import { useRef, useSyncExternalStore } from "react";
import { isDev } from "@/utils/check-env";

export type WebGpuPerfStats = {
  fps: number;
  frameMs: number;
  triangles: number;
  drawCalls: number;
  geometries: number;
  textures: number;
};

export const INITIAL_WEBGPU_PERF_STATS: WebGpuPerfStats = {
  fps: 0,
  frameMs: 0,
  triangles: 0,
  drawCalls: 0,
  geometries: 0,
  textures: 0,
};

let perfSnapshot = INITIAL_WEBGPU_PERF_STATS;
const perfSubscribers = new Set<() => void>();

function setPerfSnapshot(next: WebGpuPerfStats) {
  perfSnapshot = next;
  perfSubscribers.forEach((notify) => notify());
}

function subscribePerf(notify: () => void) {
  perfSubscribers.add(notify);
  return () => perfSubscribers.delete(notify);
}

const formatCount = (value: number) =>
  value >= 1_000_000
    ? `${(value / 1_000_000).toFixed(2)}M`
    : value >= 1_000
      ? `${(value / 1_000).toFixed(1)}K`
      : `${value}`;

/** Inside Canvas — collects renderer.info, no parent re-renders. */
export function WebGpuPerfTracker() {
  const { gl } = useThree();
  const lastFrameRef = useRef(performance.now());
  const accRef = useRef({ frames: 0, time: 0, lastUpdate: performance.now() });

  useFrame(() => {
    const now = performance.now();
    const frameMs = now - lastFrameRef.current;
    lastFrameRef.current = now;

    const acc = accRef.current;
    acc.frames += 1;
    acc.time += frameMs;

    if (now - acc.lastUpdate < 300) return;

    const { render, memory } = gl.info;
    setPerfSnapshot({
      fps: Math.round((acc.frames * 1000) / acc.time),
      frameMs: Math.round((acc.time / acc.frames) * 10) / 10,
      triangles: render.triangles,
      drawCalls:
        "drawCalls" in render
          ? (render.drawCalls as number)
          : "frameCalls" in render
            ? (render.frameCalls as number)
            : 0,
      geometries: memory.geometries,
      textures: memory.textures,
    });

    acc.frames = 0;
    acc.time = 0;
    acc.lastUpdate = now;
  });

  return null;
}

/** Outside Canvas — HTML overlay, isolated re-renders. */
export function WebGpuPerfPanel({ top = 56 }: { top?: number }) {
  const stats = useSyncExternalStore(subscribePerf, () => perfSnapshot);

  if (!isDev) return null;

  return (
    <div
      className="pointer-events-none fixed left-2 z-50 rounded bg-black/70 px-2.5 py-2 font-mono text-[11px] leading-relaxed text-white shadow-lg"
      style={{ top }}
    >
      <div className="mb-1 text-[10px] uppercase tracking-wide text-white/50">
        WebGPU
      </div>
      <div>FPS {stats.fps}</div>
      <div>Frame {stats.frameMs.toFixed(1)} ms</div>
      <div>Tris {formatCount(stats.triangles)}</div>
      <div>Draw {stats.drawCalls}</div>
      <div>
        Geo {stats.geometries} · Tex {stats.textures}
      </div>
    </div>
  );
}

/** @deprecated Use WebGpuPerfTracker (inside Canvas) + WebGpuPerfPanel (outside Canvas). */
export { WebGpuPerfTracker as WebGpuPerf };

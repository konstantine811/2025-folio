import MainWrapperOffset from "@/components/ui-abc/main-wrapper-offset";
import { Canvas } from "@react-three/fiber";
import Experience from "./experience";
import {
  Suspense,
  UIEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Perf } from "r3f-perf";
import { useProgress } from "@react-three/drei";
import { Leva, useControls } from "leva";
import { isDev } from "@/utils/check-env";
import InitKeyboardController from "@/components/common/game-controller/init-keyboard";
import { usePauseStore } from "@/components/common/game-controller/store/usePauseMode";
import { SciFiScrollOverlay } from "./sci-fi-scroll-overlay";
import {
  sciFiLoadingFadeMs,
  sciFiSceneReadyFrames,
  sciFiSceneWarmupMs,
} from "./sci-fi-intro.config";
import { useHeaderSizeStore } from "@/storage/headerSizeStore";
import { cn } from "@/lib/utils";
import { getDprCap, isMobileDevice } from "@/utils/device-capabilities";

export type CameraMode = "Scroll" | "CameraControls";

const isDebugHash = () => window.location.hash === "#debug";

type SceneReadyReporterProps = {
  onReady: () => void;
};

const SceneReadyReporter = ({ onReady }: SceneReadyReporterProps) => {
  useEffect(() => {
    let frame = 0;
    let rafId = 0;

    const tick = () => {
      frame += 1;
      if (frame >= sciFiSceneReadyFrames) {
        onReady();
        return;
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafId);
  }, [onReady]);

  return null;
};

type IntroPhase = "loading" | "fade-out" | "content";

const SciFiSceneLoadingOverlay = ({ progress }: { progress: number }) => {
  const pct = Math.min(100, Math.max(0, progress));

  return (
    <div className="flex min-h-[var(--sci-fi-viewport-height)] items-center justify-center px-5 text-zinc-300">
      <div className="w-full max-w-5xl">
        <div className="mb-4 text-center font-mono text-[10px] uppercase tracking-[0.42em] text-cyan-100/70 sm:text-xs">
          Loading {Math.floor(pct)}%
        </div>
        <div className="relative mx-auto h-px w-full overflow-hidden bg-white/10">
          <div
            className="h-px bg-cyan-100/80 shadow-[0_0_18px_rgba(165,243,252,0.82)] transition-[width] duration-300 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mx-auto mt-3 h-px w-24 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
      </div>
    </div>
  );
};

const Init = () => {
  const scrollProgressRef = useRef(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollTopRef = useRef(0);
  const introTimersRef = useRef<number[]>([]);
  const sceneWarmupStartedRef = useRef(false);
  const [introPhase, setIntroPhase] = useState<IntroPhase>("loading");
  const [sceneWarmupDone, setSceneWarmupDone] = useState(false);
  const [isDebugPanelVisible, setIsDebugPanelVisible] = useState(isDebugHash);
  const headerSize = useHeaderSizeStore((s) => s.size);
  const { progress } = useProgress();
  const [sceneContentMounted, setSceneContentMounted] = useState(false);
  /** Suspense resolved + first frames — do not wait on useProgress (unreliable with Perf / cache). */
  const displayProgress = sceneContentMounted ? 100 : progress;

  const isPaused = usePauseStore((s) => s.isPaused);
  const setIsPaused = usePauseStore((s) => s.setIsPaused);
  const setIsGameStarted = usePauseStore((s) => s.setIsGameStarted);

  const { cameraMode } = useControls("Sci-fi camera", {
    cameraMode: {
      label: "Mode",
      options: ["Scroll", "CameraControls"] satisfies CameraMode[],
      value: "Scroll" satisfies CameraMode,
    },
  });

  const selectedCameraMode = cameraMode as CameraMode;
  const isCameraControlsMode = selectedCameraMode === "CameraControls";

  const clearIntroTimers = useCallback(() => {
    introTimersRef.current.forEach((id) => window.clearTimeout(id));
    introTimersRef.current = [];
  }, []);

  const handleSceneReady = useCallback(() => {
    if (sceneWarmupStartedRef.current) return;
    sceneWarmupStartedRef.current = true;
    setSceneContentMounted(true);

    const warmupId = window.setTimeout(() => {
      setSceneWarmupDone(true);
    }, sciFiSceneWarmupMs);
    introTimersRef.current.push(warmupId);
  }, []);

  useEffect(() => {
    if (introPhase !== "loading") return;
    if (sceneWarmupDone) {
      setIntroPhase("fade-out");
    }
  }, [introPhase, sceneWarmupDone]);

  const handleLoadingFadeEnd = useCallback(() => {
    setIntroPhase((phase) => (phase === "fade-out" ? "content" : phase));
  }, []);

  useEffect(() => {
    if (introPhase !== "fade-out") return;

    const fallbackId = window.setTimeout(
      handleLoadingFadeEnd,
      sciFiLoadingFadeMs + 80,
    );
    introTimersRef.current.push(fallbackId);

    return () => window.clearTimeout(fallbackId);
  }, [introPhase, handleLoadingFadeEnd]);

  const handleScroll = useCallback((event: UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    const maxScroll = scrollHeight - clientHeight;

    scrollTopRef.current = scrollTop;
    scrollProgressRef.current = maxScroll > 0 ? scrollTop / maxScroll : 0;
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsPaused(true);
      }
    },
    [setIsPaused],
  );

  const handleStartScene = useCallback(() => {
    scrollTopRef.current = scrollContainerRef.current?.scrollTop ?? 0;

    setIsPaused(false);
    setIsGameStarted(true);
  }, [setIsGameStarted, setIsPaused]);

  useEffect(() => {
    setIsPaused(true);
  }, [setIsPaused]);

  useEffect(() => {
    const handleHashChange = () => {
      setIsDebugPanelVisible(isDebugHash());
    };

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  useEffect(() => clearIntroTimers, [clearIntroTimers]);

  useLayoutEffect(() => {
    if (!scrollContainerRef.current) return;

    scrollContainerRef.current.scrollTop = scrollTopRef.current;
  }, [isPaused]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <MainWrapperOffset>
      <Leva hidden={!isDebugPanelVisible} collapsed />

      <InitKeyboardController />

      <Canvas
        shadows
        dpr={getDprCap()}
        gl={{
          powerPreference: "high-performance",
          failIfMajorPerformanceCaveat: false,
          antialias: !isMobileDevice,
        }}
        camera={{ position: [15, 10, -5], fov: 30 }}
        style={{ height: "100%" }}
        onPointerDown={(e) => {
          if (e.pointerType === "mouse") {
            (e.target as HTMLCanvasElement).requestPointerLock();
          }
        }}
      >
        <Suspense fallback={null}>
          <Experience
            cameraMode={selectedCameraMode}
            scrollProgressRef={scrollProgressRef}
          />
          <SceneReadyReporter onReady={handleSceneReady} />
        </Suspense>
        {isDev && isDebugPanelVisible && introPhase === "content" && (
          <Perf position="top-left" />
        )}
      </Canvas>

      {isPaused && (
        <div
          className="absolute inset-x-0 bottom-0 z-10"
          style={{
            top: headerSize,
            ["--sci-fi-viewport-height" as string]: `calc(100dvh - ${headerSize}px)`,
          }}
        >
          <div
            data-lenis-prevent
            data-lenis-prevent-touch
            data-lenis-prevent-wheel
            ref={scrollContainerRef}
            className="sci-fi-scroll-panel custom-scrollbar h-full w-full overflow-x-hidden overflow-y-scroll"
            onScroll={handleScroll}
            onTouchMove={(event) => event.stopPropagation()}
            onWheel={(event) => event.stopPropagation()}
            style={{
              WebkitOverflowScrolling: "touch",
              overscrollBehavior: "contain",
              pointerEvents: isCameraControlsMode ? "none" : "auto",
              touchAction: "pan-y",
            }}
          >
            {introPhase === "content" ? (
              <SciFiScrollOverlay
                scrollContainerRef={scrollContainerRef}
                onStart={handleStartScene}
              />
            ) : (
              <div
                aria-hidden
                className="min-h-[var(--sci-fi-viewport-height)]"
              />
            )}
          </div>
          {introPhase !== "content" && (
            <div
              className={cn(
                "absolute inset-0 z-40 bg-black/35 transition-opacity ease-out",
                introPhase === "fade-out"
                  ? "pointer-events-none opacity-0"
                  : "opacity-100",
              )}
              style={{ transitionDuration: `${sciFiLoadingFadeMs}ms` }}
              onTransitionEnd={(event) => {
                if (event.target !== event.currentTarget) return;
                if (event.propertyName !== "opacity") return;
                handleLoadingFadeEnd();
              }}
            >
              <SciFiSceneLoadingOverlay progress={displayProgress} />
            </div>
          )}
          <div
            className="pointer-events-none absolute inset-0 z-30"
            aria-hidden
          >
            <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/75 to-transparent" />
          </div>
        </div>
      )}
    </MainWrapperOffset>
  );
};

export default Init;

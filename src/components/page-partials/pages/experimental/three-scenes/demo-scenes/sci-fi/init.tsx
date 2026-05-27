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
import { Leva, useControls } from "leva";
import ThreeLoader from "../../common/three-loader";
import { isDev } from "@/utils/check-env";
import InitKeyboardController from "@/components/common/game-controller/init-keyboard";
import { usePauseStore } from "@/components/common/game-controller/store/usePauseMode";
import { SciFiScrollOverlay } from "./sci-fi-scroll-overlay";
import { useHeaderSizeStore } from "@/storage/headerSizeStore";

export type CameraMode = "Scroll" | "CameraControls";

const isDebugHash = () => window.location.hash === "#debug";

type SceneReadyReporterProps = {
  onReady: () => void;
};

const SceneReadyReporter = ({ onReady }: SceneReadyReporterProps) => {
  useEffect(() => {
    const frameId = requestAnimationFrame(onReady);

    return () => cancelAnimationFrame(frameId);
  }, [onReady]);

  return null;
};

const SciFiSceneLoadingOverlay = () => (
  <div className="flex min-h-[var(--sci-fi-viewport-height)] items-center justify-center bg-black/20 px-5 text-zinc-300">
    <div className="w-full max-w-5xl">
      <div className="mb-4 text-center font-mono text-[10px] uppercase tracking-[0.42em] text-cyan-100/70 sm:text-xs">
        Loading
      </div>
      <div className="relative mx-auto h-px w-full overflow-hidden bg-white/10">
        <div className="sci-fi-loading-line absolute left-1/2 top-0 h-px w-full origin-center bg-cyan-100/80 shadow-[0_0_18px_rgba(165,243,252,0.82)]" />
      </div>
      <div className="mx-auto mt-3 h-px w-24 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
      <style>{`
        .sci-fi-loading-line {
          transform: translateX(-50%) scaleX(0);
          animation: sci-fi-loading-expand 1.7s cubic-bezier(0.7, 0, 0.2, 1) infinite;
        }

        @keyframes sci-fi-loading-expand {
          0% {
            transform: translateX(-50%) scaleX(0);
            opacity: 0;
          }
          18% {
            opacity: 1;
          }
          72% {
            transform: translateX(-50%) scaleX(1);
            opacity: 1;
          }
          100% {
            transform: translateX(-50%) scaleX(1);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  </div>
);

const Init = () => {
  const scrollProgressRef = useRef(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollTopRef = useRef(0);
  const sceneReadyTimeoutRef = useRef<number | null>(null);
  const [sceneReady, setSceneReady] = useState(false);
  const [isDebugPanelVisible, setIsDebugPanelVisible] = useState(isDebugHash);
  const headerSize = useHeaderSizeStore((s) => s.size);

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

  const handleSceneReady = useCallback(() => {
    if (sceneReadyTimeoutRef.current !== null) return;

    sceneReadyTimeoutRef.current = window.setTimeout(() => {
      setSceneReady(true);
    }, 850);
  }, []);

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

  useEffect(() => {
    return () => {
      if (sceneReadyTimeoutRef.current !== null) {
        window.clearTimeout(sceneReadyTimeoutRef.current);
      }
    };
  }, []);

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
      {!isDev && <ThreeLoader />}
      <Leva hidden={!isDebugPanelVisible} collapsed />

      <InitKeyboardController />

      <Canvas
        shadows
        camera={{ position: [15, 10, -5], fov: 30 }}
        style={{ height: "100%" }}
        onPointerDown={(e) => {
          if (e.pointerType === "mouse") {
            (e.target as HTMLCanvasElement).requestPointerLock();
          }
        }}
      >
        <Suspense fallback={null}>
          {isDev && isDebugPanelVisible && <Perf position="top-left" />}

          <Experience
            cameraMode={selectedCameraMode}
            scrollProgressRef={scrollProgressRef}
          />
          <SceneReadyReporter onReady={handleSceneReady} />
        </Suspense>
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
            {sceneReady ? (
              <SciFiScrollOverlay
                scrollContainerRef={scrollContainerRef}
                onStart={handleStartScene}
              />
            ) : (
              <SciFiSceneLoadingOverlay />
            )}
          </div>
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

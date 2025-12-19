import { useState, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import MainWrapperOffset from "@/components/ui-abc/main-wrapper-offset";
import ThreeLoader from "../common/three-loader";
import Experience from "./Experience";
import { RotateCcw } from "lucide-react";
import { CameraControls } from "@react-three/drei";
import GeniverseText from "./GeniverseText";
import { useThemeStore } from "@/storage/themeStore";
import { ThemePalette } from "@/config/theme-colors.config";

const Init = () => {
  const [animationProgress, setAnimationProgress] = useState(0);
  const [captionOpacity, setCaptionOpacity] = useState(0);
  const [showGeniverse, setShowGeniverse] = useState(false);
  const theme = useThemeStore((s) => s.selectedTheme);
  const startTimeRef = useRef<number | null>(null);
  const isAnimatingRef = useRef(true);
  const duration = 2800; // ms
  const startDelay = 500; // ms

  const resetAnimation = () => {
    startTimeRef.current = null;
    isAnimatingRef.current = true;
    setAnimationProgress(0);
    setCaptionOpacity(0);
    setShowGeniverse(false);
  };

  useEffect(() => {
    const animate = (time: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = time;
      }

      const elapsed = time - (startTimeRef.current || time);

      if (isAnimatingRef.current) {
        const progress = Math.max(
          0,
          Math.min(1, (elapsed - startDelay) / duration)
        );

        setAnimationProgress(progress);

        // Reveal caption
        if (progress > 0.6) {
          setCaptionOpacity(1);
        }

        // Reveal geniverse text at the end
        if (progress > 0.65) {
          setShowGeniverse(true);
        }

        if (progress >= 1) {
          isAnimatingRef.current = false;
        }
      }

      requestAnimationFrame(animate);
    };

    const rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <MainWrapperOffset isFullHeight>
      <ThreeLoader />
      <div className="w-full flex flex-col bg-background text-foreground overflow-hidden font-mono">
        {/* Navbar */}
        <nav className="h-16 border-b border-foreground/10 flex items-center justify-between px-6 bg-background z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-background font-semibold text-sm shadow-[0_0_15px_rgba(16,185,129,0.4)]">
              <svg
                className="w-4 h-4 fill-background"
                viewBox="0 0 24 24"
                strokeWidth="2"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="font-medium tracking-tight text-base text-muted-foreground">
              Pythagoras Visualization
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={resetAnimation}
              className="group flex items-center gap-2 px-4 py-2 rounded-full border border-foreground/10 hover:bg-foreground/5 transition-all text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground/20"
            >
              <RotateCcw className="w-4 h-4 group-hover:-rotate-180 transition-transform duration-700 ease-out" />
              Replay Animation
            </button>
          </div>
        </nav>

        {/* Main Scene Container */}
        <main className="w-full flex-1 relative bg-background flex items-center justify-center overflow-hidden">
          {/* Radial Gradient for subtle depth */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-background via-background to-background pointer-events-none"></div>

          <MainWrapperOffset className="w-full">
            <Canvas
              gl={{ antialias: true, alpha: true }}
              className="w-full h-full"
              camera={{ position: [0, -14, 34], fov: 35, near: 0.1, far: 1000 }}
            >
              <Suspense fallback={null}>
                <CameraControls makeDefault />
                <color
                  attach="background"
                  args={[ThemePalette[theme].background]}
                />
                <Experience animationProgress={animationProgress} />
              </Suspense>
            </Canvas>
          </MainWrapperOffset>

          {/* Overlay Text */}
          <div
            className="absolute bottom-12 left-0 right-0 text-center pointer-events-none transition-opacity duration-1000"
            style={{
              opacity: captionOpacity,
              transform:
                captionOpacity > 0 ? "translateY(0)" : "translateY(10px)",
            }}
          >
            <p className="text-muted-foreground text-sm font-mono tracking-[0.2em] uppercase">
              Visual Proof • a² + b² = c²
            </p>
          </div>
          <GeniverseText show={showGeniverse} />
          {/* Geniverse Text Animation */}
        </main>
      </div>
    </MainWrapperOffset>
  );
};

export default Init;

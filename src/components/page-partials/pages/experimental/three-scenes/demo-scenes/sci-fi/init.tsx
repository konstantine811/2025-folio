import MainWrapperOffset from "@/components/ui-abc/main-wrapper-offset";
import { Canvas } from "@react-three/fiber";
import Experience from "./experience";
import { Suspense, UIEvent, useCallback, useState } from "react";
import { Perf } from "r3f-perf";
import { useControls } from "leva";
import ThreeLoader from "../../common/three-loader";
import { isDev } from "@/utils/check-env";

export type CameraMode = "Scroll" | "CameraControls";

const Init = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const { cameraMode } = useControls("Sci-fi camera", {
    cameraMode: {
      label: "Mode",
      options: ["Scroll", "CameraControls"] satisfies CameraMode[],
      value: "Scroll" satisfies CameraMode,
    },
  });
  const selectedCameraMode = cameraMode as CameraMode;
  const isCameraControlsMode = selectedCameraMode === "CameraControls";

  const handleScroll = useCallback((event: UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    const maxScroll = scrollHeight - clientHeight;

    setScrollProgress(maxScroll > 0 ? scrollTop / maxScroll : 0);
  }, []);

  return (
    <MainWrapperOffset>
      {!isDev && <ThreeLoader />}
      <Canvas
        shadows
        camera={{ position: [15, 10, -5], fov: 30 }}
        style={{ height: "100%" }}
      >
        <Suspense fallback={null}>
          {isDev && <Perf position="top-left" />}
          <Experience
            cameraMode={selectedCameraMode}
            scrollProgress={scrollProgress}
          />
        </Suspense>
      </Canvas>
      <div
        data-lenis-prevent
        data-lenis-prevent-touch
        data-lenis-prevent-wheel
        className="absolute inset-0 z-10 overflow-y-auto"
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
        <div className="h-[300vh]" />
      </div>
    </MainWrapperOffset>
  );
};

export default Init;

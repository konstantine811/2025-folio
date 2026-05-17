import MainWrapperOffset from "@/components/ui-abc/main-wrapper-offset";
import { Canvas } from "@react-three/fiber";
import Experience from "./experience";
import { Suspense, UIEvent, useCallback, useState } from "react";
import { Perf } from "r3f-perf";
import { useControls } from "leva";
import ThreeLoader from "../../common/three-loader";
import { isDev } from "@/utils/check-env";
import { Button } from "@/components/ui/button";
import { HoverStyleElement, SoundTypeElement } from "@/types/sound";
import SoundHoverElement from "@/components/ui-abc/sound-hover-element";
import { useCommonStatusStore } from "./store/common";

export type CameraMode = "Scroll" | "CameraControls";

const Init = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const isPlaying = useCommonStatusStore((s) => s.isPlaying);
  const setIsPlaying = useCommonStatusStore((s) => s.setIsPlaying);
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
      {!isPlaying && (
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
          <div className="h-[300vh]">
            <div className="relative top-[200px] flex justify-center">
              <SoundHoverElement
                className="rounded-full "
                hoverTypeElement={SoundTypeElement.SELECT_2}
                hoverStyleElement={HoverStyleElement.quad}
              >
                <Button
                  variant="default"
                  className="hover:bg-background cursor-pointer hover:text-foreground flex justify-center items-center bg-card/80"
                  onClick={() => setIsPlaying(true)}
                >
                  Play
                </Button>
              </SoundHoverElement>
            </div>
          </div>
        </div>
      )}
    </MainWrapperOffset>
  );
};

export default Init;

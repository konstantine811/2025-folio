import MainWrapperOffset from "@/components/ui-abc/main-wrapper-offset";
import { Canvas } from "@react-three/fiber";
import Experience from "./experience";
import { Suspense, UIEvent, useCallback, useState } from "react";
import { Perf } from "r3f-perf";

const Init = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleScroll = useCallback((event: UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    const maxScroll = scrollHeight - clientHeight;

    setScrollProgress(maxScroll > 0 ? scrollTop / maxScroll : 0);
  }, []);

  return (
    <MainWrapperOffset>
      {/* <ThreeLoader /> */}
      <Canvas
        shadows
        camera={{ position: [15, 10, -5], fov: 30 }}
        style={{ height: "100%" }}
      >
        <Suspense fallback={null}>
          <Perf position="top-left" />
          <Experience scrollProgress={scrollProgress} />
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
          touchAction: "pan-y",
        }}
      >
        <div className="h-[300vh]" />
      </div>
    </MainWrapperOffset>
  );
};

export default Init;

import MainWrapperOffset from "@/components/ui-abc/main-wrapper-offset";
import ThreeLoader from "../../common/three-loader";
import { Canvas } from "@react-three/fiber";
import Experience from "./experience";
import { Suspense } from "react";
import { Perf } from "r3f-perf";

const Init = () => {
  return (
    <MainWrapperOffset>
      {/* <ThreeLoader /> */}
      <Canvas shadows camera={{ position: [15, 10, -5], fov: 30 }}>
        <Suspense fallback={null}>
          <Perf position="top-left" />
          <Experience />
        </Suspense>
      </Canvas>
    </MainWrapperOffset>
  );
};

export default Init;

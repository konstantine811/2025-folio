import MainWrapperOffset from "@/components/ui-abc/main-wrapper-offset";
import ThreeLoader from "../common/three-loader";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import Experience from "./Experience";

function ParticleCursorAnimation() {
  return (
    <MainWrapperOffset>
      <ThreeLoader />
      {/* <Displacement2DCanvas /> */}
      <Canvas camera={{ position: [0, 0, 20], fov: 30 }}>
        <Suspense fallback={null}>
          <Experience />
        </Suspense>
      </Canvas>
    </MainWrapperOffset>
  );
}

export default ParticleCursorAnimation;

import MainWrapperOffset from "@/components/ui-abc/main-wrapper-offset";
import ThreeLoader from "../common/three-loader";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import Experience from "./experience";

const Init = () => {
  return (
    <MainWrapperOffset>
      <ThreeLoader />
      <Canvas camera={{ position: [0, 0, 0.00001], fov: 65 }}>
        <Suspense fallback={null}>
          <Experience />
        </Suspense>
      </Canvas>
    </MainWrapperOffset>
  );
};

export default Init;

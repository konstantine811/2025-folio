import MainWrapperOffset from "@/components/ui-abc/main-wrapper-offset";
import ThreeLoader from "../common/three-loader";
import { Canvas } from "@react-three/fiber";
import Experience from "./experience";
import { Suspense } from "react";

const Init = () => {
  return (
    <MainWrapperOffset>
      <ThreeLoader />
      <Canvas camera={{ position: [0, 2, 5], fov: 70 }}>
        <Suspense fallback={null}>
          <Experience />
        </Suspense>
      </Canvas>
    </MainWrapperOffset>
  );
};

export default Init;

import MainWrapperOffset from "@/components/ui-abc/main-wrapper-offset";
import ThreeLoader from "../common/three-loader";
import { Canvas } from "@react-three/fiber";
import Experience from "./Experience";
import { Suspense } from "react";

const Init = () => {
  return (
    <div className="relative">
      <MainWrapperOffset isFullHeight className="fixed top-0 left-0 z-10">
        <ThreeLoader />
        <Canvas camera={{ position: [0, 10, 85], fov: 70 }}>
          <Suspense fallback={null}>
            <Experience />
          </Suspense>
        </Canvas>
      </MainWrapperOffset>
      <div className="realtive z-20 h-screen w-full">
        <div className="flex items-center justify-center h-full w-full">
          <h1 className="text-4xl font-bold text-foreground">
            Particle Morphing
          </h1>
          <p className="text-lg text-gray-500">
            This is a description of the particle morphing scene.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Init;

import MainWrapperOffset from "@/components/ui-abc/main-wrapper-offset";
import ThreeLoader from "../common/three-loader";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import Experience from "./experience";
import InitKeyboardController from "./physic-world/controllers/init-keyboard";

const Init = () => {
  return (
    <MainWrapperOffset>
      <InitKeyboardController />
      <ThreeLoader />
      <Canvas
        shadows
        camera={{ position: [5, 3, 5], fov: 70 }}
        onPointerDown={(e: React.PointerEvent<HTMLDivElement>) => {
          const canvas = e.currentTarget as HTMLDivElement;
          const domCanvas = canvas.querySelector(
            "canvas"
          ) as HTMLCanvasElement | null;

          if (domCanvas && "requestPointerLock" in domCanvas) {
            domCanvas.requestPointerLock();
          }
        }}
      >
        <color attach="background" args={["#698FF3"]} />
        <Suspense fallback={null}>
          <Experience />
        </Suspense>
      </Canvas>
    </MainWrapperOffset>
  );
};

export default Init;

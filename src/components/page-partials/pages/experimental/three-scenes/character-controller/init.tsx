import MainWrapperOffset from "@/components/ui-abc/main-wrapper-offset";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import Experience from "./experience";
import ThreeLoader from "../common/three-loader";
import { Environment } from "@react-three/drei";
import InitKeyboardController from "@/components/common/game-controller/init-keyboard";

export default function Init() {
  return (
    <MainWrapperOffset isFullHeight={true}>
      <InitKeyboardController isIgnorePause />
      <ThreeLoader />
      <Canvas
        onPointerDown={(e) => {
          if (e.pointerType === "mouse") {
            (e.target as HTMLCanvasElement).requestPointerLock();
          }
        }}
      >
        <Suspense fallback={null}>
          <color attach="background" args={["#131017"]} />
          <Environment preset="sunset" />
          <Experience />
        </Suspense>
      </Canvas>
    </MainWrapperOffset>
  );
}

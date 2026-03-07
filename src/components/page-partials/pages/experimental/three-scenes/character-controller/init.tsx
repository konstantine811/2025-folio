import MainWrapperOffset from "@/components/ui-abc/main-wrapper-offset";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import Experience from "./experience";
import ThreeLoader from "../common/three-loader";
import { Environment } from "@react-three/drei";
import InitKeyboardController from "@/components/common/game-controller/init-keyboard";
import { Perf } from "r3f-perf";

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
        <Perf position="top-left" />
        <Suspense fallback={null}>
          <color attach="background" args={["#131017"]} />
          <Environment preset="sunset" />
          <Experience />
        </Suspense>
      </Canvas>
    </MainWrapperOffset>
  );
}

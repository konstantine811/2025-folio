import MainWrapperOffset from "@/components/ui-abc/main-wrapper-offset";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import Experience from "./experience";
import ThreeLoader from "../common/three-loader";
import { CameraControls, Environment, Sparkles } from "@react-three/drei";

export default function Init() {
  return (
    <MainWrapperOffset isFullHeight={true}>
      <ThreeLoader />
      <Canvas
        flat
        camera={{
          fov: 45,
          near: 0.1,
          far: 50,
          position: [1, 2, 6],
        }}
      >
        <Suspense fallback={null}>
          <color attach="background" args={["#131017"]} />
          <Environment preset="sunset" />
          <CameraControls makeDefault />
          <Experience />
          <Sparkles
            size={6}
            scale={[4, 2, 4]}
            position-y={1}
            speed={0.2}
            count={40}
          />
        </Suspense>
      </Canvas>
    </MainWrapperOffset>
  );
}

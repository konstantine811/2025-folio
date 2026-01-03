import MainWrapperOffset from "@/components/ui-abc/main-wrapper-offset";
import ThreeLoader from "../../common/three-loader";
import { Canvas } from "@react-three/fiber";
import { CameraControls, Environment } from "@react-three/drei";
import { Suspense } from "react";
import Experience from "./experience/Experience";

const Init = () => {
  return (
    <MainWrapperOffset>
      <ThreeLoader />
      <Canvas camera={{ position: [0, 50, 30], fov: 30 }}>
        <Suspense fallback={null}>
          <color attach="background" args={["#131017"]} />
          <CameraControls />
          <Experience />
          <Environment preset="sunset" />
        </Suspense>
      </Canvas>
    </MainWrapperOffset>
  );
};

export default Init;

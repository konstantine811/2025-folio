import MainWrapperOffset from "@/components/ui-abc/main-wrapper-offset";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import ThreeLoader from "../common/three-loader";
import { OrbitControls } from "@react-three/drei";
import Experience from "./experience";

const Init = () => {
  return (
    <MainWrapperOffset>
      <ThreeLoader />
      <Canvas camera={{ position: [1, 1, 5], fov: 65 }}>
        <Suspense fallback={null}>
          {/* <Environment preset="sunset" blur={5} /> */}
          <OrbitControls
            enableDamping
            enableZoom
            enablePan
            autoRotate
            autoRotateSpeed={0.5}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={0}
          />
          <Experience />
        </Suspense>
      </Canvas>
    </MainWrapperOffset>
  );
};

export default Init;

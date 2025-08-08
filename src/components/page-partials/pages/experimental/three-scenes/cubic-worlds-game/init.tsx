import MainWrapperOffset from "@/components/ui-abc/main-wrapper-offset";
import ThreeLoader from "../common/three-loader";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import Experience from "./experience";

const Init = () => {
  return (
    <MainWrapperOffset>
      <ThreeLoader />
      <Canvas shadows camera={{ position: [5, 3, 5], fov: 50 }}>
        <color attach="background" args={["#698FF3FF"]} />
        <Suspense fallback={null}>
          <Experience />
        </Suspense>
      </Canvas>
    </MainWrapperOffset>
  );
};

export default Init;

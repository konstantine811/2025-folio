import MainWrapperOffset from "@/components/ui-abc/main-wrapper-offset";
import { Suspense } from "react";
import ThreeLoader from "../../common/three-loader";
import { Canvas } from "@react-three/fiber";
import Experience from "./experience/experience";

function Init() {
  return (
    <MainWrapperOffset>
      <ThreeLoader />
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        <color attach="background" args={["#131017"]} />
        <Suspense fallback={null}>
          <Experience />
        </Suspense>
      </Canvas>
    </MainWrapperOffset>
  );
}

export default Init;

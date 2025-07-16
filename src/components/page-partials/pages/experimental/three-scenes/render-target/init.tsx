import { Canvas } from "@react-three/fiber";
import RemoteProvider from "./context/remote-provider";
import Experience from "./experience";
import MainWrapperOffset from "@/components/ui-abc/main-wrapper-offset";
import ThreeLoader from "../common/three-loader";
import { Suspense } from "react";
import Remote from "./remote";

const Init = () => {
  return (
    <MainWrapperOffset>
      <ThreeLoader />
      <RemoteProvider>
        <Canvas camera={{ position: [-3, 1.5, 3], fov: 30, near: 1 }}>
          <Suspense fallback={null}>
            <Experience />
          </Suspense>
        </Canvas>
        <Remote />
      </RemoteProvider>
    </MainWrapperOffset>
  );
};

export default Init;

import { Canvas } from "@react-three/fiber";

import MainWrapperOffset from "@/components/ui-abc/main-wrapper-offset";
import ThreeLoader from "../../common/three-loader";
import Experience from "./experience";

const init = () => {
  return (
    <MainWrapperOffset>
      <ThreeLoader />
      <Canvas shadows camera={{ position: [4, 7, 1], fov: 30 }}>
        <Experience />
      </Canvas>
    </MainWrapperOffset>
  );
};

export default init;

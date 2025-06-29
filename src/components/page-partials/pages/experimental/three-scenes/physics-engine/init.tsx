import { Canvas } from "@react-three/fiber";
import Experience from "./Experience";
import MainWrapperOffset from "@/components/ui-abc/main-wrapper-offset";

const Init = () => {
  return (
    <MainWrapperOffset>
      <Canvas camera={{ position: [0, 6, 6], fov: 60 }} shadows>
        <color attach="background" args={["#171720"]} />
        <Experience />
      </Canvas>
    </MainWrapperOffset>
  );
};

export default Init;

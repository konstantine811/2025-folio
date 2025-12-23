import { CameraControls, Environment } from "@react-three/drei";
import ParticleMorphing from "./particle-morping";

const Experience = () => {
  return (
    <>
      <CameraControls />
      <Environment preset="sunset" />
      <color attach="background" args={["#151515"]} />
      <directionalLight position={[1, 1, 1]} intensity={1} />
      <group>
        <ParticleMorphing />
      </group>
    </>
  );
};

export default Experience;

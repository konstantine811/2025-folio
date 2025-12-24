import { Environment } from "@react-three/drei";
import ParticleMorphing from "./particle-morphing";

const Experience = () => {
  return (
    <>
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

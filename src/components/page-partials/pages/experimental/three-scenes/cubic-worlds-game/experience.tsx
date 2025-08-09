import { Environment, OrbitControls } from "@react-three/drei";
import PrimitiveModel from "./primitive-modle";

const Experience = () => {
  return (
    <>
      <OrbitControls />
      <PrimitiveModel modelName="box.glb" />
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 8, 3]} intensity={1} castShadow />
      <Environment preset="sunset" />
    </>
  );
};

export default Experience;

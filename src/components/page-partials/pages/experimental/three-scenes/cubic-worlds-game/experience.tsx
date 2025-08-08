import { Environment, OrbitControls } from "@react-three/drei";
import PrimitiveModel from "./primitive-modle";

const Experience = () => {
  return (
    <>
      <OrbitControls />
      <PrimitiveModel modelName="box.glb" />
      <Environment preset="sunset" />
    </>
  );
};

export default Experience;

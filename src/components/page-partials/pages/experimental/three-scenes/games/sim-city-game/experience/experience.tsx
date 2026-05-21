import { CameraControls, Environment } from "@react-three/drei";
import { City } from "./city";
// import CameraController from "./controllers/camera-controller";

const Experience = () => {
  return (
    <>
      <City />
      <Environment preset="sunset" />
      {/* <CameraController /> */}
      <CameraControls makeDefault />
    </>
  );
};

export default Experience;

import { CameraControls, Environment } from "@react-three/drei";
// import EarthParticle from "./EarthParticle";

const Experience = () => {
  return (
    <>
      <CameraControls />
      <Environment preset="sunset" />
      {/* <EarthParticle /> */}
    </>
  );
};

export default Experience;

import { CameraControls, Environment } from "@react-three/drei";
import Gallery from "./gallery";

const Experience = () => {
  return (
    <>
      <CameraControls
        minZoom={0.6}
        maxZoom={2}
        polarRotateSpeed={-0.3}
        azimuthRotateSpeed={-0.3}
      />
      <Environment preset="sunset" background blur={0.3} />
      <Gallery position-y={-1.5} />
    </>
  );
};

export default Experience;

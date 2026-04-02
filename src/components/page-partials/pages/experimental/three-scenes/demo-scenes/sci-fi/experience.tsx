import { CameraControls, Stars } from "@react-three/drei";
import { ShipFloor } from "./ship/ship-floor";
import { ShipContainer } from "./ship/ship-container";
import Earth from "./ship/earth";

const Experience = () => {
  return (
    <>
      <ambientLight intensity={1.7} />
      <directionalLight castShadow position={[1, 3, 1]} intensity={3} />
      {/* <Environment preset="sunset" /> */}
      <ShipContainer />
      <Stars
        radius={1}
        depth={500}
        count={15000}
        factor={20}
        saturation={0}
        speed={1.2}
        fade
      />
      <Earth />
      <CameraControls makeDefault />
    </>
  );
};

export default Experience;

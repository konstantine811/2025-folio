import { CameraControls } from "@react-three/drei";
import Particle from "./particle";
import RaycastPlane from "./raycast-plane";

function Experience() {
  return (
    <>
      <color attach="background" args={["#121512"]} />
      <CameraControls makeDefault />
      <RaycastPlane />
      <Particle />
    </>
  );
}

export default Experience;

import { CameraControls } from "@react-three/drei";
import Particle from "./particle";
import RaycastGeometry from "@/components/common/three/raycast-geometry/raycast-geometry";

function Experience() {
  return (
    <>
      <color attach="background" args={["#121512"]} />
      <CameraControls makeDefault />
      <RaycastGeometry />
      <Particle />
    </>
  );
}

export default Experience;

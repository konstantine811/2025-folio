import { Environment, OrbitControls } from "@react-three/drei";
import Background from "./background";
import Medival from "./medival";
import Witch from "./witch";
import Tavern from "./tavern";

const Experience = () => {
  return (
    <>
      <OrbitControls
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={0}
        maxDistance={15}
        minDistance={6}
      />
      <Environment>
        <Background />
      </Environment>
      <Medival
        props={{ rotation: [0, -Math.PI / 4, 0], position: [1.4, -0.9, 2] }}
      />
      <Witch
        props={{ rotation: [0, Math.PI / 4, 0], position: [-1.4, -0.9, 2.6] }}
      />
      <Tavern props={{ rotation: [0, -Math.PI / 4, 0] }} />
    </>
  );
};

export default Experience;

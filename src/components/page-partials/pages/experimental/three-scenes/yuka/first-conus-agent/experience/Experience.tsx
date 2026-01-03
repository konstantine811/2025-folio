import { Vector3 } from "three";
import FollowPath from "../../yuka-component/follow-path";

const points = [
  new Vector3(-5, 0, -5),
  new Vector3(-10, 0, 10),
  new Vector3(0, 0, 2.5),
  new Vector3(20, 0, 20),
  new Vector3(-5, 0, -5),
];

const Experience = () => {
  return (
    <FollowPath points={points} isDebug={true}>
      <mesh rotation-x={Math.PI / 2}>
        <coneGeometry args={[0.7, 1.5, 8]} />
        <meshNormalMaterial />
      </mesh>
    </FollowPath>
  );
};

export default Experience;

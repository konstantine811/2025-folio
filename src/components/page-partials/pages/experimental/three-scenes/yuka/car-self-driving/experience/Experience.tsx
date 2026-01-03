import { Vector3 } from "three";
import FollowPath from "../../yuka-component/follow-path";
import FerrariModel from "@/components/common/three/models/cars/FerrariModel";

const points = [
  new Vector3(-6, 0, 4),
  new Vector3(-12, 0, 0),
  new Vector3(-10, 0, -12),
  new Vector3(0, 0, -20),
  new Vector3(8, 0, -8),
  new Vector3(10, 0, 0),
  new Vector3(4, 0, 4),
  new Vector3(0, 0, 6),
];

const Experience = () => {
  return (
    <FollowPath
      points={points}
      isDebug={true}
      maxSpeed={10}
      nextWaypointDistance={3}
      pathRadius={0.7}
    >
      <FerrariModel />
    </FollowPath>
  );
};

export default Experience;

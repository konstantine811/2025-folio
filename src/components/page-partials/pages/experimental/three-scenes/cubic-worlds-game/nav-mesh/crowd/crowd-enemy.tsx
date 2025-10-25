import { useRef } from "react";
import { MaleModel } from "../../enemy/follower/male";
import { Group } from "three";

const CrowdEnemy = () => {
  const followerRef = useRef<Group>(null!); // це NPC, який має йти за героєм

  return (
    <group ref={followerRef}>
      <MaleModel />
    </group>
  );
};

export default CrowdEnemy;

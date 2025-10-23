import { useMemo, useRef } from "react";
import { MaleModel } from "../../enemy/follower/male";
import { useNav } from "../useNavMesh";
import { Group } from "three";
import { useCrowdFollower } from "./useCrowdFollower";
import { createCrowd } from "./crowd";
import { CrowdAgentParams } from "recast-navigation";
import { useGameDataStore } from "../../physic-world/character-controller/stores/game-data-store";

const baseParams: CrowdAgentParams = {
  radius: 0.3,
  height: 1.6,
  maxAcceleration: 8,
  maxSpeed: 3.5,
  collisionQueryRange: 12,
  pathOptimizationRange: 30,
  separationWeight: 2.0,
  obstacleAvoidanceType: 0,
  queryFilterType: 0,
  updateFlags: 1,
  userData: {},
};

const CrowdEnemy = () => {
  const { navMesh, query } = useNav(); // ти вже зберігаєш їх у сторі
  const followerRef = useRef<Group>(null!); // це NPC, який має йти за героєм
  const characterRigidBody = useGameDataStore((s) => s.characterRigidBody);

  const crowdStuff = useMemo(() => {
    if (!navMesh) return null;
    return createCrowd(navMesh);
  }, [navMesh]);

  useCrowdFollower({
    navMesh,
    query,
    crowd: crowdStuff?.crowd,
    baseParams,
    followerObj: followerRef.current,
    leaderObj: characterRigidBody,
  });
  return (
    <group ref={followerRef}>
      <MaleModel />
    </group>
  );
};

export default CrowdEnemy;

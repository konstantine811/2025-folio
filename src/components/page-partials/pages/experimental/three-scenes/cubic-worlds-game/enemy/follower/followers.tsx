import { useFrame } from "@react-three/fiber";
import Follower from "./follower";
import { useInterval } from "../common/hooks/useInterval";
import { Crowd, NavMeshQuery } from "recast-navigation";
import { Quaternion, Vector3 } from "three";
import {
  crowdAgentQuery,
  followersQuery,
} from "@components/page-partials/pages/experimental/three-scenes/cubic-worlds-game/enemy/entity-component-store";
import { useNav } from "../../nav-mesh/useNavMesh";
import { useGameDataStore } from "../../physic-world/character-controller/stores/game-data-store";
import { RapierRigidBody } from "@react-three/rapier";
import { useEffect, useState } from "react";

const _crowdAgentDirection = new Vector3();
const _crowdAgentQuaternion = new Quaternion();

const updateCrowdAgents = (
  delta: number,
  navMeshQuery: NavMeshQuery | undefined | null
) => {
  if (!navMeshQuery) return;

  for (const entity of crowdAgentQuery) {
    if (!entity.three) continue;
    const agent = entity.crowdAgent;
    if (!agent) return;

    if (agent.state() === 0) {
      const { isOverPoly } = navMeshQuery.findNearestPoly(agent.position());

      if (isOverPoly) {
        const { point: closest } = navMeshQuery.findClosestPoint(
          agent.position()
        );
        agent.teleport(closest);
      }
    }

    if (entity.three.position.length() === 0) {
      entity.three.position.copy(agent.position());
    } else {
      entity.three.position.lerp(agent.position(), delta * 40);
    }

    const velocity = agent.velocity();
    const direction = _crowdAgentDirection.set(
      velocity.x,
      velocity.y,
      velocity.z
    );
    const yRotation = Math.atan2(direction.x, direction.z);
    const quaternion = _crowdAgentQuaternion.setFromAxisAngle(
      new Vector3(0, 1, 0),
      yRotation
    );
    entity.three.quaternion.slerp(quaternion, delta * 30);
  }
};

const updateFollowers = (
  navMeshQuery: NavMeshQuery | undefined | null,
  playerRigid: RapierRigidBody | null
) => {
  if (!navMeshQuery) return;
  if (!playerRigid) return;
  const playerPosition = playerRigid.translation();
  for (const follower of followersQuery) {
    if (follower.crowdAgent) {
      const { point: target } = navMeshQuery.findClosestPoint(playerPosition, {
        halfExtents: { x: 10, y: 10, z: 10 },
      });
      const { randomPoint: pointAround } =
        navMeshQuery.findRandomPointAroundCircle(target, 1);

      follower.crowdAgent.requestMoveTarget(pointAround);
    }
  }
};

const Followers = () => {
  const n = 20;
  const [crowd, setCrowd] = useState<Crowd>();
  const followers = [];
  const playerRigid = useGameDataStore((s) => s.characterRigidBody);
  for (let i = 0; i < n; i++) {
    followers.push(<Follower key={i} position={[3, 17, -0.55]} />);
  }
  const navMeshQuery = useNav((s) => s.query);
  const navMesh = useNav((s) => s.navMesh);
  useEffect(() => {
    if (navMesh) {
      setCrowd(new Crowd(navMesh, { maxAgents: 50, maxAgentRadius: 0.5 }));
    }
  }, [navMesh]);

  useFrame((_, delta) => {
    updateCrowdAgents(delta, navMeshQuery);
    if (crowd) {
      crowd.update(delta);
    }
  });

  useInterval(() => {
    updateFollowers(navMeshQuery, playerRigid);
  }, 1000);

  return <>{followers}</>;
};

export default Followers;

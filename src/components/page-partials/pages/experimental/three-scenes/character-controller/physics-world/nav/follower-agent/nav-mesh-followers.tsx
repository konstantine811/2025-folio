import { useEffect, useState } from "react";
import { useNavMeshStore } from "../useNavMeshStore";
import { usePlayerPositionStore } from "../../usePlayerPositionStore";
import { generateRandomSpawnPositions } from "../../../utils/generate-position";
import { AGENT_COUNT, RADIUS } from "../../../config/agent.config";
import NavMeshFollowerAgent from "./nav-mesh-follower-agent";
import { Vec3 } from "../../../models/character-controller.model";

type NavMeshFollowersProps = {
  isDebug?: boolean;
};

export default function NavMeshFollowers({
  isDebug = true,
}: NavMeshFollowersProps) {
  const query = useNavMeshStore((s) => s.query);
  const [spawnPositions, setSpawnPositions] = useState<Vec3[] | null>(null);
  useEffect(() => {
    if (!query) return;

    const playerPosition = usePlayerPositionStore.getState().position;
    const points = generateRandomSpawnPositions(query, AGENT_COUNT, {
      center: { x: 0, y: 0, z: 0 },
      areaRadius: 12,
      minDistanceBetweenAgents: RADIUS * 3,
      avoidPosition: playerPosition,
      avoidRadius: 5,
      maxAttemptsPerAgent: 40,
    });

    setSpawnPositions(points);
  }, [query]);

  if (!query || !spawnPositions?.length) return null;

  return (
    <>
      {/* <PlayerAttackSensor radius={1} /> */}
      {spawnPositions.map((spawnPosition, index) => (
        <NavMeshFollowerAgent
          key={index}
          query={query}
          spawnPosition={spawnPosition}
          isDebug={isDebug}
        />
      ))}
    </>
  );
}

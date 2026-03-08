import { useFrame } from "@react-three/fiber";
import { NavMeshQuery } from "recast-navigation";
import { useEffect, useRef, useState } from "react";
import { useNavMeshStore } from "./useNavMeshStore";
import { usePlayerPositionStore } from "../usePlayerPositionStore";
import {
  CapsuleCollider,
  RapierRigidBody,
  RigidBody,
} from "@react-three/rapier";
import { Vec3 } from "../../models/character-controller.model";
import AgentPathDebug from "./nav-agent-path-debug";
import {
  PATH_HALF_EXTENTS,
  AGENT_COUNT,
  BODY_Y_OFFSET,
  RADIUS,
  AGENT_SPEED,
  PATH_UPDATE_INTERVAL_MS,
  WAYPOINT_REACH_DIST,
  STOP_DIST_TO_PLAYER,
  HEIGHT,
} from "../../config/agent.config";
import { generateRandomSpawnPositions } from "../../utils/generate-position";
import { AgentPathState } from "../../models/nav-path.model";

type NavMeshFollowersProps = {
  isDebug?: boolean;
};

const TARGET_REPATH_DIST = 1.0;

function getHorizontalDistance(a: Vec3, b: Vec3) {
  const dx = a.x - b.x;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dz * dz);
}

function updateAgents(
  rigidBodyRefs: (RapierRigidBody | null)[],
  pathStates: AgentPathState[],
  query: NavMeshQuery | null,
  playerPos: Vec3 | null,
) {
  if (!query || !playerPos) return;
  const now = performance.now();

  for (let i = 0; i < AGENT_COUNT; i++) {
    const rb = rigidBodyRefs[i];
    const state = pathStates[i];
    if (!rb || !state) continue;

    const pos = rb.translation();
    const posVec = { x: pos.x, y: pos.y - BODY_Y_OFFSET, z: pos.z };

    if (pos.y < -20) {
      const { point } = query.findClosestPoint(playerPos, {
        halfExtents: PATH_HALF_EXTENTS,
      });

      rb.setTranslation(
        { x: point.x, y: point.y + BODY_Y_OFFSET, z: point.z },
        true,
      );
      rb.setLinvel({ x: 0, y: 0, z: 0 }, true);

      state.path = [];
      state.pathIndex = 0;
      state.lastTargetPos = null;
      continue;
    }

    const hasPath =
      state.path.length > 1 && state.pathIndex < state.path.length;
    const targetMoved =
      !state.lastTargetPos ||
      getHorizontalDistance(playerPos, state.lastTargetPos) >
        TARGET_REPATH_DIST;

    const shouldRepath =
      now - state.lastPathMs > PATH_UPDATE_INTERVAL_MS &&
      (!hasPath || targetMoved);

    if (shouldRepath) {
      state.lastPathMs = now;

      const startResult = query.findClosestPoint(posVec, {
        halfExtents: PATH_HALF_EXTENTS,
      });
      const endResult = query.findClosestPoint(playerPos, {
        halfExtents: PATH_HALF_EXTENTS,
      });

      if (startResult.success && endResult.success) {
        const res = query.computePath(startResult.point, endResult.point);

        if (res.success && res.path?.length) {
          state.path = res.path;
          state.pathIndex = 1;
          state.lastTargetPos = {
            x: playerPos.x,
            y: playerPos.y,
            z: playerPos.z,
          };
        }
      }
    }

    if (state.path.length > 1 && state.pathIndex < state.path.length) {
      const waypoint = state.path[state.pathIndex];
      const dx = waypoint.x - pos.x;
      const dz = waypoint.z - pos.z;
      const distH = Math.sqrt(dx * dx + dz * dz);

      if (
        distH < WAYPOINT_REACH_DIST &&
        state.pathIndex < state.path.length - 1
      ) {
        state.pathIndex++;
      }

      const distToPlayer = Math.sqrt(
        (playerPos.x - pos.x) ** 2 + (playerPos.z - pos.z) ** 2,
      );
      const cur = rb.linvel();

      if (distToPlayer > STOP_DIST_TO_PLAYER && distH > 1e-6) {
        const len = distH;
        const dirX = dx / len;
        const dirZ = dz / len;
        const vx = cur.x + dirX * AGENT_SPEED * 0.15;
        const vz = cur.z + dirZ * AGENT_SPEED * 0.15;
        const speed = Math.sqrt(vx * vx + vz * vz);
        const maxSpeed = AGENT_SPEED * 1.2;
        const scale = speed > maxSpeed ? maxSpeed / speed : 1;

        rb.setLinvel({ x: vx * scale, y: cur.y, z: vz * scale }, true);
      }
    }
  }
}

export default function NavMeshFollowers({
  isDebug = false,
}: NavMeshFollowersProps) {
  const query = useNavMeshStore((s) => s.query);
  const rigidBodyRefsRef = useRef<(RapierRigidBody | null)[]>([]);
  const pathStatesRef = useRef<AgentPathState[]>(
    Array.from({ length: AGENT_COUNT }, () => ({
      path: [],
      pathIndex: 0,
      lastPathMs: 0,
      lastTargetPos: null,
    })),
  );

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

    if (points.length === AGENT_COUNT) {
      setSpawnPositions(points);
    } else {
      console.warn(
        `Only generated ${points.length}/${AGENT_COUNT} spawn positions`,
      );
      setSpawnPositions(points);
    }
  }, [query]);

  useFrame(() => {
    const playerPosition = usePlayerPositionStore.getState().position;
    updateAgents(
      rigidBodyRefsRef.current,
      pathStatesRef.current,
      query,
      playerPosition,
    );
  });
  if (!spawnPositions || spawnPositions.length !== AGENT_COUNT) return null;

  return (
    <>
      {Array.from({ length: AGENT_COUNT }, (_, i) => (
        <group key={i}>
          <RigidBody
            ref={(rb) => {
              rigidBodyRefsRef.current[i] = rb;
            }}
            position={[
              spawnPositions[i].x,
              spawnPositions[i].y,
              spawnPositions[i].z,
            ]}
            mass={10}
            enabledRotations={[false, false, false]}
            lockRotations
            colliders={false}
            userData={{ camExcludeCollision: true }}
          >
            <CapsuleCollider args={[(HEIGHT - 2 * RADIUS) / 2, RADIUS]} />
            <mesh castShadow receiveShadow>
              <capsuleGeometry args={[RADIUS, HEIGHT - 2 * RADIUS, 8, 16]} />
              <meshStandardMaterial color="orange" />
            </mesh>
          </RigidBody>

          {isDebug && (
            <AgentPathDebug pathStatesRef={pathStatesRef} agentIndex={i} />
          )}
        </group>
      ))}
    </>
  );
}

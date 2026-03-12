import { useFrame } from "@react-three/fiber";
import {
  CapsuleCollider,
  RapierRigidBody,
  RigidBody,
} from "@react-three/rapier";
import { NavMeshQuery } from "recast-navigation";
import { useRef, useState } from "react";
import { Vec3 } from "../../../models/character-controller.model";
import { usePlayerPositionStore } from "../../usePlayerPositionStore";
import {
  AGENT_SPEED,
  BODY_Y_OFFSET,
  HEIGHT,
  PATH_HALF_EXTENTS,
  PATH_UPDATE_INTERVAL_MS,
  RADIUS,
  WAYPOINT_REACH_DIST,
} from "../../../config/agent.config";
import EnemyCharacterModel from "../enemy/enemy-character-model";
import AgentPathDebugSingle from "./nav-agent-path-debug";

type AgentAnimState = "idle" | "walk" | "attack";

type AgentPathState = {
  path: { x: number; y: number; z: number }[];
  pathIndex: number;
  lastPathMs: number;
  lastTargetPos: Vec3 | null;
};

type AgentPersonality = {
  moveSpeed: number;
  repathIntervalMs: number;
  orbitRadius: number;
  orbitAngleOffset: number;
  attackCooldownMs: number;
  attackAnimDurationMs: number;
  turnSpeed: number;
  engageRadius: number;
};

type Props = {
  query: NavMeshQuery;
  spawnPosition: Vec3;
  isDebug?: boolean;
};

const TARGET_REPATH_DIST = 1.0;

function getHorizontalDistance(a: Vec3, b: Vec3) {
  const dx = a.x - b.x;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dz * dz);
}

function filterPathBySpacing(
  path: { x: number; y: number; z: number }[],
  minDist: number,
) {
  if (path.length === 0) return path;

  const filtered = [path[0]];
  let last = path[0];

  for (let i = 1; i < path.length; i++) {
    const p = path[i];
    const dx = p.x - last.x;
    const dy = p.y - last.y;
    const dz = p.z - last.z;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

    if (dist >= minDist) {
      filtered.push(p);
      last = p;
    }
  }

  const lastOriginal = path[path.length - 1];
  if (filtered[filtered.length - 1] !== lastOriginal) {
    filtered.push(lastOriginal);
  }

  return filtered;
}

export default function NavMeshFollowerAgent({
  query,
  spawnPosition,
  isDebug = false,
}: Props) {
  const rigidBodyRef = useRef<RapierRigidBody | null>(null);
  const isInPlayerAttackSensorRef = useRef(false);

  const pathStateRef = useRef<AgentPathState>({
    path: [],
    pathIndex: 0,
    lastPathMs: 0,
    lastTargetPos: null,
  });

  const moveDirRef = useRef({ x: 0, z: 1 });
  const lookDirRef = useRef({ x: 0, z: 1 });

  const [animState, setAnimState] = useState<AgentAnimState>("idle");
  const animStateRef = useRef<AgentAnimState>("idle");

  const orbitRadius = 0.8 + Math.random() * 1.2;

  const personalityRef = useRef<AgentPersonality>({
    moveSpeed: AGENT_SPEED * (0.9 + Math.random() * 0.25),
    repathIntervalMs: PATH_UPDATE_INTERVAL_MS * (0.85 + Math.random() * 0.4),
    orbitRadius,
    orbitAngleOffset: Math.random() * Math.PI * 2,
    attackCooldownMs: 1700 + Math.random() * 1900,
    attackAnimDurationMs: 850 + Math.random() * 250,
    turnSpeed: 5 + Math.random() * 5,
    engageRadius: orbitRadius + 1.4,
  });

  const lastAttackAtRef = useRef(0);
  const attackLockUntilRef = useRef(0);

  const setAnimStateSafe = (next: AgentAnimState) => {
    if (animStateRef.current === next) return;
    animStateRef.current = next;
    setAnimState(next);
  };

  useFrame(() => {
    const rb = rigidBodyRef.current;
    const playerPos = usePlayerPositionStore.getState().position;
    const state = pathStateRef.current;

    if (!rb || !playerPos) return;

    const personality = personalityRef.current;
    const now = performance.now();
    const pos = rb.translation();
    const posVec = { x: pos.x, y: pos.y - BODY_Y_OFFSET, z: pos.z };

    const distToPlayer = Math.sqrt(
      (playerPos.x - pos.x) ** 2 + (playerPos.z - pos.z) ** 2,
    );

    const inAttackSensor = isInPlayerAttackSensorRef.current;

    const orbitTarget = {
      x:
        playerPos.x +
        Math.cos(personality.orbitAngleOffset) * personality.orbitRadius,
      y: playerPos.y,
      z:
        playerPos.z +
        Math.sin(personality.orbitAngleOffset) * personality.orbitRadius,
    };

    const chaseTarget =
      distToPlayer <= personality.engageRadius ? playerPos : orbitTarget;

    const hasPath =
      state.path.length > 1 && state.pathIndex < state.path.length;

    const targetMoved =
      !state.lastTargetPos ||
      getHorizontalDistance(chaseTarget, state.lastTargetPos) >
        TARGET_REPATH_DIST;

    const shouldRepath =
      !inAttackSensor &&
      now - state.lastPathMs > personality.repathIntervalMs &&
      (!hasPath || targetMoved);

    if (shouldRepath) {
      state.lastPathMs = now;

      const startResult = query.findClosestPoint(posVec, {
        halfExtents: PATH_HALF_EXTENTS,
      });
      const endResult = query.findClosestPoint(chaseTarget, {
        halfExtents: PATH_HALF_EXTENTS,
      });

      if (startResult.success && endResult.success) {
        const res = query.computePath(startResult.point, endResult.point);

        if (res.success && res.path?.length) {
          const spacedPath = filterPathBySpacing(res.path, RADIUS * 2.5);

          if (spacedPath.length >= 2) {
            state.path = spacedPath;
            state.pathIndex = 1;
            state.lastTargetPos = { ...chaseTarget };
          }
        }
      }
    }

    const cur = rb.linvel();

    // ---------- ATTACK MODE ----------
    if (inAttackSensor) {
      rb.setLinvel({ x: 0, y: cur.y, z: 0 }, true);

      const toPlayerX = playerPos.x - pos.x;
      const toPlayerZ = playerPos.z - pos.z;
      const toPlayerLen = Math.hypot(toPlayerX, toPlayerZ);

      if (toPlayerLen > 1e-6) {
        lookDirRef.current = {
          x: toPlayerX / toPlayerLen,
          z: toPlayerZ / toPlayerLen,
        };
      }

      if (now < attackLockUntilRef.current) {
        setAnimStateSafe("attack");
        return;
      }

      if (now - lastAttackAtRef.current >= personality.attackCooldownMs) {
        lastAttackAtRef.current = now;
        attackLockUntilRef.current = now + personality.attackAnimDurationMs;
        setAnimStateSafe("attack");
        return;
      }

      return;
    }

    // ---------- CHASE / WALK MODE ----------
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

      if (distH > 1e-6) {
        const len = distH;
        const dirX = dx / len;
        const dirZ = dz / len;

        moveDirRef.current = { x: dirX, z: dirZ };
        lookDirRef.current = { x: dirX, z: dirZ };
        setAnimStateSafe("walk");

        const vx = cur.x + dirX * personality.moveSpeed * 0.15;
        const vz = cur.z + dirZ * personality.moveSpeed * 0.15;
        const speed = Math.sqrt(vx * vx + vz * vz);
        const maxSpeed = personality.moveSpeed * 1.2;
        const scale = speed > maxSpeed ? maxSpeed / speed : 1;

        rb.setLinvel({ x: vx * scale, y: cur.y, z: vz * scale }, true);
      } else {
        setAnimStateSafe("idle");
      }
    } else {
      setAnimStateSafe("idle");
    }
  });

  return (
    <>
      <RigidBody
        ref={rigidBodyRef}
        position={[spawnPosition.x, spawnPosition.y, spawnPosition.z]}
        mass={10}
        enabledRotations={[false, false, false]}
        lockRotations
        colliders={false}
        userData={{ camExcludeCollision: true, type: "enemy" }}
      >
        <CapsuleCollider
          args={[(HEIGHT - 2 * RADIUS) / 2, RADIUS]}
          onIntersectionEnter={(payload) => {
            const sensorType = payload.other.rigidBodyObject?.userData?.type;
            if (sensorType === "player") {
              isInPlayerAttackSensorRef.current = true;
            }
            if (sensorType === "weapon") {
              console.log("Hit!", sensorType);
            }
          }}
          onIntersectionExit={(payload) => {
            const sensorType = payload.other.rigidBodyObject?.userData?.type;
            if (sensorType === "player") {
              isInPlayerAttackSensorRef.current = false;
            }
          }}
        />

        <group scale={0.7} position={[0, -BODY_Y_OFFSET, 0]}>
          <EnemyCharacterModel
            modelPath="/3d-models/ps-game/monster.glb"
            animState={animState}
            lookDirRef={lookDirRef}
            turnSpeed={personalityRef.current.turnSpeed}
          />
        </group>
      </RigidBody>

      {isDebug && (
        <AgentPathDebugSingle
          rigidBodyRef={rigidBodyRef}
          pathStateRef={pathStateRef}
        />
      )}
    </>
  );
}

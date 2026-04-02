import { useInterval } from "@/hooks/useInterval";
import {
  CapsuleCollider,
  RapierRigidBody,
  RigidBody,
  useBeforePhysicsStep,
} from "@react-three/rapier";
import { FC, useEffect, useRef, useState } from "react";
import { Quaternion, Vector3, Vector3Like } from "three";
import { navQuery, playerQuery } from "../../../ecs";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import { AnimState } from "../models/anim.model";
import { useCombatStatusStore } from "../../../store/combat-status-store";

export type AgentProps = {
  position: [number, number, number];
  isDebug?: boolean;
  children: React.ReactNode;
  size?: [number, number];
  onAnimStateChange: (animState: AnimState) => void;
  intervalUpdateMs?: number;
  name: string;
};

const radius = 0.5;
const height = 1.5;
const attackDistance = 1.8;

const _agentPosition = new Vector3();
const _agentLookAt = new Vector3();
const _direction = new Vector3();
const _targetQuat = new Quaternion();
const _slerpedQuat = new Quaternion();

const up = new Vector3(0, 1, 0);

const queryHalfExtents = new Vector3(10, 10, 10);

const horizontalDistance = (a: Vector3Like, b: Vector3Like) => {
  return Math.sqrt((a.x - b.x) ** 2 + (a.z - b.z) ** 2);
};

const distanceThreshold = 1.3;
const speed = 3.5;

const Agent: FC<AgentProps> = ({
  position,
  isDebug = false,
  children,
  size = [radius, height],
  onAnimStateChange,
  intervalUpdateMs = 1000,
  name,
}) => {
  const ref = useRef<RapierRigidBody>(null!);
  const isAttack = useCombatStatusStore((s) => s.isPlayerAttacking);
  const hitPlayerAttackRef = useRef(false);

  useEffect(() => {
    if (!isAttack) {
      hitPlayerAttackRef.current = false;
    }
  }, [isAttack]);

  const [path, setPath] = useState<Vector3[]>([]);
  const pathIndex = useRef(1);

  //    compute path

  useInterval(() => {
    const nav = navQuery.first?.nav;
    if (!nav) return;

    if (nav.navMeshVersion === 0) return;

    const navMeshQuery = nav.navMeshQuery;
    if (!navMeshQuery) return;

    const player = playerQuery.first;
    if (!player) return;

    const rigidBody = ref.current;
    const { nearestPoint: agentNearestPoint } = navMeshQuery.findNearestPoly(
      rigidBody.translation(),
      { halfExtents: queryHalfExtents },
    );

    const agentPoints = _agentPosition.copy(agentNearestPoint);

    const { nearestPoint: playerPosition } = navMeshQuery.findNearestPoly(
      player.rigidBody.translation(),
      { halfExtents: queryHalfExtents },
    );

    const { path } = navMeshQuery.computePath(agentPoints, playerPosition);

    pathIndex.current = 1;

    setPath(path.map((p) => new Vector3(p.x, p.y, p.z)));
  }, intervalUpdateMs);

  //   movement

  useBeforePhysicsStep(() => {
    const navMeshQuery = navQuery.first?.nav.navMeshQuery;

    if (!navMeshQuery) return;

    const player = playerQuery.first;
    if (!player) return;

    if (!path || path.length < 2) return;

    const rigidBody = ref.current;

    // teleport if falling of map

    if (rigidBody.translation().y < -50) {
      rigidBody.setTranslation({ x: 0, y: 5, z: 0 }, true);
    }

    const playerPos = player.rigidBody.translation();
    const agentPos = rigidBody.translation();

    const distToPlayer = horizontalDistance(agentPos, playerPos);

    if (distToPlayer < attackDistance) {
      onAnimStateChange(AnimState.Attack);
      return;
    }

    // advance through the path
    // very native approach, won't work for complex paths

    while (
      pathIndex.current < path.length - 1 &&
      horizontalDistance(path[pathIndex.current], agentPos) < 0.05 &&
      path[pathIndex.current + 1]
    ) {
      pathIndex.current++;
    }

    const next = path[pathIndex.current];
    if (!next) return;

    // early exit if close enough to the final point
    if (pathIndex.current === path.length - 1) {
      if (horizontalDistance(next, agentPos) < distanceThreshold) {
        onAnimStateChange(AnimState.Idle);
        return;
      }
    }

    const direction = _direction.copy(next).sub(agentPos);
    direction.y = 0;
    direction.normalize();

    const vel = direction.multiplyScalar(speed);
    vel.y = rigidBody.linvel().y;

    const horizontalSpeed = Math.hypot(vel.x, vel.z);
    const isMoving = horizontalSpeed > 0.1;
    if (isMoving) {
      onAnimStateChange(AnimState.Walk);
    }
    rigidBody.setLinvel(vel, true);
  });

  //   rotation

  useFrame((_, delta) => {
    const t = 1 - 0.001 ** delta;

    const lookAt = _agentLookAt;

    if (path.length === 0) {
      const player = playerQuery.first;
      if (!player) return;

      lookAt.copy(player.rigidBody.translation());
    } else if (path[pathIndex.current]) {
      lookAt.copy(path[pathIndex.current]);
    }

    if (horizontalDistance(lookAt, ref.current.translation()) < 0.1) {
      return;
    }

    const direction = _direction.copy(ref.current.translation()).sub(lookAt);
    direction.y = 0;
    direction.normalize();

    const yRot = Math.atan2(direction.x, direction.z) - Math.PI;
    const targetQuat = _targetQuat.setFromAxisAngle(up, yRot).normalize();
    const slerpedQuat = _slerpedQuat
      .copy(ref.current.rotation())
      .clone()
      .slerp(targetQuat, t * 2);

    ref.current.setRotation(slerpedQuat, true);
  });

  return (
    <>
      <RigidBody
        ref={ref}
        position={position}
        type="dynamic"
        enabledRotations={[false, true, false]}
        colliders={false}
        angularDamping={0.9}
        linearDamping={0.5}
        userData={{ type: "enemy", enemyId: name }}
        onIntersectionEnter={(e) => {
          const other = e.other.rigidBodyObject;
          if (other?.userData?.type === "player-weapon") {
            const isAttack = useCombatStatusStore.getState().isPlayerAttacking;
            if (isAttack && !hitPlayerAttackRef.current) {
              const ud = other.userData as { damage?: number };
              const damage = typeof ud.damage === "number" ? ud.damage : 10;
              useCombatStatusStore.getState().applyDamageToEnemy(name, damage);
              hitPlayerAttackRef.current = true;
            }
          }
        }}
      >
        {children}

        <CapsuleCollider args={[size[1] / 2, size[0]]} />
      </RigidBody>

      {isDebug && path.length > 0 && (
        <Line points={path} color="blue" lineWidth={2} position={[0, 0.2, 0]} />
      )}
    </>
  );
};

export default Agent;

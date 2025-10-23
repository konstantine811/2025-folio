// useCrowdFollower.ts (fixed)
import { useEffect, useMemo, useRef } from "react";
import { Object3D, Vector3 } from "three";
import {
  NavMesh,
  NavMeshQuery,
  Crowd,
  CrowdAgentParams,
} from "recast-navigation";
import { RapierRigidBody } from "@react-three/rapier";

type FollowerOpts = {
  navMesh: NavMesh | null;
  query: NavMeshQuery | null;
  crowd: Crowd | null | undefined;
  baseParams: CrowdAgentParams;
  followerObj: Object3D | null;
  leaderObj: RapierRigidBody | null;
};

export function useCrowdFollower({
  navMesh,
  query,
  crowd,
  baseParams,
  followerObj,
  leaderObj,
}: FollowerOpts) {
  const agentIdRef = useRef<number | null>(null);
  const tmp = useMemo(() => new Vector3(), []);
  const lastTarget = useMemo(() => new Vector3(), []);

  // 1) Створюємо агента у позиції followerObj (спроєктованій на NavMesh)
  useEffect(() => {
    if (!followerObj || !query || !crowd) return;

    // стартові координати як масив
    const s = followerObj.getWorldPosition(tmp);
    const startArr: [number, number, number] = [s.x, s.y, s.z];

    // проєкція на навмеш (масиви!)
    const extents = [2, 4, 2] as [number, number, number];

    // ПРИМІТКА: залежить від твоєї версії API:
    // варіант А:
    // const nearest = query.findNearestPoly(startArr, extents, 0);
    // const pos = nearest?.nearest ?? startArr;

    // варіант Б (у тебе було з об’єктом):
    const nearest = query.findNearestPoly(startArr, {
      halfExtents: { x: 2, y: 4, z: 2 },
    });
    const np = (nearest as any)?.nearestPoint ?? startArr;

    // додаємо агента — повертається id (number)
    const id = (crowd as any).addAgent
      ? (crowd as any).addAgent(np, baseParams)
      : null;

    if (typeof id === "number") {
      agentIdRef.current = id;
    } else {
      // якщо твій crowd повертає об’єкт — підлаштуйся тут
      agentIdRef.current = (id && (id.agentIndex as number)) ?? null;
    }

    return () => {
      if (agentIdRef.current !== null) {
        crowd.removeAgent(agentIdRef.current);
        agentIdRef.current = null;
      }
    };
  }, [crowd, query, followerObj, baseParams, tmp]);

  // 2) Tick: crowd.update + синхронізація меша
  useEffect(() => {
    if (!crowd || !followerObj) return;
    let raf = 0;
    let last = performance.now();

    const tick = () => {
      const now = performance.now();
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      crowd.update(dt);

      const id = agentIdRef.current;
      if (id !== null) {
        const agent = crowd.getAgent(id);
        if (agent) {
          // знову: формати залежать від збірки
          // варіант А: масив [x,y,z]
          const pArr =
            (agent as any).position?.() ?? (agent as any).position ?? null;
          if (pArr) {
            const x = pArr.x ?? pArr[0],
              y = pArr.y ?? pArr[1],
              z = pArr.z ?? pArr[2];
            followerObj.position.set(x, y, z);

            const vArr =
              (agent as any).velocity?.() ?? (agent as any).velocity ?? null;
            if (vArr) {
              const vx = vArr.x ?? vArr[0],
                vy = vArr.y ?? vArr[1],
                vz = vArr.z ?? vArr[2];
              if (Math.abs(vx) + Math.abs(vz) > 1e-3) {
                followerObj.lookAt(x + vx, y, z + vz);
              }
            }
          }
        }
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [crowd, followerObj]);

  // 3) Періодично оновлюємо ціль: позицію лідера → findNearestPoly → requestMoveTarget
  useEffect(() => {
    if (!query || !crowd) return;
    let raf = 0;
    let frame = 0;

    const updateTarget = () => {
      frame++;

      if (frame % 12 === 0 && agentIdRef.current !== null && leaderObj) {
        const t = leaderObj.translation(); // {x,y,z}
        const tx = t.x,
          ty = t.y,
          tz = t.z;

        // правильний Vector3 для порівняння
        if (lastTarget.distanceToSquared(tmp.set(tx, ty, tz)) > 0.04) {
          // проєкція цілі на навмеш
          // знову ж: формат залежить від твоєї збірки
          // варіант А:
          // const nearest = query.findNearestPoly([tx, ty, tz], [2, 4, 2], 0);
          // if (nearest?.nearest && nearest?.nearestRef) {
          //   crowd.requestMoveTarget(agentIdRef.current, nearest.nearestRef, nearest.nearest);
          // }

          // варіант Б (твій синтаксис):
          const nearest = query.findNearestPoly([tx, ty, tz], {
            halfExtents: { x: 2, y: 4, z: 2 },
          });
          const p = (nearest as any)?.nearestPoint;
          if (p) {
            // дві можливі сигнатури:
            const id = agentIdRef.current;

            // 1) через crowd:
            if ((crowd as any).requestMoveTarget) {
              // якщо потрібно ref полігона — дістань із nearest (наприклад nearest.nearestRef)
              (crowd as any).requestMoveTarget(
                id,
                (nearest as any).nearestRef ?? 0,
                p
              );
            } else {
              // 2) або через агент:
              (crowd.getAgent(id) as any)?.requestMoveTarget(p);
            }

            lastTarget.set(tx, ty, tz);
          }
        }
      }

      raf = requestAnimationFrame(updateTarget);
    };

    raf = requestAnimationFrame(updateTarget);
    return () => cancelAnimationFrame(raf);
  }, [crowd, query, leaderObj, lastTarget, tmp]);
}

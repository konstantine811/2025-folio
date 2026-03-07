import { NavMeshQuery } from "recast-navigation";
import { Vec3 } from "../models/character-controller.model";
import { BODY_Y_OFFSET, PATH_HALF_EXTENTS } from "../config/agent.config";

export function generateRandomSpawnPositions(
  query: NavMeshQuery,
  count: number,
  options?: {
    center?: Vec3;
    areaRadius?: number;
    minDistanceBetweenAgents?: number;
    avoidPosition?: Vec3 | null;
    avoidRadius?: number;
    maxAttemptsPerAgent?: number;
  },
): Vec3[] {
  const center = options?.center ?? { x: 0, y: 0, z: 0 };
  const areaRadius = options?.areaRadius ?? 12;
  const minDistanceBetweenAgents = options?.minDistanceBetweenAgents ?? 1.5;
  const avoidPosition = options?.avoidPosition ?? null;
  const avoidRadius = options?.avoidRadius ?? 4;
  const maxAttemptsPerAgent = options?.maxAttemptsPerAgent ?? 30;

  const result: Vec3[] = [];

  for (let i = 0; i < count; i++) {
    let found: Vec3 | null = null;

    for (let attempt = 0; attempt < maxAttemptsPerAgent; attempt++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.sqrt(Math.random()) * areaRadius;

      const candidate = {
        x: center.x + Math.cos(angle) * radius,
        y: center.y,
        z: center.z + Math.sin(angle) * radius,
      };

      const snapped = query.findClosestPoint(candidate, {
        halfExtents: PATH_HALF_EXTENTS,
      });

      if (!snapped.success) continue;

      const point: Vec3 = {
        x: snapped.point.x,
        y: snapped.point.y + BODY_Y_OFFSET,
        z: snapped.point.z,
      };

      if (avoidPosition) {
        const dx = point.x - avoidPosition.x;
        const dz = point.z - avoidPosition.z;
        const distToAvoid = Math.sqrt(dx * dx + dz * dz);

        if (distToAvoid < avoidRadius) continue;
      }

      let tooClose = false;

      for (const existing of result) {
        const dx = point.x - existing.x;
        const dz = point.z - existing.z;
        const dist = Math.sqrt(dx * dx + dz * dz);

        if (dist < minDistanceBetweenAgents) {
          tooClose = true;
          break;
        }
      }

      if (tooClose) continue;

      found = point;
      break;
    }

    if (found) {
      result.push(found);
    }
  }

  return result;
}

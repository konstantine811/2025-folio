import { useFrame } from "@react-three/fiber";
import { useRapier } from "@react-three/rapier";
import { useSciFiWorldPhaseStore } from "./sci-fi-world-phase-store";

/** Applies pending teleport to the player rigid body (same canvas, no route change). */
export function SciFiPlayerTeleportSync() {
  const pendingTeleport = useSciFiWorldPhaseStore((s) => s.pendingTeleport);
  const clearPendingTeleport = useSciFiWorldPhaseStore(
    (s) => s.clearPendingTeleport,
  );
  const { world } = useRapier();

  useFrame(() => {
    if (!pendingTeleport) return;

    const bodies = world.bodies;
    for (let i = 0; i < bodies.len(); i++) {
      const body = bodies.get(i);
      if (!body) continue;

      const userData = body.userData as { type?: string } | undefined;
      if (userData?.type !== "player") continue;

      body.setTranslation(pendingTeleport, true);
      body.setLinvel({ x: 0, y: 0, z: 0 }, true);
      body.setAngvel({ x: 0, y: 0, z: 0 }, true);
      clearPendingTeleport();
      break;
    }
  });

  return null;
}

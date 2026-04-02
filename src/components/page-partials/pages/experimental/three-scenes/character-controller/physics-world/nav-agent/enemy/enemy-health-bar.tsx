import { Billboard, Html } from "@react-three/drei";
import { useCombatStatusStore } from "../../../store/combat-status-store";

export function EnemyHealthBar({
  enemyId,
  yOffset = 2.4,
}: {
  enemyId: string;
  yOffset?: number;
}) {
  const hp = useCombatStatusStore(
    (s) => s.enemies[enemyId]?.hp ?? s.enemies[enemyId]?.maxHp ?? 100,
  );
  const maxHp = useCombatStatusStore((s) => s.enemies[enemyId]?.maxHp ?? 100);
  const pct = maxHp > 0 ? Math.max(0, Math.min(100, (hp / maxHp) * 100)) : 0;

  return (
    <Billboard follow position={[0, yOffset, 0]}>
      <Html center distanceFactor={10} style={{ pointerEvents: "none" }}>
        <div
          style={{
            width: 152,
            height: 12,
            background: "rgba(0,0,0,0.65)",
            borderRadius: 10,
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.25)",
          }}
        >
          <div
            style={{
              width: `${pct}%`,
              height: "100%",
              background: pct > 30 ? "#4ade80" : "#f87171",
              transition: "width 0.12s ease-out",
            }}
          />
        </div>
      </Html>
    </Billboard>
  );
}

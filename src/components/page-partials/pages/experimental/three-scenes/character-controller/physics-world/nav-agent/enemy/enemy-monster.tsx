import { useEffect, useState } from "react";
import EnemyCharacterModel from "./enemy-character-model";
import Agent from "../agent/agent";
import { AnimState } from "../models/anim.model";
import { useCombatStatusStore } from "../../../store/combat-status-store";
import { EnemyHealthBar } from "./enemy-health-bar";

const monsterChar = "/3d-models/ps-game/monster.glb";

const EnemyMonster = ({
  isDebug,
  position,
  intervalUpdateMs,
  name,
}: {
  isDebug: boolean;
  position: [number, number, number];
  intervalUpdateMs?: number;
  name: string;
}) => {
  const [animState, setAnimState] = useState<AnimState>(AnimState.Idle);
  useEffect(() => {
    useCombatStatusStore
      .getState()
      .setEnemyStatus(name, { hp: 100, maxHp: 100 });
    return () => useCombatStatusStore.getState().resetEnemy(name);
  }, [name]);
  return (
    <Agent
      isDebug={isDebug}
      position={position}
      size={[1, 1.8]}
      onAnimStateChange={setAnimState}
      intervalUpdateMs={intervalUpdateMs}
      name={name}
    >
      <EnemyCharacterModel
        scale={0.6}
        position={[0, -1.8, 0]}
        modelPath={monsterChar}
        animState={animState}
      />
      <EnemyHealthBar enemyId={name} yOffset={2.3} />
    </Agent>
  );
};

export default EnemyMonster;

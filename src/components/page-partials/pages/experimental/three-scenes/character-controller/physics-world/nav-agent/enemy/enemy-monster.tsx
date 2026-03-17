import { useState } from "react";
import EnemyCharacterModel from "./enemy-character-model";
import Agent from "../agent/agent";
import { AnimState } from "../models/anim.model";

const monsterChar = "/3d-models/ps-game/monster.glb";

const EnemyMonster = ({
  isDebug,
  position,
  intervalUpdateMs,
}: {
  isDebug: boolean;
  position: [number, number, number];
  intervalUpdateMs?: number;
}) => {
  const [animState, setAnimState] = useState<AnimState>(AnimState.Idle);
  return (
    <Agent
      isDebug={isDebug}
      position={position}
      size={[1, 1.8]}
      onAnimStateChange={setAnimState}
      intervalUpdateMs={intervalUpdateMs}
    >
      <EnemyCharacterModel
        scale={0.6}
        position={[0, -1.8, 0]}
        modelPath={monsterChar}
        animState={animState}
      />
    </Agent>
  );
};

export default EnemyMonster;

import { randomInt, getRandomFromTo } from "@/utils/random";
import EnemyMonster from "./enemy-monster";

const EnemyMonsters = ({
  isDebug = false,
  count = 10,
}: {
  isDebug?: boolean;
  count?: number;
}) => {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <EnemyMonster
          key={index}
          name={`enemy-monster-${index}`}
          isDebug={isDebug}
          position={[getRandomFromTo(-10, 10), 1.2, getRandomFromTo(-10, 10)]}
          intervalUpdateMs={randomInt(100, 1500)}
        />
      ))}
    </>
  );
};

export default EnemyMonsters;

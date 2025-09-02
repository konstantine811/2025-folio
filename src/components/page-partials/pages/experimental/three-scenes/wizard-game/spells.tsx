import Fire from "./fire";
import { useMagicStore } from "./hooks/useMagic";
import Void from "./void";
import Ice from "./ice";

const Spells = () => {
  const spells = useMagicStore((s) => s.spells);
  return (
    <>
      {spells.map((spell) => {
        switch (spell.name) {
          case "void":
            return <Void key={spell.id} position={spell.position} />;
          case "ice":
            return <Ice key={spell.id} position={spell.position} />;
          case "fire":
            return <Fire key={spell.id} position={spell.position} />;
        }
      })}
    </>
  );
};

export default Spells;

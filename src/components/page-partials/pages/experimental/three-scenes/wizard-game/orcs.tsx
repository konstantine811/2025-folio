import { useMagicStore } from "./hooks/useMagic";
import Orc from "./orc";

const Orcs = () => {
  const orcs = useMagicStore((s) => s.orcs);
  return orcs.map((orc) => <Orc key={orc.id} orc={orc} scale={0.4} />);
};

export default Orcs;

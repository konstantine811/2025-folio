import Firework from "./firework";
import useFireworks from "./hooks/useFireworks";

const Fireworks = () => {
  const fireworks = useFireworks((s) => s.fireworks);
  return fireworks.map((firework) => {
    return (
      <Firework
        key={firework.id}
        color={firework.color}
        delay={firework.delay}
        position={firework.position}
        velocity={firework.velocity}
      />
    );
  });
};

export default Fireworks;

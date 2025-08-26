import useFireworks from "./hooks/useFireworks";

const Fireworks = () => {
  const fireworks = useFireworks((s) => s.fireworks);
  console.log("fireworks", fireworks);
  return null;
};

export default Fireworks;

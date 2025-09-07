import { Instances } from "@react-three/drei";
import { Color, FrontSide } from "three";
import { randFloat, randInt } from "three/src/math/MathUtils.js";
import Box from "./box";

const Boxes = ({ count = 50 }: { count?: number }) => {
  const boxes = Array.from({ length: count }, () => ({
    position: [
      randFloat(2, 200) * (randInt(0, 1) ? -1 : 1),
      randFloat(0.2, 10),
      randFloat(100, 100),
    ] as [number, number, number],
    scale: randFloat(0.2, 1.2),
    color: new Color().setHSL(Math.random(), 1, 0.5),
    speed: randFloat(0.08, 0.42),
  }));
  return (
    <Instances>
      <boxGeometry />
      <meshStandardMaterial side={FrontSide} />
      {boxes.map((box, index) => (
        <Box
          key={index}
          color={box.color}
          scale={box.scale}
          position={box.position}
          speed={box.speed}
        />
      ))}
    </Instances>
  );
};

export default Boxes;

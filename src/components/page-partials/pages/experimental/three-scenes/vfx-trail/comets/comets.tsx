import { useMemo } from "react";
import {
  randFloat,
  randFloatSpread,
  randInt,
} from "three/src/math/MathUtils.js";
import Comet from "./comet";

const Comets = ({ nbTrails = 42 }: { nbTrails?: number }) => {
  const comets = useMemo(() => {
    return new Array(nbTrails).fill(0).map(() => {
      const size = randFloat(1, 3);
      return {
        size,
        orbitSpeed: (2 / size) * (randInt(0, 1) || -1),
        length: randInt(2, 4),
        color: [
          "#fc7de7",
          "#b485ee",
          "#618fff",
          "#61ffdb",
          "#61ff93",
          "#faff61",
          "#ff6161",
          "#ffffff",
          "#ec824d",
          "#eff0b1",
        ][randInt(0, 9)],
        startPosition: [randFloatSpread(20), 0, 0] as [number, number, number],
        coinSpeed: (15 / size) * (randInt(0, 1) || -1),
        radius: randFloat(4, 6),
      };
    });
  }, [nbTrails]);
  return (
    <>
      {comets.map((props, index) => {
        return (
          <Comet
            key={index}
            size={props.size}
            length={props.length}
            color={props.color}
            startPosition={props.startPosition}
            orbitSpeed={props.orbitSpeed}
            coinSpeed={props.coinSpeed}
            radius={props.radius}
          />
        );
      })}
    </>
  );
};

export default Comets;

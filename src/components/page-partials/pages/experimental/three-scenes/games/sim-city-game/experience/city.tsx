import { FC } from "react";
import { createCity } from "./utils/city";

const city = createCity(40);

export const City: FC = () => {
  return (
    <group>
      {city.data.map((column, x) => (
        <group key={x}>
          {column.map((tile, y) => (
            <mesh key={y} position={[tile.x, 0, tile.y]}>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="red" />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
};

import { ContactShadows, Instances, OrbitControls } from "@react-three/drei";
import NinjaMale from "./ninja-male";
import { Color, DoubleSide, MathUtils } from "three";
import Box from "./box";
import { useMemo } from "react";

const Experience = ({ nBoxes = 10 }: { nBoxes?: number }) => {
  const boxes = useMemo(() => {
    return Array.from({ length: nBoxes }, () => ({
      position: [
        MathUtils.randFloat(2, 20) * (MathUtils.randInt(0, 1) ? -1 : 1),
        MathUtils.randFloat(0.2, 10),
        MathUtils.randFloat(10, 50),
      ] as [number, number, number],
      scale: MathUtils.randFloat(0.2, 1.2),
      color: new Color().setHSL(Math.random(), 1, 0.5),
      speed: MathUtils.randFloat(0.08, 0.42),
    }));
  }, [nBoxes]);
  return (
    <>
      <OrbitControls
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={0}
        maxDistance={12}
        minDistance={8}
      />
      <NinjaMale props={{ scale: 1.4 }} />
      <ContactShadows opacity={0.5} />
      <Instances>
        <boxGeometry />
        <meshStandardMaterial side={DoubleSide} />
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
    </>
  );
};

export default Experience;

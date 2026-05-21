import { OrbitControls } from "@react-three/drei";
import { useControls } from "leva";
import { useMemo } from "react";
import { InfiniteStylizedWorld } from "./infinite-stylized-world";

const Experience = () => {
  const { windStrength, windSpeed, bushesPerTile, viewRadius, showGridDebug } =
    useControls("Stylized World", {
      windStrength: { value: 0.12, min: 0, max: 0.5, step: 0.01 },
      windSpeed: { value: 0.05, min: 0, max: 0.2, step: 0.005 },
      bushesPerTile: { value: 6, min: 0, max: 16, step: 1 },
      viewRadius: { value: 6, min: 3, max: 10, step: 1 },
      showGridDebug: { value: true, label: "Grid debug" },
    });

  const bush = useMemo(
    () => ({ windStrength, windSpeed }),
    [windStrength, windSpeed],
  );

  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[4, 8, 3]} intensity={1.1} />
      <InfiniteStylizedWorld
        tileSize={8}
        radius={viewRadius}
        maxRadius={viewRadius + 4}
        bushesPerTile={bushesPerTile}
        bush={bush}
        showGridDebug={showGridDebug}
      />
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        maxPolarAngle={Math.PI / 2.1}
        minDistance={3}
      />
    </>
  );
};

export default Experience;

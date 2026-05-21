import { Physics } from "@react-three/rapier";
import { useControls } from "leva";
import { useMemo, useRef } from "react";
import { Vector3 } from "three";
import { InfiniteStylizedWorld } from "./infinite-stylized-world";
import { StylizedCarController } from "./stylized-car-controller";
import { StylizedWorldGround } from "./stylized-world-ground";

const Experience = () => {
  const {
    windStrength,
    windSpeed,
    bushesPerTile,
    viewRadius,
    showGridDebug,
    accelerationForce,
    breakForce,
    topSpeed,
    maxSteerDeg,
    steerSmoothing,
  } = useControls("Stylized World", {
    windStrength: { value: 0.12, min: 0, max: 0.5, step: 0.01 },
    windSpeed: { value: 0.05, min: 0, max: 0.2, step: 0.005 },
    bushesPerTile: { value: 1, min: 0, max: 16, step: 1 },
    viewRadius: { value: 6, min: 3, max: 10, step: 1 },
    showGridDebug: { value: true, label: "Grid debug" },
    accelerationForce: {
      value: 1.8,
      min: 0.5,
      max: 5,
      step: 0.1,
      label: "Acceleration",
    },
    breakForce: {
      value: 1.2,
      min: 0.2,
      max: 4,
      step: 0.1,
      label: "Brake force",
    },
    topSpeed: {
      value: 12,
      min: 4,
      max: 20,
      step: 0.5,
      label: "Top speed",
    },
    maxSteerDeg: {
      value: 32,
      min: 10,
      max: 60,
      step: 1,
      label: "Steer angle (deg)",
    },
    steerSmoothing: {
      value: 0.35,
      min: 0.08,
      max: 1,
      step: 0.01,
      label: "Steer smoothing",
    },
  });

  const bush = useMemo(
    () => ({ windStrength, windSpeed }),
    [windStrength, windSpeed],
  );

  const focusRef = useRef(new Vector3());
  const groundRadius = viewRadius + 4;

  return (
    <Physics gravity={[0, -9.81, 0]} timeStep="vary" interpolate={false}>
      <ambientLight intensity={0.45} />
      <directionalLight position={[4, 8, 3]} intensity={1.1} />
      <InfiniteStylizedWorld
        tileSize={8}
        radius={viewRadius}
        maxRadius={groundRadius}
        bushesPerTile={bushesPerTile}
        bush={bush}
        showGridDebug={showGridDebug}
        focusRef={focusRef}
      />
      <StylizedWorldGround
        focusRef={focusRef}
        tileSize={8}
        radius={groundRadius}
      />
      <StylizedCarController
        focusRef={focusRef}
        accelerationForce={accelerationForce}
        breakForce={breakForce}
        topSpeed={topSpeed}
        maxSteerDeg={maxSteerDeg}
        steerSmoothing={steerSmoothing}
      />
    </Physics>
  );
};

export default Experience;

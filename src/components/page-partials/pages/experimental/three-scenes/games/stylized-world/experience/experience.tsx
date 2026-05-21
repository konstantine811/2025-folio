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
    engineForceMax,
    engineForceStep,
    brakeForceMax,
    maxSteerDeg,
    steerLerp,
    topSpeed,
  } = useControls("Stylized World", {
    windStrength: { value: 0.12, min: 0, max: 0.5, step: 0.01 },
    windSpeed: { value: 0.05, min: 0, max: 0.2, step: 0.005 },
    bushesPerTile: { value: 1, min: 0, max: 16, step: 1 },
    viewRadius: { value: 6, min: 3, max: 10, step: 1 },
    showGridDebug: { value: true, label: "Grid debug" },
    engineForceMax: {
      value: 15,
      min: 6,
      max: 30,
      step: 0.5,
      label: "Engine force max",
    },
    engineForceStep: {
      value: 0.5,
      min: 0.1,
      max: 2,
      step: 0.05,
      label: "Engine ramp step",
    },
    brakeForceMax: {
      value: 1,
      min: 0.3,
      max: 2,
      step: 0.05,
      label: "Brake force max",
    },
    maxSteerDeg: {
      value: 40,
      min: 20,
      max: 45,
      step: 1,
      label: "Steer angle (deg)",
    },
    steerLerp: {
      value: 0.25,
      min: 0.08,
      max: 0.4,
      step: 0.01,
      label: "Steer lerp",
    },
    topSpeed: {
      value: 7,
      min: 4,
      max: 14,
      step: 0.5,
      label: "Top speed (m/s)",
    },
  });

  const bush = useMemo(
    () => ({ windStrength, windSpeed }),
    [windStrength, windSpeed],
  );

  const focusRef = useRef(new Vector3());
  const groundRadius = viewRadius + 4;

  return (
    <Physics gravity={[0, -9.81, 0]} timeStep={1 / 60} interpolate>
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
        engineForceMax={engineForceMax}
        engineForceMin={-engineForceMax}
        engineForceStep={engineForceStep}
        brakeForceMax={brakeForceMax}
        brakeForceStep={0.05}
        maxSteerDeg={maxSteerDeg}
        steerLerp={steerLerp}
        topSpeed={topSpeed}
      />
    </Physics>
  );
};

export default Experience;

import { Physics } from "@react-three/rapier";
import { useControls } from "leva";
import { useMemo, useRef } from "react";
import { Vector3 } from "three";
import { InfiniteStylizedWorld } from "./infinite-stylized-world";
import { StylizedCarController } from "./stylized-car-controller";
import { StylizedWorldGround } from "./stylized-world-ground";
import { StylizedWorldTestCourse } from "./stylized-world-test-course";

const Experience = () => {
  const {
    windStrength,
    windSpeed,
    bushesPerTile,
    viewRadius,
    showGridDebug,
    showTestCourse,
    showGrass,
    grassBladeHeight,
    accelerateForce,
    brakeForce,
    steerAngleDeg,
    isDebug,
  } = useControls("Stylized World", {
    windStrength: { value: 0.12, min: 0, max: 0.5, step: 0.01 },
    windSpeed: { value: 0.05, min: 0, max: 0.2, step: 0.005 },
    bushesPerTile: { value: 1, min: 0, max: 16, step: 1 },
    viewRadius: { value: 6, min: 3, max: 10, step: 1 },
    showGridDebug: { value: true, label: "Grid debug" },
    showTestCourse: { value: true, label: "Test course" },
    showGrass: { value: true, label: "Grass" },
    grassBladeHeight: {
      value: 0.52,
      min: 0.2,
      max: 1.2,
      step: 0.02,
      label: "Grass blade height",
    },
    accelerateForce: {
      value: 8.5,
      min: 0.5,
      max: 10,
      step: 0.1,
      label: "Accelerate force",
    },
    brakeForce: {
      value: 0.08,
      min: 0.01,
      max: 0.5,
      step: 0.01,
      label: "Brake force",
    },
    steerAngleDeg: {
      value: 34,
      min: 3,
      max: 62,
      step: 0.5,
      label: "Steer angle (deg)",
    },
    isDebug: { value: false, label: "Debug" },
  });

  const bush = useMemo(
    () => ({ windStrength, windSpeed }),
    [windStrength, windSpeed],
  );

  const grass = useMemo(
    () => ({
      bladeHeightMin: grassBladeHeight * 0.55,
      bladeHeightMax: grassBladeHeight * 1.15,
      windSwayStrength: windStrength * 0.85,
      pushRadius: 1.4,
    }),
    [grassBladeHeight, windStrength],
  );

  const focusRef = useRef(new Vector3());
  const physicsRadius = viewRadius + 4;
  const visualRadius = physicsRadius + 3;

  return (
    <Physics
      debug={isDebug}
      gravity={[0, -9.81, 0]}
      timeStep={1 / 60}
      interpolate
    >
      <ambientLight intensity={0.45} />
      <directionalLight position={[4, 8, 3]} intensity={1.1} />
      <InfiniteStylizedWorld
        tileSize={8}
        radius={visualRadius}
        bushesPerTile={bushesPerTile}
        bush={bush}
        grass={grass}
        showGrass={showGrass}
        showGridDebug={showGridDebug}
        focusRef={focusRef}
      />
      <StylizedWorldGround
        focusRef={focusRef}
        tileSize={8}
        radius={physicsRadius}
      />
      {showTestCourse && <StylizedWorldTestCourse />}
      <StylizedCarController
        focusRef={focusRef}
        accelerateForce={accelerateForce}
        brakeForce={brakeForce}
        steerAngle={(steerAngleDeg * Math.PI) / 180}
      />
    </Physics>
  );
};

export default Experience;

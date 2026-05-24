import { Environment } from "@react-three/drei";
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
    grassClumpSize,
    grassClumpBlend,
    grassDensity,
    grassStraightness,
    grassHeightVariation,
    grassBladeRandomness,
    grassWidthRandomness,
    grassBendRandomness,
    grassTerrainAmp,
    grassWindFacing,
    grassWindDistanceStart,
    grassWindDistanceEnd,
    grassDebugLod,
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
    grassClumpSize: {
      value: 0.8,
      min: 0.2,
      max: 2.5,
      step: 0.05,
      label: "Grass clump size",
    },
    grassClumpBlend: {
      value: 0.2,
      min: 0.05,
      max: 0.6,
      step: 0.01,
      label: "Grass clump blend",
    },
    grassDensity: {
      value: 1,
      min: 0.1,
      max: 1,
      step: 0.01,
      label: "Grass density",
    },
    grassStraightness: {
      value: 1,
      min: 0,
      max: 1,
      step: 0.01,
      label: "Grass straightness",
    },
    grassHeightVariation: {
      value: 0.85,
      min: 0,
      max: 1,
      step: 0.01,
      label: "Grass height variation",
    },
    grassBladeRandomness: {
      value: 0.3,
      min: 0,
      max: 0.6,
      step: 0.01,
      label: "Grass height random",
    },
    grassWidthRandomness: {
      value: 0.3,
      min: 0,
      max: 0.6,
      step: 0.01,
      label: "Grass width random",
    },
    grassBendRandomness: {
      value: 0.2,
      min: 0,
      max: 0.6,
      step: 0.01,
      label: "Grass bend random",
    },
    grassTerrainAmp: {
      value: 0.12,
      min: 0,
      max: 0.5,
      step: 0.01,
      label: "Grass terrain amp",
    },
    grassWindFacing: {
      value: 0.6,
      min: 0,
      max: 1,
      step: 0.01,
      label: "Grass wind facing",
    },
    grassWindDistanceStart: {
      value: 10,
      min: 0,
      max: 80,
      step: 1,
      label: "Grass wind fade start (m)",
    },
    grassWindDistanceEnd: {
      value: 30,
      min: 1,
      max: 120,
      step: 1,
      label: "Grass wind fade end (m)",
    },
    grassDebugLod: {
      value: false,
      label: "Grass LOD debug",
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
      bladeHeightMin: grassBladeHeight * 0.35,
      bladeHeightMax: grassBladeHeight * 1.45,
      windSwayStrength: windStrength * 0.85,
      windScale: 0.25,
      windSpeed: windSpeed * 12,
      windStrength: windStrength * 2.8,
      windFacing: grassWindFacing,
      windDistanceStart: grassWindDistanceStart,
      windDistanceEnd: Math.max(grassWindDistanceStart + 1, grassWindDistanceEnd),
      windDirX: 0.85,
      windDirZ: 0.35,
      pushRadius: 1.4,
      clumpSize: grassClumpSize,
      clumpBlend: grassClumpBlend,
      density: grassDensity,
      straightness: grassStraightness,
      heightVariation: grassHeightVariation,
      bladeRandomnessX: grassBladeRandomness,
      bladeRandomnessY: grassWidthRandomness,
      bladeRandomnessZ: grassBendRandomness,
      terrainAmp: grassTerrainAmp,
      terrainFreq: 0.06,
      terrainSeed: 42,
      debugLod: grassDebugLod,
    }),
    [
      grassBladeHeight,
      windStrength,
      windSpeed,
      grassClumpSize,
      grassClumpBlend,
      grassDensity,
      grassStraightness,
      grassHeightVariation,
      grassBladeRandomness,
      grassWidthRandomness,
      grassBendRandomness,
      grassTerrainAmp,
      grassWindFacing,
      grassWindDistanceStart,
      grassWindDistanceEnd,
      grassDebugLod,
    ],
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
      <Environment preset="park" environmentIntensity={0.45} />
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

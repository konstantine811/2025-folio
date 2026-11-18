import { Environment, Lightformer } from "@react-three/drei";
import { useLayoutEffect, useRef } from "react";
import { useControls } from "leva";
import { DirectionalLight } from "three";

import { isMobileDevice } from "@/utils/device-capabilities";


/** Local lights and a static reflection rig; no external HDR download. */
export function SciFiLighting() {
  const windowLight = useRef<DirectionalLight>(null);
  const { ambient, sunlight, ceiling, windowFill, reflections } = useControls(
    "Sci-fi / Lighting",
    {
      ambient: { value: 0.22, min: 0, max: 2, step: 0.01 },
      sunlight: { value: 2.4, min: 0, max: 6, step: 0.1 },
      ceiling: { value: 4, min: 0, max: 12, step: 0.1 },
      windowFill: { value: 2, min: 0, max: 8, step: 0.1 },
      reflections: { value: 0.65, min: 0, max: 2, step: 0.01 },
    },
  );

  useLayoutEffect(() => {
    if (!windowLight.current) return;
    windowLight.current.target.position.set(0, 0, 14);
    windowLight.current.target.updateMatrixWorld();
  }, []);

  return (
    <>
      <ambientLight intensity={ambient} color="#b9c9e4" />
      <directionalLight
        ref={windowLight}
        position={[4, 7, -4]}
        color="#c5dcff"
        intensity={sunlight}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-camera-near={0.5}
        shadow-camera-far={55}
        shadow-normalBias={0.035}
        shadow-bias={-0.0001}
      />
      {/* Two local lights avoid the per-pixel cost and lookup tables of four area lights. */}
      <pointLight
        position={[0, 4.7, 12]}
        intensity={ceiling * 12}
        distance={24}
        decay={2}
        color="#e3edff"
      />
      <pointLight
        position={[0, 3, 1]}
        intensity={windowFill * 15}
        distance={18}
        decay={2}
        color="#8caed5"
      />
      {/* Captured once. Lightformers appear only in reflections, not in space. */}
      <Environment frames={1} resolution={isMobileDevice ? 64 : 128} environmentIntensity={reflections}>
        <Lightformer position={[0, 8, 0]} rotation={[Math.PI / 2, 0, 0]} scale-x={12} scale-y={2} intensity={4} color="#e3edff" />
        <Lightformer position={[0, 1, -10]} scale-x={16} scale-y={7} intensity={2} color="#8caed5" />
        <Lightformer position={[-8, 2, 0]} rotation={[0, Math.PI / 2, 0]} scale-x={10} scale-y={0.5} intensity={1.5} color="#b3caff" />
        <Lightformer position={[8, 2, 0]} rotation={[0, -Math.PI / 2, 0]} scale-x={10} scale-y={0.5} intensity={1} color="#d5ddf0" />
      </Environment>
    </>
  );
}

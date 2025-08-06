import { useState } from "react";
import { AdditiveBlending, Mesh } from "three";
import { degToRad } from "three/src/math/MathUtils.js";
import Lights from "./lights";
import StarrySky from "../vfx-particles/star-sky/starry-sky";
import { Environment, Float, Gltf, Scroll, Stats } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import WawaCoin from "./wawa-models/wawa-coin";
import { useControls } from "leva";
import WawaCard from "./wawa-models/wawa-card";
import {
  Bloom,
  EffectComposer,
  Noise,
  GodRays,
  SelectiveBloom,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
// import GodRays from "./god-rays";

const Experience = () => {
  const [sun, setSun] = useState<Mesh | null>(null);
  const viewport = useThree((state) => state.viewport);

  const transmissionSettings = useControls("Transmission Settings", {
    // https://codesandbox.io/p/sandbox/ju368j?file=%2Fsrc%2FApp.js%3A75%2C8
    backside: false,
    samples: { value: 16, min: 1, max: 32, step: 1 },
    resolution: { value: 128, min: 64, max: 2048, step: 64 },
    transmission: { value: 0.95, min: 0, max: 1 },
    roughness: { value: 0.42, min: 0, max: 1, step: 0.01 },
    clearcoat: { value: 1, min: 0, max: 1, step: 0.01 },
    clearcoatRoughness: { value: 0.1, min: 0, max: 1, step: 0.01 },
    thickness: { value: 0.2, min: 0, max: 200, step: 0.01 },
    backsideThickness: { value: 200, min: 0, max: 200, step: 0.01 },
    ior: { value: 1.25, min: 1, max: 5, step: 0.01 },
    chromaticAberration: { value: 0.25, min: 0, max: 1 },
    anisotropy: { value: 0, min: 0, max: 10, step: 0.01 },
    distortion: { value: 0, min: 0, max: 1, step: 0.01 },
    distortionScale: { value: 0.2, min: 0.01, max: 1, step: 0.01 },
    temporalDistortion: { value: 0, min: 0, max: 1, step: 0.01 },
    attenuationDistance: { value: 0.5, min: 0, max: 10, step: 0.01 },
    attenuationColor: "#ffffff",
    color: "#ffffff",
  });

  return (
    <>
      {sun && <Lights sun={sun} />}
      <StarrySky
        nbParticles={600}
        randomPositionXFirst={25}
        randomPositionXSecond={30}
        randomPositionY={50}
      />
      <Scroll>
        <Float
          position-x={2}
          position-z={5}
          position-y={-viewport.height}
          floatIntensity={3}
          speed={4}
          rotationIntensity={0}
          rotation-x={degToRad(90)}
          rotation-y={degToRad(30)}
        >
          <group scale={1}>
            <WawaCoin transmissionSettings={transmissionSettings} scale={5} />
          </group>
        </Float>
        <Float floatIntensity={3} speed={2} position-y={-viewport.height * 2}>
          <Gltf src="/3d-models/wawa-models/stylized_planet.glb" scale={4} />
        </Float>
        <Float
          floatIntensity={3}
          rotationIntensity={1}
          speed={2}
          position-y={-viewport.height * 2}
        >
          <group scale={1} position-z={5} position-y={1}>
            <WawaCard
              transmissionSettings={transmissionSettings}
              scale={3}
              rotation-x={degToRad(70)}
              rotation-z={degToRad(20)}
            />
          </group>
        </Float>
      </Scroll>
      <Stats />
      <Environment preset="sunset" />
      <mesh position-z={-20} position-y={-25}>
        <sphereGeometry args={[20, 64, 64]} />
        <meshPhysicalMaterial color={"#191929"} iridescence={1.3} />
      </mesh>
      <mesh rotation-x={degToRad(0)} ref={setSun}>
        <circleGeometry args={[55, 64, 64]} />
        <meshBasicMaterial color="#e4c64e" />
      </mesh>

      {sun && (
        <EffectComposer multisampling={8}>
          <Bloom intensity={0.08} luminanceThreshold={1} mipmapBlur />
          <Noise blendFunction={AdditiveBlending} opacity={0.04} />
          <GodRays
            sun={sun}
            exposure={0.5}
            decay={0.84}
            blur
            blendFunction={BlendFunction.ALPHA}
          />
          <SelectiveBloom
            lights={[sun]} // Об'єкти, що будуть світитися
            intensity={1.8}
            luminanceThreshold={0}
            luminanceSmoothing={0.075}
          />
        </EffectComposer>
      )}
    </>
  );
};

export default Experience;

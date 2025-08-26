import { CameraControls, Float, Gltf, Stats } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { useRef } from "react";
import "./index.css";
import Fireworks from "./fireworks";
import VFXParticles from "../vfx-engine/vfxs/vfx-particles";
import { RenderMode } from "@/types/three/vfx-particles.model";
import VFXEmitter from "../vfx-engine/vfxs/vfx-emitter";

const Experience = () => {
  const cameraRef = useRef<CameraControls>(null);
  return (
    <>
      <Stats />
      <CameraControls ref={cameraRef} />
      <directionalLight
        position={[1, 0.5, -10]}
        intensity={2}
        color={"#ffe7ba"}
      />

      <Float
        speed={0.6}
        rotationIntensity={2}
        position-x={4}
        floatIntensity={2}
      >
        <Fireworks />
        <Gltf src={"/3d-models/wawa-models/SkyIsland.glb"} />
      </Float>
      <VFXParticles
        name="fireworks-particles"
        settings={{
          nbParticles: 100000,
          gravity: [0, -9.81, 0],
          renderMode: RenderMode.billboard,
          intensity: 3,
        }}
      />
      <VFXEmitter emitter="fireworks-particles" debug />
      <EffectComposer>
        <Bloom intensity={1.2} luminanceThreshold={1} mipmapBlur />
      </EffectComposer>
    </>
  );
};

export default Experience;

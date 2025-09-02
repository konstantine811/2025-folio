import {
  CameraControls,
  Cloud,
  Clouds,
  Float,
  Gltf,
  Stars,
  Stats,
} from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { useEffect, useRef } from "react";
import "./index.css";
import Fireworks from "./fireworks";
import VFXParticles from "../vfx-engine/vfxs/vfx-particles";
import { RenderMode } from "@/types/three/vfx-particles.model";
import GradientSky from "./gradient-sky";
import { MeshBasicMaterial } from "three";
import { useControls } from "leva";
import useFireworks from "./hooks/useFireworks";

const Experience = () => {
  const cameraRef = useRef<CameraControls>(null);
  const { cloud1Color, cloud2Color, cloud3Color } = useControls("Clouds ☁️", {
    cloud1Color: "#54496c",
    cloud2Color: "orange",
    cloud3Color: "#9d7796",
  });
  // ✅ Тригеримо лише коли з’являється/зникає салют
  const hasFireworks = useFireworks((s) => s.fireworks.length > 0);

  // ✅ Один раз: стартова позиція БЕЗ анімації
  useEffect(() => {
    cameraRef.current?.setLookAt(12, 8, 26, 4, 0, 0, true);
  }, []);

  // ✅ Плавний перехід між двома станами
  useEffect(() => {
    const cam = cameraRef.current;
    if (!cam) return;

    if (hasFireworks) {
      cam.setLookAt(0, 12, 42, 0, 0, 0, true);
    } else {
      cam.setLookAt(12, 8, 26, 4, 0, 0, true);
    }
  }, [hasFireworks]);
  return (
    <>
      <Stats />
      <CameraControls ref={cameraRef} />
      <directionalLight
        position={[1, 0.5, -10]}
        intensity={2}
        color={"#ffe7ba"}
      />
      <Stars fade speed={3} count={2000} />
      <GradientSky />
      <Clouds material={MeshBasicMaterial}>
        <Cloud
          position={[0, -5, 0]}
          seed={2}
          scale={2}
          volume={8}
          fade={1000}
          color={cloud1Color}
        />
        <Cloud
          position-x={12}
          position-z={-10}
          seed={1}
          scale={2}
          volume={6}
          color={cloud2Color}
          fade={800}
        />
        <Cloud
          position-x={-8}
          position-z={10}
          seed={5}
          scale={1}
          volume={12}
          color={cloud3Color}
          fade={100}
        />
      </Clouds>
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

      <EffectComposer>
        <Bloom intensity={1.2} luminanceThreshold={1} mipmapBlur />
      </EffectComposer>
    </>
  );
};

export default Experience;

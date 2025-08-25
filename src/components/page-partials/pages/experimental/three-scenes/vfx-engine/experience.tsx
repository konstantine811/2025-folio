import {
  Environment,
  OrbitControls,
  Stats,
  useTexture,
} from "@react-three/drei";
import VFXParticles from "./vfxs/vfx-particles";
import VFXEmitter from "./vfxs/vfx-emitter";
import { useRef } from "react";
import { Object3D } from "three";
import { useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { RenderMode } from "@/types/three/vfx-particles.model";

const Experience = () => {
  const emittedRed = useRef<Object3D>(null);
  const emittedBlue = useRef<Object3D>(null);
  const alphaMap = useTexture(
    "/images/textures/kenney_particle-pack/png_transparent/symbol_02.png"
  );

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();

    if (emittedRed.current && emittedBlue.current) {
      emittedRed.current.position.x = Math.sin(time * 6) * 1.5;
      emittedRed.current.position.y = Math.cos(time * 3) * 1.5;
      emittedRed.current.position.z = Math.sin(time * 4) * 1.5;

      emittedBlue.current.position.x = Math.cos(time * 6) * 1.5;
      emittedBlue.current.position.y = Math.sin(time * 4) * 2;
      emittedBlue.current.position.z = Math.cos(time * 4) * 1.5;
      emittedBlue.current.rotation.y += 0.01;
    }
  });
  return (
    <>
      <Stats />
      <Environment preset="sunset" />
      <OrbitControls enablePan={false} />
      <VFXParticles
        name="sparks"
        settings={{
          nbParticles: 10000,
          intensity: 1.5,
          renderMode: RenderMode.mesh,
          fadeSize: [0, 1],
          fadeAlpha: [0.5, 0.5],
          gravity: [0, -10, 0],
        }}
        geometry={<capsuleGeometry args={[0.02, 0.2, 1, 8]} />}
      />
      <VFXEmitter
        ref={emittedRed}
        emitter="sparks"
        debug
        settings={{
          nbParticles: 5000,
          colorStart: ["red", "white"],
          size: [0.1, 1],
          startPositionMin: [0, 0, 0],
          startPositionMax: [0, 0, 0],
          directionMin: [-0.5, 0, -0.5],
          directionMax: [0.5, 1, 0.5],
          speed: [1, 5],
          loop: true,
        }}
      />
      <VFXEmitter
        ref={emittedBlue}
        emitter="sparks"
        debug
        settings={{
          nbParticles: 5000,
          colorStart: ["blue", "white"],
          size: [0.1, 1],
          startPositionMin: [0, 0, 0],
          startPositionMax: [0, 0, 0],
          directionMin: [-0.5, 0, -0.5],
          directionMax: [0.5, 1, 0.5],
          speed: [1, 5],
          loop: true,
        }}
      />
      <EffectComposer>
        <Bloom intensity={1.2} luminanceThreshold={1} mipmapBlur />
      </EffectComposer>
    </>
  );
};

export default Experience;

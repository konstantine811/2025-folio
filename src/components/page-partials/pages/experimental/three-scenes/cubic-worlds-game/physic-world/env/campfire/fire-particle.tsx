import { RenderMode } from "@/types/three/vfx-particles.model";
import VFXEmitter from "../../../../vfx-engine/vfxs/vfx-emitter";
import VFXParticles from "../../../../vfx-engine/vfxs/vfx-particles";
import FireSound from "./fire-sound";
import { JSX } from "react";

type Props = JSX.IntrinsicElements["group"] & {
  smokeDirMin?: [number, number, number];
  smokeDirMax?: [number, number, number];
};

const FireParticle = ({
  smokeDirMin = [-0.5, 1, 0.5],
  smokeDirMax = [0.0, 1, 0.0],
  ...props
}: Props) => {
  return (
    <group {...props} dispose={null}>
      <FireSound />
      <VFXParticles
        name="fire"
        settings={{
          nbParticles: 10000,
          intensity: 1.5,
          renderMode: RenderMode.mesh,
          fadeSize: [0, 1],
          fadeAlpha: [0.5, 0.5],
          gravity: [0, 0, 0],
        }}
        geometry={<boxGeometry args={[0.1, 0.1, 0.1]} />}
      />
      <VFXEmitter
        position={[2.5, 0, 1.7]}
        emitter="fire"
        settings={{
          particlesLifetime: [0.1, 0.3],
          nbParticles: 100,

          colorStart: ["#ffc900", "#e30000", "#fc024d"],
          colorEnd: ["#ef0000", "#ff0000", "#f50000"],
          size: [0.1, 1.8],
          startPositionMin: [0, 0, 0],
          startPositionMax: [0, 0, 0],
          directionMin: [-0.3, 1, -0.3],
          directionMax: [0.0, 1, 0.0],
          startRotationMax: [Math.PI, Math.PI, Math.PI],
          startRotationMin: [-Math.PI, -Math.PI, -Math.PI],
          speed: [0.9, 3],
          loop: true,
        }}
      />
      <VFXEmitter
        position={[2.5, 0, 1.7]}
        emitter="fire"
        settings={{
          particlesLifetime: [0, 320.4],
          nbParticles: 300,
          colorStart: ["#696969", "#868484"],
          colorEnd: ["#868686", "#908a8a"],
          size: [0.1, 1.6],
          startPositionMin: [0, 0, 0],
          startPositionMax: [0, 0, 0],
          directionMin: smokeDirMin,
          directionMax: smokeDirMax,
          startRotationMax: [Math.PI, Math.PI, Math.PI],
          startRotationMin: [-Math.PI, -Math.PI, -Math.PI],
          speed: [2, 2.3],
          loop: true,
        }}
      />
    </group>
  );
};

export default FireParticle;

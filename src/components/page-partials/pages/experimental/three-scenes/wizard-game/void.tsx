import { JSX, useEffect, useRef } from "react";
import VFXEmitter from "../vfx-engine/vfxs/vfx-emitter";
import { SpawnMode } from "@/types/three/vfx-particles.model";
import { PositionalAudio } from "@react-three/drei";
import { PositionalAudio as PositionalAudioType } from "three";

type Props = JSX.IntrinsicElements["group"] & {};

const Void = (props: Props) => {
  const blastAudio = useRef<PositionalAudioType>(null);
  const gravityAudio = useRef<PositionalAudioType>(null);

  useEffect(() => {
    setTimeout(() => {
      if (blastAudio.current) {
        blastAudio.current.play();
      }
    }, 1000);
    setTimeout(() => {
      if (gravityAudio.current) {
        gravityAudio.current.play();
      }
    }, 500);
  }, []);
  return (
    <group {...props}>
      {/* SFXs */}
      <PositionalAudio
        url="/sound/wizard-game/buildup.mp3"
        autoplay
        distance={3}
        loop={false}
      />
      <PositionalAudio
        url="/sound/wizard-game/blast.mp3"
        distance={30}
        loop={false}
        ref={blastAudio}
      />
      <PositionalAudio
        url="/sound/wizard-game/gravity.mp3"
        distance={10}
        loop={false}
        ref={gravityAudio}
      />
      {/* Buildup */}
      <VFXEmitter
        emitter="sparks"
        settings={{
          duration: 0.5,
          delay: 0,
          nbParticles: 20,
          spawnMode: SpawnMode.time,
          loop: false,
          startPositionMin: [-0.5, 0, -0.5],
          startPositionMax: [0.5, 1, 0.5],
          startRotationMin: [0, 0, 0],
          startRotationMax: [0, 0, 0],
          particlesLifetime: [0.5, 1],
          speed: [0, 1],
          directionMin: [0, 0, 0],
          directionMax: [0, 0.1, 0],
          rotationSpeedMin: [0, 0, 0],
          rotationSpeedMax: [0, 0, 0],
          colorStart: ["#4902ff"],
          colorEnd: ["#ffffff"],
          size: [0.1, 0.4],
        }}
      />
      <VFXEmitter
        emitter="spheres"
        settings={{
          duration: 0.5,
          delay: 0.5,
          nbParticles: 1,
          spawnMode: SpawnMode.burst,
          loop: false,
          startPositionMin: [0, 0.5, 0],
          startPositionMax: [0, 0.5, 0],
          startRotationMin: [0, 0, 0],
          startRotationMax: [0, 0, 0],
          particlesLifetime: [0.5, 0.5],
          speed: [5, 20],
          directionMin: [0, 0, 0],
          directionMax: [0, 0, 0],
          rotationSpeedMin: [0, 10, 0],
          rotationSpeedMax: [0, 10, 0],
          colorStart: ["#5b18ff"],
          colorEnd: ["#d1beff"],
          size: [0.5, 0.5],
        }}
      />
      <VFXEmitter
        emitter="writings"
        position-y={0.1}
        rotation-x={-Math.PI / 2}
        settings={{
          duration: 1,
          delay: 0,
          nbParticles: 1,
          spawnMode: SpawnMode.burst,
          loop: false,
          startPositionMin: [0, 0, 0],
          startPositionMax: [0, 0, 0],
          startRotationMin: [0, 0, 0],
          startRotationMax: [0, 0, 0],
          particlesLifetime: [1, 1],
          speed: [5, 20],
          directionMin: [0, 0, 0],
          directionMax: [0, 0, 0],
          rotationSpeedMin: [0, 0, 5],
          rotationSpeedMax: [0, 0, 5],
          colorStart: ["#ff9fed", "#e885ff"],
          colorEnd: ["#ffffff", "#ffffff"],
          size: [1, 1],
        }}
      />
      {/* Blost */}
      <VFXEmitter
        emitter="sparks"
        settings={{
          duration: 1,
          delay: 1,
          nbParticles: 300,
          spawnMode: SpawnMode.burst,
          loop: false,
          startPositionMin: [-0.1, -0.1, -0.1],
          startPositionMax: [0.1, 0.1, 0.1],
          startRotationMin: [0, 0, 0],
          startRotationMax: [0, 0, 0],
          particlesLifetime: [0.1, 1],
          speed: [2, 8],
          directionMin: [-1, 0, -1],
          directionMax: [1, 1, 1],
          rotationSpeedMin: [0, 0, 0],
          rotationSpeedMax: [0, 0, 0],
          colorStart: ["#ffffff", "#d1beff"],
          colorEnd: ["#ffffff", "#5b18ff"],
          size: [0.05, 0.1],
        }}
      />
    </group>
  );
};

export default Void;

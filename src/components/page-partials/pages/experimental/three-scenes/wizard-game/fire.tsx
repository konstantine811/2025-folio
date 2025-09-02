import { PositionalAudio } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { JSX, useEffect, useRef } from "react";
import { Object3D, PositionalAudio as PositionalAudioType } from "three";
import VFXEmitter from "../vfx-engine/vfxs/vfx-emitter";
import { SpawnMode } from "@/types/three/vfx-particles.model";

type Props = JSX.IntrinsicElements["group"] & {};

const Fire = ({ ...props }: Props) => {
  const blastAudio = useRef<PositionalAudioType>(null);
  const spellEmitter = useRef<Object3D>(null);
  const time = useRef(0);
  useEffect(() => {
    setTimeout(() => {
      if (blastAudio.current) {
        blastAudio.current.play();
      }
    }, 500);
  }, []);

  useFrame((_, delta) => {
    time.current += delta;
    if (spellEmitter.current) {
      spellEmitter.current.position.y = Math.cos(time.current * Math.PI) * 5;
    }
  });
  return (
    <group {...props}>
      {/* SFXs */}
      <PositionalAudio
        url="/sound/wizard-game/fire.mp3"
        autoplay
        distance={20}
        loop={false}
      />
      <PositionalAudio
        url="/sound/wizard-game/blast.mp3"
        distance={30}
        loop={false}
        ref={blastAudio}
      />
      {/* Buildup  */}
      <VFXEmitter
        emitter="spheres"
        ref={spellEmitter}
        settings={{
          duration: 1,
          delay: 0,
          nbParticles: 100,
          spawnMode: SpawnMode.time,
          loop: false,
          startPositionMin: [0, 0, 0],
          startPositionMax: [0, 0, 0],
          startRotationMin: [0, 0, 0],
          startRotationMax: [0, 0, 0],
          particlesLifetime: [0.1, 0.1],
          speed: [5, 20],
          directionMin: [0, 0, 0],
          directionMax: [0, 0, 0],
          rotationSpeedMin: [0, 0, 0],
          rotationSpeedMax: [0, 0, 0],
          colorStart: ["red", "orange", "yellow"],
          colorEnd: ["red"],
          size: [0.05, 0.2],
        }}
      >
        <VFXEmitter
          emitter="sparks"
          settings={{
            duration: 0.5,
            delay: 0,
            nbParticles: 1000,
            spawnMode: SpawnMode.time,
            loop: false,
            startPositionMin: [-0.1, 0, -0.1],
            startPositionMax: [0.1, 0, 0.1],
            startRotationMin: [0, 0, 0],
            startRotationMax: [0, 0, 0],
            particlesLifetime: [0.5, 1],
            speed: [0.1, 5],
            directionMin: [-1, 1, -1],
            directionMax: [1, 1, 1],
            rotationSpeedMin: [0, 0, 0],
            rotationSpeedMax: [0, 0, 0],
            colorStart: ["red", "orange"],
            colorEnd: ["red", "orange"],
            size: [0.01, 0.1],
          }}
        />
      </VFXEmitter>
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
          particlesLifetime: [0.6, 0.6],
          speed: [5, 20],
          directionMin: [0, 0, 0],
          directionMax: [0, 0, 0],
          rotationSpeedMin: [0, 0, 5],
          rotationSpeedMax: [0, 0, 5],
          colorStart: ["yellow"],
          colorEnd: ["red"],
          size: [1, 1],
        }}
      />
      {/* Blast */}
      <VFXEmitter
        emitter="sparks"
        settings={{
          duration: 1,
          delay: 0.5,
          nbParticles: 1200,
          spawnMode: SpawnMode.burst,
          loop: false,
          startPositionMin: [-0.25, -0.1, -0.25],
          startPositionMax: [0.25, 1, 0.25],
          startRotationMin: [0, 0, 0],
          startRotationMax: [0, 0, 0],
          particlesLifetime: [0.1, 1],
          speed: [1, 3],
          directionMin: [-1, 0, -1],
          directionMax: [1, 5, 1],
          rotationSpeedMin: [0, 0, 0],
          rotationSpeedMax: [0, 0, 0],
          colorStart: ["red", "orange"],
          colorEnd: ["red", "orange"],
          size: [0.01, 0.16],
        }}
      />
    </group>
  );
};

export default Fire;

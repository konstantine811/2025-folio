import { JSX, useEffect, useRef } from "react";
import VFXEmitter from "../vfx-engine/vfxs/vfx-emitter";
import { SpawnMode } from "@/types/three/vfx-particles.model";
import { Object3D } from "three";
import { useFrame } from "@react-three/fiber";
import { degToRad } from "three/src/math/MathUtils.js";
import { PositionalAudio } from "@react-three/drei";
import { PositionalAudio as PositionalAudioType } from "three";

type Props = JSX.IntrinsicElements["group"] & {};
const Ice = ({ ...props }: Props) => {
  const spellEmitter = useRef<Object3D>(null);
  const time = useRef<number>(0);
  const blastAudio = useRef<PositionalAudioType>(null);

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
        url="/sound/wizard-game/freeze.mp3"
        distance={30}
        loop={false}
        ref={blastAudio}
      />
      {/* Buildup */}
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
          rotationSpeedMin: [0, 0, 1],
          rotationSpeedMax: [0, 0, 1],
          colorStart: ["skyblue"],
          colorEnd: ["skyblue"],
          size: [1, 1],
        }}
      />
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
          colorStart: ["white", "skyblue"],
          colorEnd: ["white"],
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
            colorStart: ["white", "skyblue"],
            colorEnd: ["white", "skyblue"],
            size: [0.01, 0.1],
          }}
        />
      </VFXEmitter>
      {/* Blast */}
      <VFXEmitter
        emitter="sparks"
        settings={{
          duration: 0.5,
          delay: 0.5,
          nbParticles: 120,
          spawnMode: SpawnMode.burst,
          loop: false,
          startPositionMin: [-0.5, 0, -0.5],
          startPositionMax: [0.5, 1, 0.5],
          startRotationMin: [0, 0, 0],
          startRotationMax: [0, 0, 0],
          particlesLifetime: [0.1, 1.5],
          speed: [0.5, 2],
          directionMin: [-1, 0, -1],
          directionMax: [1, 1, 1],
          rotationSpeedMin: [0, 0, 0],
          rotationSpeedMax: [0, 0, 0],
          colorStart: ["white", "skyblue"],
          colorEnd: ["white", "skyblue"],
          size: [0.01, 0.1],
        }}
      />
      <VFXEmitter
        emitter="icicle"
        position-y={0.1}
        settings={{
          duration: 1,
          delay: 0.5,
          nbParticles: 5,
          spawnMode: SpawnMode.burst,
          loop: false,
          startPositionMin: [-0.5, 0, -0.5],
          startPositionMax: [0.5, 0, 0.5],
          startRotationMin: [degToRad(180 - 20), 0, degToRad(-30)],
          startRotationMax: [degToRad(180 + 20), 0, degToRad(30)],
          particlesLifetime: [1, 1],
          speed: [5, 20],
          directionMin: [0, 0, 0],
          directionMax: [0, 0, 0],
          rotationSpeedMin: [0, 0, 0],
          rotationSpeedMax: [0, 0, 0],
          colorStart: ["skyblue", "white"],
          colorEnd: ["skyblue", "white"],
          size: [0.5, 1],
        }}
      />
    </group>
  );
};

export default Ice;

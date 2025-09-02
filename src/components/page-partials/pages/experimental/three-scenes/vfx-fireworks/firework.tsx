import { SpawnMode, Triplet } from "@/types/three/vfx-particles.model";
import { useEffect, useRef } from "react";
import { Group } from "three";
import VFXEmitter from "../vfx-engine/vfxs/vfx-emitter";
import { degToRad } from "three/src/math/MathUtils.js";
import { useFrame } from "@react-three/fiber";
import { PositionalAudio } from "@react-three/drei";
import { PositionalAudio as PositionalAudioType } from "three";

const Firework = ({
  velocity,
  delay,
  position,
  color,
}: {
  velocity: Triplet;
  delay: number;
  position: Triplet;
  color: string[];
}) => {
  const ref = useRef<Group>(null);
  const age = useRef(0);
  const audioRef = useRef<PositionalAudioType>(null);

  useEffect(() => {
    setTimeout(() => {
      audioRef.current?.play();
    }, delay * 1000);
  }, [delay]);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.position.x += velocity[0] * delta;
      ref.current.position.y +=
        velocity[1] * delta + age.current * -9.0 * delta;
      ref.current.position.z += velocity[2] * delta;
      age.current += delta;
    }
  });
  return (
    <>
      <group ref={ref} position={position}>
        <VFXEmitter
          emitter="fireworks-particles"
          settings={{
            nbParticles: 5000,
            delay: delay,
            spawnMode: SpawnMode.burst,
            colorStart: color,
            particlesLifetime: [0.1, 2],
            size: [0.01, 0.4],
            startPositionMin: [-0.1, -0.1, -0.1],
            startPositionMax: [0.1, 0.1, 0.1],
            directionMin: [-1, -1, -1],
            directionMax: [1, 1, 1],
            startRotationMin: [degToRad(-90), 0, 0],
            startRotationMax: [degToRad(90), 0, 0],
            rotationSpeedMin: [0, 0, 0],
            rotationSpeedMax: [3, 3, 3],
            speed: [1, 12],
          }}
        />
        <PositionalAudio
          url="/sound/fireworks/firecracker-corsair.mp3"
          ref={audioRef}
          distance={20}
          loop={false}
          autoplay={false}
        />
        <PositionalAudio
          url="/sound/fireworks/firework-whistle.mp3"
          distance={10}
          loop={false}
          autoplay
        />
        <VFXEmitter
          emitter="fireworks-particles"
          settings={{
            duration: delay,
            nbParticles: 100 * delay,
            delay: 0,
            loop: false,
            colorStart: ["white", "skyblue"],
            particlesLifetime: [0.1, 0.6],
            size: [0.01, 0.05],
            startPositionMin: [-0.02, 0, -0.02],
            startPositionMax: [0.02, 0, 0.02],
            startRotationMin: [0, 0, 0],
            startRotationMax: [0, 0, 0],
            rotationSpeedMin: [-12, -12, -12],
            rotationSpeedMax: [12, 12, 12],
            directionMin: [-1, -1, -1],
            directionMax: [1, 1, 1],
            speed: [0, 0.5],
          }}
        />
      </group>
    </>
  );
};

export default Firework;

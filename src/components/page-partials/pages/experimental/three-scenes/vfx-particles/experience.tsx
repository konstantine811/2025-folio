import { Environment, Gltf, OrbitControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { PointLight } from "three";
import StarrySky from "./star-sky/starry-sky";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import SnowFlakes from "./snow-flakes/snow-flakes";

const Experience = () => {
  const pointLightRef = useRef<PointLight>(null);

  useFrame(({ clock }) => {
    if (pointLightRef.current) {
      const time = clock.getElapsedTime();
      pointLightRef.current.position.x = Math.sin(time * 0.8) * 1.5;
    }
  });
  return (
    <>
      <OrbitControls
        minDistance={3}
        maxDistance={12}
        enablePan={false}
        maxPolarAngle={Math.PI / 2}
      />
      <StarrySky />
      <SnowFlakes nbParticles={800} />
      <Environment preset="night" />
      <EffectComposer>
        <Bloom mipmapBlur intensity={1.2} luminanceThreshold={1} />
      </EffectComposer>
      <pointLight
        ref={pointLightRef}
        position={[0, 1, 0.5]}
        intensity={2.5}
        decay={1}
      />
      <Gltf src="/3d-models/snow-land/scene.gltf" scale={0.22} />
      <mesh position-y={[-5.185]}>
        <boxGeometry args={[3.6, 10, 3.6]} />
        <meshStandardMaterial color="white" />
      </mesh>
    </>
  );
};

export default Experience;

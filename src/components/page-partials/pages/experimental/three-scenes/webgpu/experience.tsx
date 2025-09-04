import { Environment, OrbitControls } from "@react-three/drei";
import ParticleNodeMaterial from "./particle-node-material";
import { useControls } from "leva";

const Experience = () => {
  const { colorA, colorB } = useControls({
    colorA: { value: "skyblue" },
    colorB: { value: "blueviolet" },
  });
  return (
    <>
      <directionalLight position={[5, 5, -5]} intensity={0.5} castShadow />
      <Environment preset="sunset" environmentIntensity={0.5} />
      <OrbitControls maxPolarAngle={Math.PI / 2 - 0.1} />
      <mesh rotation-x={-Math.PI / 2}>
        <planeGeometry args={[2, 2, 200, 200]} />
        <ParticleNodeMaterial colorA={colorA} colorB={colorB} />
      </mesh>
    </>
  );
};

export default Experience;

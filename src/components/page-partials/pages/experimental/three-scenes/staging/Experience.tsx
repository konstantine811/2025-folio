import {
  Environment,
  MeshReflectorMaterial,
  OrbitControls,
} from "@react-three/drei";
import { useThemeStore } from "@/storage/themeStore";
import { ThemePalette } from "@/config/theme-colors.config";
import Lights from "./Lights";
import FerrariModel from "./FerrariModel";

const Experience = () => {
  const theme = useThemeStore((s) => s.selectedTheme);
  return (
    <>
      <OrbitControls
        autoRotate
        autoRotateSpeed={0.72}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={0}
        maxDistance={15}
        minDistance={6}
      />
      <ambientLight intensity={0.4} />
      {/* <TeslaModel3
        props={{
          scale: 0.012,
          position: [0, 0, 0.6],
        }}
      /> */}
      <FerrariModel position={[0, -0.76, 0.6]} />
      {/* <Environment>
        <Background />
      </Environment> */}

      <Environment frames={Infinity} resolution={512} blur={0.5}>
        <Lights />
      </Environment>
      {/* Ground */}
      <mesh position={[0, -0.76, 0]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[100, 100]} />
        <MeshReflectorMaterial
          color={ThemePalette[theme].foreground}
          resolution={1024}
          roughness={0.6}
          mixStrength={3}
        />
      </mesh>
    </>
  );
};

export default Experience;

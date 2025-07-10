import { ThemePalette } from "@/config/theme-colors.config";
import { useThemeStore } from "@/storage/themeStore";
import { ContactShadows, Environment, Float } from "@react-three/drei";
import { degToRad } from "three/src/math/MathUtils.js";
import GrowingFlower from "./growing-flower";
import ItemModel from "./item-model";
import { ModelNames } from "./config";

const Hero3D = () => {
  const theme = useThemeStore((state) => state.selectedTheme);
  return (
    <>
      <Float
        rotationIntensity={0.3}
        floatIntensity={0.4}
        rotation-x={degToRad(-15)}
        rotation-y={degToRad(15)}
        scale={0.4}
        position-y={0.12}
      >
        <GrowingFlower growSpeed={0.22}>
          <ItemModel modelName={ModelNames.flower_1} props={{ scale: 0.6 }} />
        </GrowingFlower>
        <GrowingFlower growSpeed={0.24} props={{ position: [0.1, 0, 0.1] }}>
          <ItemModel modelName={ModelNames.flower_2} props={{ scale: 0.5 }} />
        </GrowingFlower>
        <GrowingFlower props={{ position: [-0.1, 0, -0.15] }}>
          <ItemModel modelName={ModelNames.flower_3} props={{ scale: 0.6 }} />
        </GrowingFlower>
        <GrowingFlower growSpeed={0.28} props={{ position: [-0.3, 0, 0.05] }}>
          <ItemModel modelName={ModelNames.flower_4} props={{ scale: 0.6 }} />
        </GrowingFlower>
        <GrowingFlower
          growSpeed={0.26}
          props={{ scale: 0.6, position: [0.3, 0, 0] }}
        >
          <ItemModel modelName={ModelNames.flower_5} />
        </GrowingFlower>
        <ItemModel
          modelName={ModelNames.phone}
          props={{
            rotation: [-degToRad(90), 0, -degToRad(90)],
          }}
        />
      </Float>
      <color attach="background" args={[ThemePalette[theme].background]} />
      <fog attach="fog" args={[ThemePalette[theme].background, 5, 25]} />
      <Environment preset="sunset" />
      <ContactShadows
        position-y={-0.1}
        color={ThemePalette[theme].foreground}
        far={0.8}
      />
    </>
  );
};

export default Hero3D;

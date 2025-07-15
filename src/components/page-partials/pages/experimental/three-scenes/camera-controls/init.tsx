import MainWrapperOffset from "@/components/ui-abc/main-wrapper-offset";
import { ThemePalette } from "@/config/theme-colors.config";
import { useThemeStore } from "@/storage/themeStore";
import { Canvas } from "@react-three/fiber";
import Experience from "./experience";
import { Suspense, useState } from "react";
import ThreeLoader from "../common/three-loader";
import UI from "./ui";

const Init = () => {
  const theme = useThemeStore((s) => s.selectedTheme);
  const [section, setSection] = useState(0);
  return (
    <MainWrapperOffset>
      {/* Прелоадер зверху */}
      <ThreeLoader />
      <Canvas camera={{ position: [0, 0, 3], fov: 30 }}>
        <Suspense fallback={null}>
          <color attach="background" args={[ThemePalette[theme].muted]} />
          <Experience section={section} />
        </Suspense>
      </Canvas>
      <UI
        section={section}
        onSectionChange={(section) => {
          setSection(section);
        }}
      />
    </MainWrapperOffset>
  );
};

export default Init;

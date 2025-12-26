import { Canvas } from "@react-three/fiber";
import Experience from "./Experience";
import { Suspense } from "react";
import MainWrapperOffset from "@/components/ui-abc/main-wrapper-offset";
import { Scroll, ScrollControls } from "@react-three/drei";
import UI from "./ui";
import ThreeLoader from "../common/three-loader";

const ScollParticleMorphing = ({
  children,
  totalPages = 3,
  pathModel = "/3d-models/folio-scene/morphScene.glb",
}: {
  children: React.ReactNode;
  totalPages?: number;
  pathModel?: string;
}) => {
  return (
    <MainWrapperOffset>
      {/* Fixed Canvas Background */}
      <ThreeLoader />
      <Canvas camera={{ position: [0, 10, 85], fov: 70 }}>
        <Suspense fallback={null}>
          <ScrollControls pages={totalPages} damping={0.2}>
            <Experience totalPages={totalPages - 1} pathModel={pathModel} />
            <Scroll html>{children ? children : <UI />}</Scroll>
          </ScrollControls>
        </Suspense>
      </Canvas>

      {/* Scrollable Content */}
    </MainWrapperOffset>
  );
};

export default ScollParticleMorphing;

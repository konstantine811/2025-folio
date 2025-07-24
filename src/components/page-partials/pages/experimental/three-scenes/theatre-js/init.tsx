import MainWrapperOffset from "@/components/ui-abc/main-wrapper-offset";
import ThreeLoader from "../common/three-loader";
import { Suspense, useEffect, useRef, useState } from "react";
import UI from "./ui";
import { Canvas } from "@react-three/fiber";
import { SoftShadows } from "@react-three/drei";
import Experience from "./experience";
import { getProject } from "@theatre/core";
import studio from "@theatre/studio";
import extension from "@theatre/r3f/dist/extension";
import { SheetProvider } from "@theatre/r3f";
import { PerspectiveCamera } from "@theatre/r3f";
import { editable as e } from "@theatre/r3f";
import { Mesh } from "three";
import { Screens, transitions } from "./config";
import animJson from "@config/theatre-js-animations/Medieval Town.theatre-project-state.json";
import { isProd } from "@/utils/check-env";

const project = getProject(
  "Medieval Town",
  isProd ? { state: animJson } : undefined
);
const maintSheet = project.sheet("Main");

if (!isProd) {
  studio.initialize();
  studio.extend(extension);
}

const Init = () => {
  const [currentScreen, setCurrentScreen] = useState<Screens>(Screens.Intro);
  const [targetScreen, setTargetScreen] = useState<Screens>(Screens.Home);
  const cameraTargetRef = useRef<Mesh>(null);
  const isSetup = useRef(false);

  useEffect(() => {
    project.ready.then(() => {
      if (currentScreen === targetScreen) {
        return;
      }
      if (isSetup.current && currentScreen === Screens.Intro) {
        return;
      }
      isSetup.current = true;
      const reverse =
        targetScreen === Screens.Home && currentScreen !== Screens.Intro;
      const transition = transitions[reverse ? currentScreen : targetScreen];
      if (!transition) {
        return;
      }
      maintSheet.sequence
        .play({
          range: transition,
          direction: reverse ? "reverse" : "normal",
          rate: reverse ? 2 : 1,
        })
        .then(() => {
          setCurrentScreen(targetScreen);
        });
    });
  }, [currentScreen, targetScreen]);
  return (
    <MainWrapperOffset>
      <UI
        currentScreen={currentScreen}
        onScreenChange={setTargetScreen}
        isAnimating={currentScreen !== targetScreen}
      />
      <ThreeLoader />
      <Canvas
        camera={{ position: [5, 5, 10], fov: 30, near: 0.1 }}
        shadows
        gl={{ preserveDrawingBuffer: true }}
      >
        <SoftShadows />
        <Suspense fallback={null}>
          <SheetProvider sheet={maintSheet}>
            <PerspectiveCamera
              position={[5, 5, 10]}
              fow={30}
              near={0.1}
              makeDefault
              theatreKey="Camera"
              lookAt={cameraTargetRef}
            />
            <e.mesh
              theatreKey="Camera Target"
              visible="editor"
              ref={cameraTargetRef}
            >
              <octahedronGeometry args={[0.1, 0]} />
              <meshPhongMaterial color="yellow" />
            </e.mesh>
            <Experience />
          </SheetProvider>
        </Suspense>
      </Canvas>
    </MainWrapperOffset>
  );
};

export default Init;

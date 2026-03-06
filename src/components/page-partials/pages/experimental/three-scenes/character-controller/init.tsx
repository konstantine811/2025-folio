import MainWrapperOffset from "@/components/ui-abc/main-wrapper-offset";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import Experience from "./experience";
import ThreeLoader from "../common/three-loader";
import { CameraControls, Environment } from "@react-three/drei";
import InitKeyboardController from "@/components/common/game-controller/init-keyboard";


export default function Init() {
  return (
    <MainWrapperOffset isFullHeight={true}>
        <InitKeyboardController />
        <ThreeLoader />
        <Canvas>
            <Suspense fallback={null}>
                <color attach="background" args={["#131017"]} />
                <Environment preset="sunset" />
                <CameraControls makeDefault />
                <Experience />
            </Suspense>
        </Canvas>
    </MainWrapperOffset>
  );
};
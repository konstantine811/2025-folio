import MainWrapperOffset from "@/components/ui-abc/main-wrapper-offset";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import Experience from "./experience";
import ThreeLoader from "../common/three-loader";
import { CameraControls, Environment } from "@react-three/drei";


export default function Init() {
  return (
    <MainWrapperOffset isFullHeight={true}>
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
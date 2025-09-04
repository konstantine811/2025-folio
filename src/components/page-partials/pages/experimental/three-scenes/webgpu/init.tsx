import { Stats } from "@react-three/drei";
import ThreeLoader from "../common/three-loader";
import { Canvas, extend, Frameloop } from "@react-three/fiber";
import { Suspense, useState } from "react";
import Experience from "./experience";
import MainWrapperOffset from "@/components/ui-abc/main-wrapper-offset";
import {
  MeshBasicNodeMaterial,
  MeshStandardNodeMaterial,
  WebGPURenderer,
} from "three/webgpu";
import { WebGPURendererParameters } from "three/src/renderers/webgpu/WebGPURenderer.js";

extend({
  MeshBasicNodeMaterial: MeshBasicNodeMaterial,
  MeshStandardNodeMaterial: MeshStandardNodeMaterial,
});

const Init = () => {
  const [frameloop, setFrameloop] = useState<Frameloop>("never");
  return (
    <MainWrapperOffset>
      <Stats />
      <ThreeLoader />
      <Canvas
        shadows
        camera={{ position: [3, 3, 3], fov: 30 }}
        frameloop={frameloop}
        gl={(props) => {
          const renderer = new WebGPURenderer({
            ...(props as WebGPURendererParameters),
            powerPreference: "high-performance",
            antialias: true,
            alpha: false,
            stencil: false,
          });
          renderer.init().then(() => {
            setFrameloop("always");
          });
          return renderer;
        }}
      >
        <color attach="background" args={["#333"]} />
        <Suspense fallback={null}>
          <Experience />
        </Suspense>
      </Canvas>
    </MainWrapperOffset>
  );
};

export default Init;

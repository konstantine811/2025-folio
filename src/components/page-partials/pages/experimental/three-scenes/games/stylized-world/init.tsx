import MainWrapperOffset from "@/components/ui-abc/main-wrapper-offset";
import { Stats } from "@react-three/drei";
import { Canvas, extend } from "@react-three/fiber";
import { Suspense, useState } from "react";
import { MeshBasicNodeMaterial, WebGPURenderer } from "three/webgpu";
import { WebGPURendererParameters } from "three/src/renderers/webgpu/WebGPURenderer.js";
import ThreeLoader from "../../common/three-loader";
import { WebGpuPerfPanel, WebGpuPerfTracker } from "../../common/webgpu-perf";
import Experience from "./experience/experience";
import { isDev } from "@/utils/check-env";

extend({ MeshBasicNodeMaterial });

const Init = () => {
  const [gpuReady, setGpuReady] = useState(false);

  return (
    <MainWrapperOffset isFullHeight className="flex min-h-0 flex-1 flex-col">
      <div className="relative min-h-0 flex-1">
        {isDev && <Stats />}
        {isDev && <WebGpuPerfPanel top={56} />}
        <ThreeLoader />
        <Canvas
          className="!absolute inset-0 touch-none"
          style={{ width: "100%", height: "100%" }}
          camera={{ position: [0, 6, 10], fov: 45 }}
          frameloop={gpuReady ? "always" : "never"}
          gl={(props) => {
            const renderer = new WebGPURenderer({
              ...(props as WebGPURendererParameters),
              powerPreference: "high-performance",
              antialias: true,
            });
            renderer.init().then(() => {
              setGpuReady(true);
            });
            return renderer;
          }}
        >
          <color attach="background" args={["#87b5a8"]} />
          {gpuReady && (
            <Suspense fallback={null}>
              {isDev && <WebGpuPerfTracker />}
              <Experience />
            </Suspense>
          )}
        </Canvas>
      </div>
    </MainWrapperOffset>
  );
};

export default Init;

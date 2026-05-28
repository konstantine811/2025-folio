/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import MainWrapperOffset from "@/components/ui-abc/main-wrapper-offset";
import InitKeyboardController from "@/components/common/game-controller/init-keyboard";
import { StatsGl } from "@react-three/drei";
import { Canvas, extend } from "@react-three/fiber";
import { Suspense, useRef, useState } from "react";
import {
  MeshBasicNodeMaterial,
  MeshStandardNodeMaterial,
  WebGPURenderer,
} from "three/webgpu";
import { WebGPURendererParameters } from "three/src/renderers/webgpu/WebGPURenderer.js";
import ThreeLoader from "../../common/three-loader";
import Experience from "./experience/experience";
import { isDev } from "@/utils/check-env";

extend({
  MeshBasicNodeMaterial,
  MeshStandardNodeMaterial,
});

const Init = () => {
  const [gpuReady, setGpuReady] = useState(false);
  const statsParentRef = useRef<HTMLDivElement>(null);

  return (
    <MainWrapperOffset isFullHeight className="flex min-h-0 flex-1 flex-col">
      <InitKeyboardController isIgnorePause />
      <div ref={statsParentRef} className="relative min-h-0 flex-1">
        {!isDev && <ThreeLoader />}
        <Canvas
          className="!absolute inset-0 touch-none"
          style={{ width: "100%", height: "100%" }}
          camera={{ position: [0, 6, 10], fov: 45 }}
          frameloop={gpuReady ? "always" : "never"}
          onPointerDown={(e) => {
            if (e.pointerType === "mouse") {
              const isTerrainEditMode = Boolean(
                (window as Window & { __stylizedTerrainEditMode?: boolean })
                  .__stylizedTerrainEditMode,
              );
              if (!isTerrainEditMode) {
                (e.target as HTMLCanvasElement).requestPointerLock();
              }
            }
          }}
          gl={(props) => {
            const renderer = new WebGPURenderer({
              ...(props as WebGPURendererParameters),
              powerPreference: "high-performance",
              antialias: true,
            });
            renderer
              .init()
              .then(() => setGpuReady(true))
              .catch((err) =>
                console.error("[StylizedWorld] WebGPU init failed:", err),
              );
            return renderer;
          }}
        >
          <color attach="background" args={["#1c1c1c"]} />
          {gpuReady && (
            <Suspense fallback={null}>
              {isDev && (
                <StatsGl
                  parent={statsParentRef}
                  className="pointer-events-auto absolute left-2 top-2 z-50"
                />
              )}
              <Experience />
            </Suspense>
          )}
        </Canvas>
      </div>
    </MainWrapperOffset>
  );
};

export default Init;

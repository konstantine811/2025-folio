import { Canvas } from "@react-three/fiber";
import { Viverse } from "@react-three/viverse";
import { XR, createXRStore } from "@react-three/xr";
import { Scene } from "./scene";
import { Suspense } from "react";

const store = createXRStore({ offerSession: "immersive-vr" });

export default function App() {
  return (
    <Viverse>
      <Canvas
        style={{ position: "absolute", inset: "0", touchAction: "none" }}
        camera={{ fov: 90, position: [0, 2, 2] }}
        shadows
        gl={{ antialias: true, localClippingEnabled: true }}
      >
        <Suspense fallback={null}>
          <XR store={store}>
            <Scene />
          </XR>
        </Suspense>
      </Canvas>
    </Viverse>
  );
}

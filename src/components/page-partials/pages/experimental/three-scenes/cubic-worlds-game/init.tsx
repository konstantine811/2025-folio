import MainWrapperOffset from "@/components/ui-abc/main-wrapper-offset";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import Experience from "./experience";
import InitKeyboardController from "./physic-world/character-controller/init-keyboard";
import { Stats } from "@react-three/drei";
import { Perf } from "r3f-perf";
import "./shaders/gradient-shader";
import { useEditModeStore } from "./store/useEditModeStore";
import UI from "./ui/ui";
import "./preload-data/preload-gltf-model";
import ThreeLoader from "../common/three-loader";
import EditModeInit from "./physic-world/edit-mode/edit-mode-init";
import Pause from "./ui/pause";

const isDev = window.location.hostname === "localhost";

const Init = () => {
  const setPublicUid = useEditModeStore((s) => s.setPublicUid);
  const uid = import.meta.env.VITE_CONSTANTINE_UID;
  setPublicUid(uid);

  return (
    <MainWrapperOffset>
      <InitKeyboardController />
      {isDev && <Stats />}
      {(!uid || isDev) && <UI />}
      {!isDev && <ThreeLoader />}
      <Pause />
      <Canvas shadows camera={{ position: [5, 3, 5], fov: 70 }}>
        <color attach="background" args={["#698FF3"]} />

        {/* <Perf position="bottom-left" /> */}
        <Suspense fallback={null}>
          <Experience />
          <EditModeInit />
          {isDev && (
            <Perf position="bottom-left" showGraph deepAnalyze antialias />
          )}
        </Suspense>
      </Canvas>
    </MainWrapperOffset>
  );
};

export default Init;

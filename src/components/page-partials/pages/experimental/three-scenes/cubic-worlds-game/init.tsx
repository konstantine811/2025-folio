import MainWrapperOffset from "@/components/ui-abc/main-wrapper-offset";
import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useMemo } from "react";
import Experience from "./experience";
import InitKeyboardController from "./physic-world/character-controller/init-keyboard";
import { Stats } from "@react-three/drei";
import "./shaders/gradient-shader";
import { useEditModeStore } from "./store/useEditModeStore";
import UI from "./ui/ui";
import "./preload-data/preload-gltf-model";
import ThreeLoader from "../common/three-loader";
import LockPointer from "./physic-world/edit-mode/lock-pointer";
import Pause from "./ui/pause";
import useEnvSound from "./hooks/useEnvSound";
import useStartSound from "./hooks/startSound";
import ScrollOverlay from "./ui/portfolio-content/scrll-overlay";
import DebugMode from "./debug-mode";
import { usePauseStore } from "./store/usePauseMode";
import { useAuthStore } from "@/storage/useAuthStore";
import useFirebaseLogin from "@/hooks/auth/firebase-login";
import { isDev } from "@/utils/check-env";

type Props = {
  uid: string | null;
  isEditMode?: boolean;
  isGameStarted?: boolean;
};

const Init = ({
  uid = null,
  isEditMode = true,
  isGameStarted = true,
}: Props) => {
  const setPublicUid = useEditModeStore((s) => s.setPublicUid);
  const setIsEditModeEnabled = useEditModeStore((s) => s.setIsEditModeEnabled);
  const setIsGameStarted = usePauseStore((s) => s.setIsGameStarted);
  const { handleLogin } = useFirebaseLogin();

  setPublicUid(uid);
  useEnvSound({ volume: 0.1 });
  useStartSound({});
  const { user, sessionVersion } = useAuthStore();
  // 1) переносимо виклики з рендера в ефекти
  useEffect(() => {
    setPublicUid(uid);
  }, [uid, setPublicUid]);

  useEffect(() => {
    if (!uid && !user) handleLogin();
  }, [uid, user, handleLogin]);

  useEffect(() => {
    setIsEditModeEnabled(isEditMode);
  }, [isEditMode, setIsEditModeEnabled]);

  useEffect(() => {
    setIsGameStarted(isGameStarted);
  }, [isGameStarted, setIsGameStarted]);

  // 2) ключ сесії для форс-ремонта
  const sessionKey = useMemo(
    () => `${user?.uid ?? "guest"}-${sessionVersion ?? 0}`,
    [user?.uid, sessionVersion]
  );
  return (
    <MainWrapperOffset>
      <InitKeyboardController />
      {isDev && <Stats />}
      {isEditMode && <UI />}
      {!isDev && <ThreeLoader />}
      <Pause />
      {!isEditMode && <ScrollOverlay />}
      <Canvas
        shadows
        key={`canvas-${sessionKey}`}
        camera={{
          position: [43.978436079080794, 0.341350839410774, 12.918685681365263],
          fov: 70,
        }}
      >
        <color attach="background" args={["#698FF3"]} />

        <Suspense fallback={null}>
          <Experience />
          <LockPointer />
          <DebugMode />
        </Suspense>
      </Canvas>
    </MainWrapperOffset>
  );
};

export default Init;

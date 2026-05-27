import { useFrame, useThree } from "@react-three/fiber";
import { RefObject, useEffect, useMemo, useRef } from "react";
import { Object3D, Vector3 } from "three";
import { normalizeRange } from "@/utils/math/normalize";
import {
  getSciFiControllerSpawnFromScroll,
  sciFiCharacterConfig,
  sciFiScrollPlacement,
} from "./character/sci-fi.config";

const characterStartZ = sciFiScrollPlacement.startZ;
const walkScrollStart = sciFiCharacterConfig.scroll.walkScrollStart;
const walkScrollEnd = sciFiCharacterConfig.scroll.walkScrollEnd;
const walkDistance = sciFiCharacterConfig.scroll.walkDistance;
const { halfHeight: capsuleHalfHeight, radius: capsuleRadius } =
  sciFiCharacterConfig.controllerCapsule;

const SCROLL_CAM_Y = 1.7;
const SCROLL_CAM_Z_OFFSET = 10.2;
const SCROLL_LOOK_Y = 1.35;
const SCROLL_LOOK_Z_OFFSET = -0.8;

const HANDOFF_DURATION_S = 1.25;
const SCROLL_CAM_LERP = 5;
const CONTROLLER_CAM_INIT_DIS = -5;

const smoothstep = (t: number) => t * t * (3 - 2 * t);

function getScrollCameraTargets(
  scrollProgress: number,
  scrollPos: Vector3,
  scrollLookAt: Vector3,
) {
  const walkProgress = normalizeRange(
    scrollProgress,
    walkScrollStart,
    walkScrollEnd,
  );
  const characterZ = characterStartZ - walkDistance * walkProgress;

  scrollPos.set(0, SCROLL_CAM_Y, characterZ + SCROLL_CAM_Z_OFFSET);
  scrollLookAt.set(0, SCROLL_LOOK_Y, characterZ + SCROLL_LOOK_Z_OFFSET);
}

function applyControllerCameraTargets(
  scrollProgress: number,
  pivotRotationY: number,
  pivot: Object3D,
  followCam: Object3D,
  cameraPos: Vector3,
  lookAt: Vector3,
) {
  const [x, y, z] = getSciFiControllerSpawnFromScroll(scrollProgress);

  lookAt.set(x, y + capsuleHalfHeight + capsuleRadius / 2, z);

  pivot.position.copy(lookAt);
  pivot.rotation.y = pivotRotationY;
  followCam.position.set(0, 0, CONTROLLER_CAM_INIT_DIS);
  followCam.getWorldPosition(cameraPos);
}

type SciFiCameraControllerProps = {
  isPaused: boolean;
  scrollProgressRef: RefObject<number>;
  pivotRotationY: number;
  onHandoffComplete: () => void;
};

export function SciFiCameraController({
  isPaused,
  scrollProgressRef,
  pivotRotationY,
  onHandoffComplete,
}: SciFiCameraControllerProps) {
  const { camera } = useThree();

  const scrollPos = useRef(new Vector3());
  const scrollLookAt = useRef(new Vector3());
  const handoffFromPos = useRef(new Vector3());
  const handoffFromLookAt = useRef(new Vector3());
  const handoffToPos = useRef(new Vector3());
  const handoffToLookAt = useRef(new Vector3());
  const blendedLookAt = useRef(new Vector3());
  const handoffT = useRef(1);
  const wasPausedRef = useRef(isPaused);
  const handoffCompleteRef = useRef(false);
  const pivotHelper = useMemo(() => new Object3D(), []);
  const followCamHelper = useMemo(() => {
    const followCam = new Object3D();
    pivotHelper.add(followCam);
    return followCam;
  }, [pivotHelper]);

  useEffect(() => {
    if (wasPausedRef.current && !isPaused) {
      handoffFromPos.current.copy(scrollPos.current);
      handoffFromLookAt.current.copy(scrollLookAt.current);
      handoffT.current = 0;
      handoffCompleteRef.current = false;
    }
    if (isPaused) {
      handoffT.current = 1;
      handoffCompleteRef.current = false;
    }
    wasPausedRef.current = isPaused;
  }, [isPaused]);

  useFrame((_, delta) => {
    const scrollProgress = scrollProgressRef.current ?? 0;
    getScrollCameraTargets(scrollProgress, scrollPos.current, scrollLookAt.current);

    if (isPaused) {
      camera.position.lerp(
        scrollPos.current,
        1 - Math.exp(-delta * SCROLL_CAM_LERP),
      );
      camera.lookAt(scrollLookAt.current);
      return;
    }

    applyControllerCameraTargets(
      scrollProgress,
      pivotRotationY,
      pivotHelper,
      followCamHelper,
      handoffToPos.current,
      handoffToLookAt.current,
    );

    if (handoffT.current < 1) {
      handoffT.current = Math.min(1, handoffT.current + delta / HANDOFF_DURATION_S);
      const t = smoothstep(handoffT.current);

      camera.position.lerpVectors(handoffFromPos.current, handoffToPos.current, t);
      blendedLookAt.current
        .copy(handoffFromLookAt.current)
        .lerp(handoffToLookAt.current, t);
      camera.lookAt(blendedLookAt.current);

      if (handoffT.current >= 1 && !handoffCompleteRef.current) {
        handoffCompleteRef.current = true;
        onHandoffComplete();
      }
      return;
    }
  });

  return null;
}

import { Html, PerspectiveCamera, useFBO } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import {
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import {
  Color,
  Group,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PerspectiveCamera as ThreePerspectiveCamera,
  SRGBColorSpace,
  Vector3,
} from "three";
import { usePauseStore } from "@/components/common/game-controller/store/usePauseMode";
import { usePlayerPositionStore } from "@/components/page-partials/pages/experimental/three-scenes/character-controller/physics-world/usePlayerPositionStore";
import type { SciFiWorldPhase } from "../sci-fi-world-phase-store";
import { useSciFiWorldPhaseStore } from "../sci-fi-world-phase-store";
import { ShipPortalPreview } from "./ship-portal-preview";
import { StylizedWorldPortalPreview } from "./stylized-world-portal-preview";

/** Isolated layer — portal scene is not drawn by the main sci-fi camera. */
export const PORTAL_PREVIEW_LAYER = 2;

export type PortalDirection = "to-stylized" | "to-ship";

const PORTAL_SCENE_OFFSET: [number, number, number] = [0, -120, 0];
const PORTAL_FBO_SIZE = 512;
const PORTAL_OPEN_MIN = 0.05;
/** Doors open enough to use the portal. */
export const PORTAL_ENTER_MIN_PROGRESS = 0.4;

const PORTAL_PLANE_Z = 0.08;
const PORTAL_WIDTH_FROM_OPEN = 1.5;
const PORTAL_WIDTH_BASE = 0.45;
const PORTAL_PLANE_HEIGHT = 2.15;

const PORTAL_INTERACT_PAD_XZ = 0.35;
const PORTAL_INTERACT_PAD_Y = 0.35;
const PORTAL_DEPTH_PASSED = 0.15;

const PORTAL_LOOK_AT: Record<PortalDirection, [number, number, number]> = {
  "to-stylized": [0, 1, 0],
  "to-ship": [0, 2, 18],
};

function assignLayerRecursive(root: Object3D, layer: number) {
  root.traverse((child) => {
    child.layers.set(layer);
  });
}

type ShipDoorPortalProps = {
  direction: PortalDirection;
  assemblyPosition: [number, number, number];
  assemblyRotation: [number, number, number];
  openProgressRef: RefObject<number>;
  openDistance: number;
  doorPanelsOffsetX: number;
  onNearPortalChange?: (near: boolean) => void;
  registerEnter?: (enter: (() => void) | null) => void;
};

function phaseForDirection(direction: PortalDirection): SciFiWorldPhase {
  return direction === "to-stylized" ? "ship" : "stylized";
}

export function ShipDoorPortal({
  direction,
  assemblyPosition,
  assemblyRotation,
  openProgressRef,
  openDistance,
  doorPanelsOffsetX,
  onNearPortalChange,
  registerEnter,
}: ShipDoorPortalProps) {
  const activePhase = phaseForDirection(direction);
  const worldPhase = useSciFiWorldPhaseStore((s) => s.phase);
  const enterStylizedPhase = useSciFiWorldPhaseStore((s) => s.enterStylizedWorld);
  const returnToShip = useSciFiWorldPhaseStore((s) => s.returnToShip);
  const isPaused = usePauseStore((s) => s.isPaused);
  const playerPosition = usePlayerPositionStore((s) => s.position);

  const { gl, scene, camera: mainCamera } = useThree();
  const portalSceneRef = useRef<Group>(null);
  const portalCamera = useRef<ThreePerspectiveCamera>(null);
  const portalPlaneRef = useRef<Mesh>(null);
  const portalAnchorRef = useRef<Group>(null);
  const enteredRef = useRef(false);
  const nearPortalRef = useRef(false);
  const portalWorldPos = useMemo(() => new Vector3(), []);
  const portalForward = useMemo(() => new Vector3(), []);
  const toPlayer = useMemo(() => new Vector3(), []);

  const portalBgColor = useMemo(
    () => new Color(direction === "to-stylized" ? "#8ecae6" : "#2a2d35"),
    [direction],
  );

  const portalPlaneWidth = useMemo(
    () => Math.max(1.35, openDistance * PORTAL_WIDTH_FROM_OPEN + PORTAL_WIDTH_BASE),
    [openDistance],
  );

  const portalHalfWidth = portalPlaneWidth * 0.5;
  const portalHalfHeight = PORTAL_PLANE_HEIGHT * 0.5;

  const portalTarget = useFBO(PORTAL_FBO_SIZE, PORTAL_FBO_SIZE, {
    samples: 0,
    colorSpace: SRGBColorSpace,
  });

  const [nearPortalEntry, setNearPortalEntry] = useState(false);

  const portalMaterial = useMemo(
    () =>
      new MeshBasicMaterial({
        map: portalTarget.texture,
        toneMapped: false,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    [portalTarget.texture],
  );

  const canUsePortal = useCallback(() => {
    return (openProgressRef.current ?? 0) >= PORTAL_ENTER_MIN_PROGRESS;
  }, [openProgressRef]);

  const enterThroughPortal = useCallback(() => {
    if (enteredRef.current || !canUsePortal() || worldPhase !== activePhase) {
      return;
    }
    enteredRef.current = true;
    if (direction === "to-stylized") {
      enterStylizedPhase();
    } else {
      returnToShip();
    }
  }, [
    activePhase,
    canUsePortal,
    direction,
    enterStylizedPhase,
    returnToShip,
    worldPhase,
  ]);

  useEffect(() => {
    if (worldPhase === activePhase) {
      enteredRef.current = false;
    }
  }, [worldPhase, activePhase]);

  useEffect(() => {
    registerEnter?.(enterThroughPortal);
    return () => registerEnter?.(null);
  }, [enterThroughPortal, registerEnter]);

  useLayoutEffect(() => {
    portalTarget.texture.colorSpace = SRGBColorSpace;
    mainCamera.layers.enable(0);
    mainCamera.layers.disable(PORTAL_PREVIEW_LAYER);

    if (portalSceneRef.current) {
      assignLayerRecursive(portalSceneRef.current, PORTAL_PREVIEW_LAYER);
    }
    if (portalCamera.current) {
      portalCamera.current.layers.disable(0);
      portalCamera.current.layers.enable(PORTAL_PREVIEW_LAYER);
    }
    if (portalPlaneRef.current) {
      portalPlaneRef.current.layers.set(0);
      portalPlaneRef.current.raycast = () => undefined;
    }
  }, [mainCamera, portalTarget.texture]);

  const setNear = useCallback(
    (near: boolean) => {
      if (near === nearPortalRef.current) return;
      nearPortalRef.current = near;
      setNearPortalEntry(near);
      onNearPortalChange?.(near);
    },
    [onNearPortalChange],
  );

  useFrame(({ clock }) => {
    if (worldPhase !== activePhase) {
      setNear(false);
      return;
    }

    const progress = openProgressRef.current ?? 0;
    const plane = portalPlaneRef.current;
    if (plane) {
      plane.visible = progress > PORTAL_OPEN_MIN;
      portalMaterial.opacity = Math.min(
        1,
        Math.max(0, (progress - PORTAL_OPEN_MIN) / 0.3),
      );
      portalMaterial.transparent = portalMaterial.opacity < 0.99;
    }

    const cam = portalCamera.current;
    const portalRoot = portalSceneRef.current;
    const lookAt = PORTAL_LOOK_AT[direction];

    if (cam && portalRoot && progress > PORTAL_OPEN_MIN) {
      const t = clock.elapsedTime * 0.15;
      const orbitR = direction === "to-stylized" ? 28 : 22;
      cam.position.set(
        PORTAL_SCENE_OFFSET[0] + Math.sin(t) * orbitR,
        PORTAL_SCENE_OFFSET[1] + 10,
        PORTAL_SCENE_OFFSET[2] + Math.cos(t) * orbitR + 6,
      );
      cam.lookAt(
        PORTAL_SCENE_OFFSET[0] + lookAt[0],
        PORTAL_SCENE_OFFSET[1] + lookAt[1],
        PORTAL_SCENE_OFFSET[2] + lookAt[2],
      );
      cam.updateMatrixWorld();

      const prevBackground = scene.background;
      const prevTarget = gl.getRenderTarget();
      scene.background = portalBgColor;
      gl.setRenderTarget(portalTarget);
      gl.clear();
      gl.render(scene, cam);
      gl.setRenderTarget(prevTarget);
      scene.background = prevBackground;
      portalTarget.texture.needsUpdate = true;
    }

    const anchor = portalAnchorRef.current;
    if (!anchor || isPaused || !playerPosition) {
      setNear(false);
      return;
    }

    if (!canUsePortal()) {
      setNear(false);
      return;
    }

    anchor.updateMatrixWorld();
    anchor.getWorldPosition(portalWorldPos);

    toPlayer.subVectors(playerPosition, portalWorldPos);
    const distXZ = Math.hypot(toPlayer.x, toPlayer.z);
    const distY = Math.abs(toPlayer.y);

    const halfW = portalHalfWidth + PORTAL_INTERACT_PAD_XZ;
    const halfH = portalHalfHeight + PORTAL_INTERACT_PAD_Y;

    const near = distXZ <= halfW && distY <= halfH;

    anchor.getWorldDirection(portalForward);
    const depth = toPlayer.dot(portalForward);
    const walkedThrough =
      near &&
      (depth >= PORTAL_DEPTH_PASSED ||
        distXZ <= portalHalfWidth * 0.42);

    setNear(near);

    if (walkedThrough) {
      enterThroughPortal();
    }
  });

  const showEnterHint = nearPortalEntry && canUsePortal();
  const hintLabel =
    direction === "to-stylized" ? "Увійти у світ" : "На корабель";

  return (
    <>
      <group
        ref={portalSceneRef}
        position={PORTAL_SCENE_OFFSET}
        name={`ship-door-portal-scene-${direction}`}
      >
        <Suspense fallback={null}>
          {direction === "to-stylized" ? (
            <StylizedWorldPortalPreview />
          ) : (
            <ShipPortalPreview />
          )}
        </Suspense>
      </group>

      <PerspectiveCamera
        ref={portalCamera}
        makeDefault={false}
        fov={48}
        near={0.1}
        far={400}
      />

      <group position={assemblyPosition} rotation={assemblyRotation}>
        <group
          ref={portalAnchorRef}
          position={[doorPanelsOffsetX, portalHalfHeight, PORTAL_PLANE_Z]}
        >
          <mesh ref={portalPlaneRef} visible={false}>
            <planeGeometry args={[portalPlaneWidth, PORTAL_PLANE_HEIGHT]} />
            <primitive object={portalMaterial} attach="material" />
          </mesh>

          {showEnterHint && (
            <Html
              position={[0, portalHalfHeight * 0.35, 0.18]}
              center
              distanceFactor={7}
              wrapperClass="pointer-events-none"
              zIndexRange={[100, 0]}
            >
              <div className="whitespace-nowrap rounded-md border border-emerald-400/30 bg-black/75 px-2.5 py-1.5 text-sm font-medium text-emerald-100 shadow-lg">
                <span className="mr-2 inline-flex h-6 min-w-6 items-center justify-center rounded border border-emerald-400/60 bg-emerald-500/20 px-1.5 font-bold text-emerald-200">
                  E
                </span>
                {hintLabel}
              </div>
            </Html>
          )}
        </group>
      </group>
    </>
  );
}

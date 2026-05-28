import { Html, useGLTF } from "@react-three/drei";
import { useControls } from "leva";
import { useFrame } from "@react-three/fiber";
import {
  interactionGroups,
  RapierRigidBody,
  RigidBody,
} from "@react-three/rapier";
import {
  JSX,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { Group, Mesh, MeshStandardMaterial, Vector3 } from "three";
import { usePauseStore } from "@/components/common/game-controller/store/usePauseMode";
import { Key } from "@/config/key";
import { useRegisterCameraCollisionMeshes } from "@/components/common/hooks/camera/useRegisterCameraCollisionMeshes";
import { usePlayerPositionStore } from "@/components/page-partials/pages/experimental/three-scenes/character-controller/physics-world/usePlayerPositionStore";
import {
  SCIFI_CHARACTER_CONTROLLER_GROUP,
  SCIFI_PROP_COLLIDER_GROUP,
} from "../sci-fi-collision-groups";
import { PORTAL_ENTER_MIN_PROGRESS, ShipDoorPortal } from "./ship-door-portal";

const modelPath = "/3d-models/sci-fi/ship-door.glb";

/** Leva folder (visible with #debug) — how far each door panel slides along local X. */
export const SHIP_DOOR_CONTROLS_PATH = "Sci-fi props / Ship door";

const doorMaterialKey = "04";
const doorAssemblyPosition: [number, number, number] = [0, -0.101, 36.546];
const doorAssemblyRotation: [number, number, number] = [Math.PI, 0, Math.PI];

const frameRightLocalX = -0.022;
const frameLeftLocalX = 0;
/** Closed-state shift (+X in door assembly) — aligns panels with frame opening. */
const defaultDoorPanelsOffsetX = 0.02;

const frameColliderPosition: [number, number, number] = [
  0.0139617919921875, 2.8340907096862793, 36.289939880371094,
];
const frameColliderScale = 0.3830612897872925;

const doorRightColliderPosition: [number, number, number] = [
  -0.7432982325553894, -0.10104800015687943, 36.51607131958008,
];
const doorRightColliderScale: [number, number, number] = [
  0.7626287937164307, 0.6459335088729858, 0.11735648661851883,
];
const doorLeftColliderPosition: [number, number, number] = [
  0.7432982325553894, -0.10104800015687943, 36.51607131958008,
];
const doorLeftColliderScale: [number, number, number] = [
  -doorRightColliderScale[0],
  doorRightColliderScale[1],
  doorRightColliderScale[2],
];

const DOOR_COLLIDER_OFF_PROGRESS = 0.92;

const camWall = { camIncludeCollision: true } as const;

const propCollisionGroups = interactionGroups(SCIFI_PROP_COLLIDER_GROUP, [
  SCIFI_CHARACTER_CONTROLLER_GROUP,
  0,
]);

function createOpaqueDoorMaterial(source: MeshStandardMaterial) {
  const material = source.clone();
  material.transparent = false;
  material.opacity = 1;
  material.depthWrite = true;
  material.alphaTest = 0.5;
  return material;
}

function getMesh(nodes: Record<string, unknown>, name: string): Mesh {
  const mesh = nodes[name] as Mesh;
  if (!mesh?.isMesh || !mesh.geometry) {
    throw new Error(
      `Ship door mesh "${name}" not found. Available: ${Object.keys(nodes).join(", ")}`,
    );
  }
  return mesh;
}

type KinematicDoorColliderProps = {
  bodyRef: RefObject<RapierRigidBody | null>;
  colliderGeometry: Mesh["geometry"];
  closedPosition: [number, number, number];
  colliderScale: [number, number, number];
  collidersEnabled: boolean;
};

/** Invisible proxy collider mesh — transform synced from useFrame. */
function KinematicDoorCollider({
  bodyRef,
  colliderGeometry,
  closedPosition,
  colliderScale,
  collidersEnabled,
}: KinematicDoorColliderProps) {
  return (
    <RigidBody
      ref={bodyRef}
      type="kinematicPosition"
      colliders={collidersEnabled ? "trimesh" : false}
      includeInvisible
      position={closedPosition}
      friction={0.9}
      collisionGroups={propCollisionGroups}
    >
      <mesh
        geometry={colliderGeometry}
        scale={colliderScale}
        material-visible={false}
      />
    </RigidBody>
  );
}

export function ShipDoor(props: JSX.IntrinsicElements["group"]) {
  const rootRef = useRef<Group>(null);
  const assemblyRef = useRef<Group>(null);
  /** E prompt + proximity anchor (local to door assembly, on the PC). */
  const pcInteractRef = useRef<Group>(null);
  const frameRightRef = useRef<Mesh>(null);
  const frameLeftRef = useRef<Mesh>(null);
  const rightDoorBodyRef = useRef<RapierRigidBody>(null);
  const leftDoorBodyRef = useRef<RapierRigidBody>(null);
  const openProgressRef = useRef(0);
  const nearPanelRef = useRef(false);
  const nearPortalRef = useRef(false);
  const enterPortalRef = useRef<(() => void) | null>(null);
  const panelWorldPos = useMemo(() => new Vector3(), []);
  const slideOrigin = useMemo(() => new Vector3(), []);
  const slideTip = useMemo(() => new Vector3(), []);
  const worldSlide = useMemo(() => new Vector3(), []);
  const worldPanelOffset = useMemo(() => new Vector3(), []);

  const { nodes, materials } = useGLTF(modelPath);
  const material = useMemo(
    () =>
      createOpaqueDoorMaterial(
        materials[doorMaterialKey] as MeshStandardMaterial,
      ),
    [materials],
  );

  const frameMesh = getMesh(nodes, "frame");
  const frameLeftMesh = getMesh(nodes, "frame_left");
  const frameRightMesh = getMesh(nodes, "frame_right");
  const pcMesh = getMesh(nodes, "pc");
  const frameColliderMesh = getMesh(nodes, "frame_collider");
  const doorColliderMesh = getMesh(nodes, "door_right_collider");

  const {
    openDistance,
    openSpeed,
    doorPanelsOffsetX,
    promptPositionX,
    promptPositionY,
    promptPositionZ,
    pcInteractRadiusXZ,
    pcInteractRadiusY,
  } = useControls(SHIP_DOOR_CONTROLS_PATH, {
    openDistance: {
      value: 1.47,
      min: 0,
      max: 2.5,
      step: 0.01,
      label: "Open distance (each side)",
    },
    openSpeed: {
      value: 2,
      min: 0.5,
      max: 25,
      step: 0.5,
      label: "Open speed",
    },
    doorPanelsOffsetX: {
      value: defaultDoorPanelsOffsetX,
      min: -0.15,
      max: 0.15,
      step: 0.005,
      label: "Door panels offset X (right)",
    },
    promptPositionX: {
      value: 2.27,
      min: -5,
      max: 5,
      step: 0.01,
      label: "E prompt X (on PC)",
    },
    promptPositionY: {
      value: 1.78,
      min: -2,
      max: 3,
      step: 0.01,
      label: "E prompt Y",
    },
    promptPositionZ: {
      value: 0.83,
      min: -3,
      max: 3,
      step: 0.01,
      label: "E prompt Z",
    },
    pcInteractRadiusXZ: {
      value: 1.4,
      min: 0.2,
      max: 3,
      step: 0.05,
      label: "PC interact radius (XZ)",
    },
    pcInteractRadiusY: {
      value: 1.75,
      min: 0.2,
      max: 3,
      step: 0.05,
      label: "PC interact radius (Y)",
    },
  });

  const isPaused = usePauseStore((s) => s.isPaused);
  const playerPosition = usePlayerPositionStore((s) => s.position);

  const [nearPanel, setNearPanel] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [doorsBlockPhysics, setDoorsBlockPhysics] = useState(true);

  useRegisterCameraCollisionMeshes(rootRef, [nodes]);

  const applyDoorSlide = (progress: number, distance: number) => {
    const slide = distance * progress;
    const panelX = doorPanelsOffsetX;

    if (frameRightRef.current) {
      frameRightRef.current.position.x = frameRightLocalX + panelX + slide;
    }
    if (frameLeftRef.current) {
      frameLeftRef.current.position.x = frameLeftLocalX + panelX - slide;
    }

    const assembly = assemblyRef.current;
    if (!assembly) return;

    slideOrigin.set(0, 0, 0);
    slideTip.set(panelX, 0, 0);
    assembly.localToWorld(slideOrigin);
    assembly.localToWorld(slideTip);
    worldPanelOffset.subVectors(slideTip, slideOrigin);

    slideOrigin.set(0, 0, 0);
    slideTip.set(slide, 0, 0);
    assembly.localToWorld(slideOrigin);
    assembly.localToWorld(slideTip);
    worldSlide.subVectors(slideTip, slideOrigin);

    const rightBody = rightDoorBodyRef.current;
    if (rightBody) {
      rightBody.setNextKinematicTranslation({
        x: doorRightColliderPosition[0] + worldPanelOffset.x + worldSlide.x,
        y: doorRightColliderPosition[1] + worldPanelOffset.y + worldSlide.y,
        z: doorRightColliderPosition[2] + worldPanelOffset.z + worldSlide.z,
      });
    }

    const leftBody = leftDoorBodyRef.current;
    if (leftBody) {
      leftBody.setNextKinematicTranslation({
        x: doorLeftColliderPosition[0] + worldPanelOffset.x - worldSlide.x,
        y: doorLeftColliderPosition[1] + worldPanelOffset.y - worldSlide.y,
        z: doorLeftColliderPosition[2] + worldPanelOffset.z - worldSlide.z,
      });
    }
  };

  useFrame((_, delta) => {
    const target = isOpen ? 1 : 0;
    openProgressRef.current +=
      (target - openProgressRef.current) * Math.min(1, openSpeed * delta);

    const progress = openProgressRef.current;
    applyDoorSlide(progress, openDistance);

    const shouldBlock = progress < DOOR_COLLIDER_OFF_PROGRESS;
    if (shouldBlock !== doorsBlockPhysics) {
      setDoorsBlockPhysics(shouldBlock);
    }

    const interact = pcInteractRef.current;
    if (!isPaused && playerPosition && interact) {
      interact.getWorldPosition(panelWorldPos);
      const dx = playerPosition.x - panelWorldPos.x;
      const dy = playerPosition.y - panelWorldPos.y;
      const dz = playerPosition.z - panelWorldPos.z;
      const near =
        Math.hypot(dx, dz) <= pcInteractRadiusXZ &&
        Math.abs(dy) <= pcInteractRadiusY;
      if (near !== nearPanelRef.current) {
        nearPanelRef.current = near;
        setNearPanel(near);
      }
    } else if (nearPanelRef.current) {
      nearPanelRef.current = false;
      setNearPanel(false);
    }
  });

  const handleDoorToggle = useCallback(() => {
    if (isPaused) return;

    // PC prompt uses nearPanel state; E must read the same ref updated in useFrame.
    if (nearPanelRef.current) {
      setIsOpen((open) => !open);
      return;
    }

    if (
      nearPortalRef.current &&
      (openProgressRef.current ?? 0) >= PORTAL_ENTER_MIN_PROGRESS &&
      enterPortalRef.current
    ) {
      enterPortalRef.current();
    }
  }, [isPaused]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== Key.E) return;
      handleDoorToggle();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleDoorToggle]);

  const showPrompt = !isPaused && nearPanel;
  const doorActionLabel = isOpen ? "закрити двері" : "відкрити двері";

  return (
    <group {...props} ref={rootRef} dispose={null}>
      <group
        ref={assemblyRef}
        position={doorAssemblyPosition}
        rotation={doorAssemblyRotation}
      >
        <mesh
          castShadow
          receiveShadow
          geometry={frameMesh.geometry}
          material={material}
          userData={camWall}
        />
        <mesh
          ref={frameLeftRef}
          castShadow
          receiveShadow
          geometry={frameLeftMesh.geometry}
          material={material}
          position={[frameLeftLocalX + defaultDoorPanelsOffsetX, 0, 0]}
          userData={camWall}
          scale={1.01}
        />
        <mesh
          ref={frameRightRef}
          castShadow
          receiveShadow
          geometry={frameRightMesh.geometry}
          material={material}
          position={[frameRightLocalX + defaultDoorPanelsOffsetX, 0, 0]}
          userData={camWall}
          scale={1.01}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={pcMesh.geometry}
          material={material}
        />
        <group
          ref={pcInteractRef}
          position={[promptPositionX, promptPositionY, promptPositionZ]}
        >
          {showPrompt && (
            <Html
              center
              distanceFactor={7}
              wrapperClass="pointer-events-none"
              zIndexRange={[100, 0]}
            >
              <div className="whitespace-nowrap rounded-md border border-white/15 bg-black/75 px-2.5 py-1.5 text-sm font-medium text-white shadow-lg backdrop-blur-sm">
                <span className="mr-2 inline-flex h-6 min-w-6 items-center justify-center rounded border border-sky-400/60 bg-sky-500/20 px-1.5 font-bold text-sky-200">
                  E
                </span>
                {doorActionLabel}
              </div>
            </Html>
          )}
        </group>
      </group>

      <RigidBody
        type="fixed"
        colliders="trimesh"
        includeInvisible
        friction={0.9}
        position={frameColliderPosition}
        collisionGroups={propCollisionGroups}
      >
        <mesh
          geometry={frameColliderMesh.geometry}
          scale={frameColliderScale}
          material-visible={false}
        />
      </RigidBody>

      <KinematicDoorCollider
        bodyRef={rightDoorBodyRef}
        colliderGeometry={doorColliderMesh.geometry}
        closedPosition={doorRightColliderPosition}
        colliderScale={doorRightColliderScale}
        collidersEnabled={doorsBlockPhysics}
      />
      <KinematicDoorCollider
        bodyRef={leftDoorBodyRef}
        colliderGeometry={doorColliderMesh.geometry}
        closedPosition={doorLeftColliderPosition}
        colliderScale={doorLeftColliderScale}
        collidersEnabled={doorsBlockPhysics}
      />

      <ShipDoorPortal
        assemblyPosition={doorAssemblyPosition}
        assemblyRotation={doorAssemblyRotation}
        openProgressRef={openProgressRef}
        openDistance={openDistance}
        doorPanelsOffsetX={doorPanelsOffsetX}
        onNearPortalChange={(near) => {
          nearPortalRef.current = near;
        }}
        registerEnter={(enter) => {
          enterPortalRef.current = enter;
        }}
      />
    </group>
  );
}

useGLTF.preload(modelPath);

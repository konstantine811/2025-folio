import { useGLTF } from "@react-three/drei";
import { createPortal, useFrame } from "@react-three/fiber";
import { RefObject, useEffect, useMemo, useRef } from "react";
import { BackSide, Group, Material, Mesh, Vector3 } from "three";
import { sciFiCinematicDuration } from "./sci-fi-intro.config";

// Quintic easing has zero velocity and acceleration at both ends.
// One continuous camera move avoids braking at every intermediate waypoint.
const smooth = (t: number) => {
  const x = Math.max(0, Math.min(1, t));
  return x * x * x * (x * (x * 6 - 15) + 10);
};

const cameraStart = new Vector3(0, 1.7, 95);
const cameraEnd = new Vector3(0, 1.7, 24.021);
const lookStart = new Vector3(0, 1.7, -180);
const lookEnd = new Vector3(0, 1.35, 13.021);
const arrivalStart = 2;
const arrivalEnd = 10;
const cameraMoveStart = 8;
const rearHatchZ = 36.546;
// Only surfaces needed from outside. In particular, do not duplicate the
// 61k-triangle interior support mesh or the fixtures already in the room.
const exteriorMeshNames = new Set([
  "ship_husk", "ship_top", "ship_floor", "window_frame", "ship_wall_back",
]);

type Props = {
  running: boolean;
  timeRef: RefObject<number>;
  room: Group;
  doorOpenRef: RefObject<boolean>;
  onComplete: () => void;
};

export function SciFiCinematic({ running, timeRef, room, doorOpenRef, onComplete }: Props) {
  const ship = useRef<Group>(null);
  const completed = useRef(false);
  const flightOffset = useMemo(() => new Vector3(0, 8, 150), []);
  const look = useMemo(() => new Vector3(), []);
  const { scene } = useGLTF("/3d-models/sci-fi/ship-container.glb");
  const back = useGLTF("/3d-models/sci-fi/ship-container_back.glb");
  const { exterior, ownedMaterials } = useMemo(() => {
    const exterior = new Group();
    const ownedMaterials: Material[] = [];
    // Draw back faces only: the original room supplies its interior faces.
    const addShell = (source: Group, backWall = false) => {
      const copy = source.clone(true);
      copy.traverse((node) => {
        if (!(node instanceof Mesh)) return;
        if (!exteriorMeshNames.has(node.name)) { node.visible = false; return; }
        const clone = (material: Material) => {
          const next = material.clone();
          next.side = BackSide;
          ownedMaterials.push(next);
          return next;
        };
        node.material = Array.isArray(node.material) ? node.material.map(clone) : clone(node.material);
        node.castShadow = false;
        node.receiveShadow = false;
      });
      if (backWall) copy.position.z -= 0.156;
      exterior.add(copy);
    };
    addShell(scene);
    addShell(back.scene, true);
    return { exterior, ownedMaterials };
  }, [scene, back.scene]);

  useEffect(() => () => ownedMaterials.forEach((material) => material.dispose()), [ownedMaterials]);
  useEffect(() => () => {
    room.position.set(0, 0, 0);
    room.updateMatrixWorld(true);
    doorOpenRef.current = false;
  }, [room, doorOpenRef]);

  // Physics and Verlet ropes simulate in the room's original coordinates.
  // Reset before simulation, then move the COMPLETE rendered assembly just
  // before EffectComposer (priority 1). No rigid bodies are teleported.
  useFrame(() => {
    if (room.position.lengthSq() === 0) return;
    room.position.set(0, 0, 0);
    // Update the parent only. World-space queries refresh their own branches;
    // the renderer updates descendants once before drawing, as usual.
    room.updateWorldMatrix(false, false);
  }, -1000);

  useFrame(() => {
    if (completed.current || flightOffset.lengthSq() === 0) return;
    room.position.copy(flightOffset);
    room.updateWorldMatrix(false, false);
  }, 0.5);

  useFrame(({ camera }, delta) => {
    if (running && !completed.current && document.visibilityState !== "hidden") {
      timeRef.current = Math.min(sciFiCinematicDuration, timeRef.current + Math.min(delta, 0.1));
    }
    const time = timeRef.current;
    const cameraProgress = smooth(
      (time - cameraMoveStart) / (sciFiCinematicDuration - cameraMoveStart),
    );
    camera.position.lerpVectors(cameraStart, cameraEnd, cameraProgress);
    // A continuous shallow arc clears the portal hall's central projector.
    camera.position.x += 1.6 * Math.sin(Math.PI * cameraProgress) * smooth((time - 10) / 2);
    look.lerpVectors(lookStart, lookEnd, cameraProgress);
    camera.lookAt(look);

    const arrival = smooth((time - arrivalStart) / (arrivalEnd - arrivalStart));
    if (ship.current) {
      // The bow starts BEHIND the camera, flies overhead along -Z, then settles
      // into the playable room's exact coordinates. No lateral movement.
      ship.current.visible = time >= arrivalStart && camera.position.z > rearHatchZ - 0.5;
      ship.current.position.set(0, 0, 0);
    }
    // The longer aft deck must clear the camera before the ship descends.
    flightOffset.set(0, 8 * (1 - smooth((arrival - 0.86) / 0.14)), 150 * (1 - arrival));
    doorOpenRef.current = time >= 12;
    if (time >= sciFiCinematicDuration && !completed.current) {
      completed.current = true;
      onComplete();
    }
  });

  return createPortal(
    <group ref={ship} visible={false} dispose={null}>
      <primitive object={exterior} />
      {[-4.8, 4.8].map((x) => (
        <group key={x} position={[x, 1.6, 36.8]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh>
            <cylinderGeometry args={[0.65, 0.7, 1.8, 12]} />
            <meshStandardMaterial color="#273140" metalness={0.8} roughness={0.4} />
          </mesh>
          <mesh position={[0, -1, 0]}>
            <sphereGeometry args={[0.48, 12, 8]} />
            <meshBasicMaterial color={[0.2, 2, 5]} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>,
    room,
  );
}

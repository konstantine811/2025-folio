import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Group, MathUtils, PerspectiveCamera, Vector3 } from "three";
import { sampleLaptopCameraPath } from "./laptop-camera-path";
import { CodePanel, CodePanelProps } from "./code/code-panel";

type Props = { open: boolean; editor: CodePanelProps; onCameraReleased: () => void };

export function CharacterLaptop({ open, editor, onCameraReleased }: Props) {
  const anchor = useRef<Group>(null);
  const laptop = useRef<Group>(null);
  const flight = useRef({ active: false, progress: 0 });
  const lid = useRef<Group>(null);
  const screen = useRef<Group>(null);
  const progress = useRef(0);
  const vectors = useMemo(() => ({
    stowed: new Vector3(0, 1.25, -0.4), held: new Vector3(0, 1.1, 1.65),
    start: new Vector3(), initialLook: new Vector3(), localEnd: new Vector3(), localTarget: new Vector3(), path: new Vector3(),
    look: new Vector3(),
  }), []);
  useFrame(({ camera, size }, delta) => {
    if (!anchor.current || !laptop.current || !lid.current || !screen.current) return;
    const blend = 1 - Math.exp(-8 * Math.min(delta, 0.1));
    progress.current = MathUtils.lerp(progress.current, open ? 1 : 0, blend);
    const t = progress.current;
    laptop.current.position.lerpVectors(vectors.stowed, vectors.held, t);
    laptop.current.scale.setScalar(MathUtils.lerp(0.34, 1, t));
    laptop.current.rotation.x = MathUtils.lerp(Math.PI / 2, 0, t);
    lid.current.rotation.x = MathUtils.lerp(-Math.PI / 2, 0.06, t);
    const route = flight.current;
    if (open && !route.active) {
      route.active = true;
      route.progress = 0;
      anchor.current.updateWorldMatrix(true, false);
      vectors.start.copy(camera.position);
      anchor.current.worldToLocal(vectors.start);
      camera.getWorldDirection(vectors.initialLook).multiplyScalar(4).add(camera.position);
      anchor.current.worldToLocal(vectors.initialLook);
    }
    if (!route.active) return;
    route.progress = MathUtils.clamp(route.progress + (open ? 1 : -1) * Math.min(delta, 0.1) / 1.25, 0, 1);
    if (open) {
      // Use the fully opened screen pose, not the moving lid, as the destination.
      vectors.localTarget.set(0, 1.135 + 0.6 * Math.cos(0.06) + 0.035 * Math.sin(0.06), 2.03 + 0.6 * Math.sin(0.06) - 0.035 * Math.cos(0.06));
      const fov = camera instanceof PerspectiveCamera ? camera.fov : 55;
      const distance = Math.max(1.16, 1.82 / (size.width / size.height)) / (2 * Math.tan(MathUtils.degToRad(fov / 2))) * 1.22;
      // Keep the camera in front of the torso even on narrow viewports.
      vectors.localEnd.set(0, vectors.localTarget.y + 0.04, Math.max(0.65, vectors.localTarget.z - distance));
    }
    sampleLaptopCameraPath(vectors.start, vectors.localEnd, route.progress, vectors.path);
    anchor.current.localToWorld(vectors.path);
    camera.position.copy(vectors.path);
    vectors.look.lerpVectors(vectors.initialLook, vectors.localTarget, MathUtils.smootherstep(route.progress, 0, 1));
    anchor.current.localToWorld(vectors.look);
    camera.lookAt(vectors.look);
    if (!open && route.progress === 0) {
      route.active = false;
      onCameraReleased();
    }
  });

  return <group ref={anchor} userData={{ camExcludeCollision: true }}>
    <group position={[0, 1.35, -0.32]}>
      <mesh castShadow><boxGeometry args={[0.7, 0.9, 0.3]} /><meshStandardMaterial color="#243f43" roughness={0.8} /></mesh>
      <mesh position={[0, -0.1, -0.17]}><boxGeometry args={[0.5, 0.4, 0.07]} /><meshStandardMaterial color="#385b5b" /></mesh>
      <mesh position={[0, 0.19, -0.19]}><boxGeometry args={[0.16, 0.04, 0.02]} /><meshStandardMaterial color="#7ce4bd" emissive="#7ce4bd" emissiveIntensity={0.5} /></mesh>
    </group>
    <group ref={laptop} position={[0, 1.25, -0.4]} scale={0.34} rotation={[Math.PI / 2, 0, 0]}>
      <mesh castShadow><boxGeometry args={[1.92, 0.065, 0.82]} /><meshStandardMaterial color="#27383f" metalness={0.65} roughness={0.35} /></mesh>
      <mesh position={[0, 0.038, 0.05]}><boxGeometry args={[1.65, 0.01, 0.38]} /><meshStandardMaterial color="#10191e" /></mesh>
      {Array.from({ length: 4 }, (_, row) => <mesh key={row} position={[0, 0.048, -0.08 + row * 0.085]}>
        <boxGeometry args={[1.62, 0.008, 0.065]} /><meshStandardMaterial color="#547079" />
      </mesh>)}
      <mesh position={[0, 0.04, -0.28]}><boxGeometry args={[0.5, 0.012, 0.18]} /><meshStandardMaterial color="#40555e" /></mesh>
      <group ref={lid} position={[0, 0.035, 0.38]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh position={[0, 0.6, 0]} castShadow><boxGeometry args={[1.92, 1.22, 0.06]} /><meshStandardMaterial color="#27383f" metalness={0.6} roughness={0.3} /></mesh>
        <group ref={screen} position={[0, 0.6, -0.035]} rotation={[0, Math.PI, 0]}>
          <mesh><planeGeometry args={[1.82, 1.16]} /><meshBasicMaterial color="#111b23" /></mesh>
          {open && <Html transform distanceFactor={0.75} position={[0, 0, 0.008]} zIndexRange={[30, 20]} style={{ pointerEvents: "auto" }}>
            <div style={{ width: 960, height: 608 }} onPointerDown={e => e.stopPropagation()} onWheel={e => e.stopPropagation()}>
              <CodePanel {...editor} embedded />
            </div>
          </Html>}
        </group>
      </group>
    </group>
  </group>;
}

import { Html, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { RefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CanvasTexture, Color, DoubleSide, ExtrudeGeometry, Group, MeshBasicMaterial,
  MeshStandardMaterial, Path, Shape, ShapeGeometry, SRGBColorSpace,
} from "three";
import { usePauseStore } from "@/components/common/game-controller/store/usePauseMode";
import { usePlayerPositionStore } from "../../../character-controller/physics-world/usePlayerPositionStore";
import { useRegisterCameraCollisionMeshes } from "@/components/common/hooks/camera/useRegisterCameraCollisionMeshes";
import { PortalGate } from "./portal-gate";
import { portalDeckLayout as layout, portalDeckWalls, portalDeckFloors, Vec3, shipPortals } from "./portal-deck.config";


function octagon(width: number, height: number, cut = 0.45) {
  return [
    [-width + cut, -height], [width - cut, -height], [width, -height + cut], [width, height - cut],
    [width - cut, height], [-width + cut, height], [-width, height - cut], [-width, -height + cut],
  ];
}
function trace<T extends Path>(path: T, points: number[][]): T {
  path.moveTo(points[0][0], points[0][1]);
  points.slice(1).forEach(([x, y]) => path.lineTo(x, y));
  path.closePath();
  return path;
}
function ring(outerW: number, outerH: number, innerW: number, innerH: number) {
  const shape = trace(new Shape(), octagon(outerW, outerH));
  shape.holes.push(trace(new Path(), octagon(innerW, innerH).reverse()));
  return shape;
}
function labelTexture(title: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 512; canvas.height = 96;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Portal labels require canvas");
  ctx.fillStyle = "#d4e8ff"; ctx.font = "500 27px monospace"; ctx.textAlign = "center";
  ctx.fillText(title, 256, 44);
  ctx.fillStyle = "#8c9bb7"; ctx.font = "15px monospace";
  ctx.fillText("PROJECT GATEWAY / APPROACH TO CONNECT", 256, 78);
  const texture = new CanvasTexture(canvas); texture.colorSpace = SRGBColorSpace;
  return texture;
}

/** Walkable extension with seven inexpensive textured gateways, not seven scene renders. */
export function PortalDeck({ cinematicOpenRef, cinematic }: { cinematicOpenRef: RefObject<boolean>; cinematic: boolean }) {
  const root = useRef<Group>(null);
  const core = useRef<Group>(null);
  const nearbyRef = useRef<number | null>(null);
  const [nearby, setNearby] = useState<number | null>(null);
  const sources = useTexture(shipPortals.map((portal) => `/images/sci-fi-portals/${portal.scene}.jpg`));
  const resources = useMemo(() => {
    const frame = new ExtrudeGeometry(ring(1.8, 2.3, 1.45, 1.95), { depth: 0.32, bevelEnabled: false });
    const edge = new ShapeGeometry(ring(1.51, 2.01, 1.46, 1.96));
    const screen = new ShapeGeometry(trace(new Shape(), octagon(1.45, 1.95)));
    const positions = screen.getAttribute("position"), uv = screen.getAttribute("uv");
    for (let i = 0; i < positions.count; i++) uv.setXY(i, (positions.getX(i) + 1.45) / 2.9, (positions.getY(i) + 1.95) / 3.9);
    const metal = new MeshStandardMaterial({ color: "#273044", metalness: 0.65, roughness: 0.45, emissive: "#101a2c", emissiveIntensity: 0.35 });
    const floor = new MeshStandardMaterial({ color: "#202838", metalness: 0.65, roughness: 0.4 });
    const glow = new MeshBasicMaterial({ color: new Color("#91baff").multiplyScalar(2), toneMapped: false });
    const previews = sources.map((source) => {
      const texture = source.clone(); texture.colorSpace = SRGBColorSpace;
      const aspect = source.image.width / source.image.height;
      texture.repeat.x = Math.min(1, (2.9 / 3.9) / aspect);
      texture.offset.x = (1 - texture.repeat.x) / 2;
      texture.needsUpdate = true;
      return new MeshBasicMaterial({ map: texture, side: DoubleSide });
    });
    const rims = shipPortals.map((portal) => new MeshBasicMaterial({ color: new Color(portal.color).multiplyScalar(1.8), toneMapped: false, side: DoubleSide }));
    const labels = shipPortals.map((portal) => new MeshBasicMaterial({ map: labelTexture(`${portal.id} / ${portal.title}`), transparent: true, depthWrite: false, side: DoubleSide }));
    return { frame, edge, screen, metal, floor, glow, previews, rims, labels };
  }, [sources]);
  useEffect(() => () => {
    resources.frame.dispose(); resources.edge.dispose(); resources.screen.dispose();
    resources.metal.dispose(); resources.floor.dispose(); resources.glow.dispose();
    resources.previews.forEach((material) => { material.map?.dispose(); material.dispose(); });
    resources.labels.forEach((material) => { material.map?.dispose(); material.dispose(); });
    resources.rims.forEach((material) => material.dispose());
  }, [resources]);
  useRegisterCameraCollisionMeshes(root, [resources]);

  useFrame((_, delta) => {
    const player = usePlayerPositionStore.getState().position;
    let next: number | null = null;
    let bestDistance = 3.4 * 3.4;
    if (!cinematic && !usePauseStore.getState().isPaused && player) {
      shipPortals.forEach((portal, index) => {
        const distance = (player.x - portal.position[0]) ** 2 + (player.z - portal.position[2]) ** 2;
        if (distance < bestDistance) { bestDistance = distance; next = index; }
      });
      if (core.current && player.z > layout.hallStart - 4) core.current.rotation.y += Math.min(delta, 0.1) * 0.35;
    }
    if (nearbyRef.current !== next) { nearbyRef.current = next; setNearby(next); }
  });
  const enterPortal = useCallback(() => {
    const index = nearbyRef.current;
    if (index === null || usePauseStore.getState().isPaused) return;
    document.exitPointerLock?.();
    usePauseStore.getState().setIsPaused(true);
    window.location.assign(`/${shipPortals[index].scene}`);
  }, []);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.code === "KeyE" && !event.repeat && nearbyRef.current !== null) enterPortal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enterPortal]);

  return (
    <group ref={root}>
      <RigidBody type="fixed" colliders={false} friction={0} restitution={0}>
        {portalDeckFloors.map((floor, index) => (
          <group key={index}>
            <CuboidCollider args={floor.size.map((n) => n / 2) as Vec3} position={floor.position} />
            <mesh material={resources.floor} position={floor.position}><boxGeometry args={floor.size} /></mesh>
          </group>
        ))}
        {portalDeckWalls.map((wall, i) => (
          <group key={i}>
            <CuboidCollider args={wall.size.map((n) => n / 2) as Vec3} position={wall.position} />
            <mesh material={resources.metal} position={wall.position} userData={{ camIncludeCollision: true }}><boxGeometry args={wall.size} /></mesh>
          </group>
        ))}
        <CuboidCollider args={[2.35, 0.15, 7.6]} position={[0, 5.75, 44]} />
        <CuboidCollider args={[12.3, 0.15, 12.2]} position={[0, 5.75, 63.5]} />
        <mesh material={resources.metal} position={[0, 5.75, 44]}><boxGeometry args={[4.7, 0.3, 15.2]} /></mesh>
        <mesh material={resources.metal} position={[0, 5.75, 63.5]}><boxGeometry args={[24.6, 0.3, 24.4]} /></mesh>
      </RigidBody>
      {/* Bulkhead ribs and flush light strips share materials and cast no shadows. */}
      {[38.5, 42.5, 46.5, 50.5].map((z) => (
        <group key={z}>
          {[-2.1, 2.1].map((x) => <mesh key={x} material={resources.metal} position={[x, 2.7, z]}><boxGeometry args={[0.22, 5.3, 0.28]} /></mesh>)}
          <mesh material={resources.metal} position={[0, 5.35, z]}><boxGeometry args={[4.4, 0.25, 0.28]} /></mesh>
          <mesh material={resources.glow} position={[0, 5.2, z]}><boxGeometry args={[2.8, 0.025, 0.1]} /></mesh>
        </group>
      ))}
      {[-1.9, 1.9].map((x) => <mesh key={x} material={resources.glow} position={[x, 0.075, 44]}><boxGeometry args={[0.025, 0.015, 14.7]} /></mesh>)}
      <PortalGate z={layout.hallStart} forceOpenRef={cinematicOpenRef} metal={resources.metal} glow={resources.glow} />
      <PortalGate z={layout.hallEnd} autoOpen={false} forceOpenRef={cinematicOpenRef} metal={resources.metal} glow={resources.glow} />
      {[56.5, 63.5, 70.5].map((z) => (
        <group key={z}>
          <mesh material={resources.metal} position={[0, 5.35, z]}><boxGeometry args={[24, 0.3, 0.45]} /></mesh>
          {[-11.8, 11.8].map((x) => <mesh key={x} material={resources.metal} position={[x, 2.7, z + 2.6]}><boxGeometry args={[0.35, 5.4, 0.4]} /></mesh>)}
        </group>
      ))}
      {[-7.5, 7.5].map((x) => <mesh key={x} material={resources.glow} position={[x, 5.55, layout.hallCenterZ]}><boxGeometry args={[0.06, 0.02, 21]} /></mesh>)}
      {shipPortals.map((portal, index) => (
        <group key={portal.id} position={[...portal.position]} rotation={[0, portal.rotation, 0]}>
          <mesh geometry={resources.frame} material={resources.metal} userData={{ camIncludeCollision: true }} />
          <mesh geometry={resources.edge} material={resources.rims[index]} position={[0, 0, 0.34]} />
          <mesh geometry={resources.screen} material={resources.previews[index]} position={[0, 0, 0.15]} />
          <mesh material={resources.labels[index]} position={[0, 2.68, 0.2]}><planeGeometry args={[3.6, 0.675]} /></mesh>
          <mesh material={resources.metal} position={[0, -2.16, 0.3]}><boxGeometry args={[3.9, 0.25, 0.95]} /></mesh>
        </group>
      ))}
      <group position={[0, 0.15, layout.hallCenterZ]}>
        <mesh material={resources.metal}><cylinderGeometry args={[1.5, 1.7, 0.2, 32]} /></mesh>
        <mesh material={resources.glow} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.12, 0]}><ringGeometry args={[1.25, 1.3, 48]} /></mesh>
        <group ref={core} position={[0, 1.1, 0]}>
          <mesh><icosahedronGeometry args={[0.6, 1]} /><meshBasicMaterial color={[0.5, 1.5, 3]} wireframe toneMapped={false} /></mesh>
          <mesh material={resources.glow} rotation={[0.5, 0, 0.3]}><torusGeometry args={[0.9, 0.012, 4, 48]} /></mesh>
        </group>
        {[3.2, 7].map((radius) => <mesh key={radius} material={resources.glow} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, 0]}><ringGeometry args={[radius, radius + 0.025, 64]} /></mesh>)}
      </group>
      {nearby !== null && (
        <Html position={[shipPortals[nearby].position[0] * 0.8, 1.4, shipPortals[nearby].position[2]]} center distanceFactor={10} zIndexRange={[80, 0]}>
          <button onClick={enterPortal} className="whitespace-nowrap rounded border border-cyan-200/40 bg-slate-950/90 px-4 py-3 font-mono text-sm text-cyan-100">E · {shipPortals[nearby].title} →</button>
        </Html>
      )}
    </group>
  );
}

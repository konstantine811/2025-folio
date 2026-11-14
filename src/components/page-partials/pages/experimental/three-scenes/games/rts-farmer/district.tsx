import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { CapsuleCollider, RigidBody, interactionGroups } from "@react-three/rapier";
import { useRef } from "react";
import { Group } from "three";
import { PLACES, Place } from "./economy/simulation";
import { useBusinessStore } from "./economy/store";
import { DistrictGround } from "./ground-physics";
import { TREES } from "./navigation/pathfinding";

function Box({ position, size, color, ...props }: { position: [number, number, number]; size: [number, number, number]; color: string; rotation?: [number, number, number] }) {
  return <mesh position={position} castShadow receiveShadow {...props}><boxGeometry args={size} /><meshStandardMaterial color={color} roughness={0.85} /></mesh>;
}
function Person({ color = "#d9bb77" }: { color?: string }) {
  return <group>
    <mesh position={[0, 0.95, 0]} castShadow><capsuleGeometry args={[0.24, 0.8, 5, 8]} /><meshStandardMaterial color={color} /></mesh>
    <mesh position={[0, 1.7, 0]} castShadow><sphereGeometry args={[0.24, 10, 8]} /><meshStandardMaterial color="#dcb58c" /></mesh>
    <mesh position={[0, 1.92, 0]} castShadow><cylinderGeometry args={[0.3, 0.3, 0.12, 10]} /><meshStandardMaterial color="#435b4c" /></mesh>
    {[-0.14, 0.14].map(x => <Box key={x} position={[x, 0.3, 0]} size={[0.19, 0.6, 0.23]} color="#3f5056" />)}
  </group>;
}
function MillSails() {
  const ref = useRef<Group>(null);
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.z += dt * 0.4; });
  return <group ref={ref} position={[0, 5.4, 4.4]}>
    <Box position={[0, 0, 0]} size={[0.25, 7, 0.18]} color="#e5d7b5" /><Box position={[0, 0, 0]} size={[7, 0.25, 0.18]} color="#e5d7b5" />
  </group>;
}
function Building({ place }: { place: Place }) {
  const info = PLACES[place];
  const [x, z] = info.building;
  const face = z < 0 ? 1 : -1;
  const owned = useBusinessStore(s => s.state.bakeryOwned);
  const broken = useBusinessStore(s => s.state.bakeryBroken);
  return <group position={[x, 0, z]} rotation={[0, face < 0 ? Math.PI : 0, 0]}>
    <RigidBody type="fixed" colliders="cuboid" collisionGroups={interactionGroups(1, [0, 2])}>
      <Box position={[0, 2.5, 0]} size={[11, 5, 8]} color={info.color} />
      <Box position={[0, 5.1, 0]} size={[12, 0.6, 9]} color="#344d42" />
      <Box position={[-3, 2.8, 4.05]} size={[2.3, 1.8, 0.12]} color="#bad7d0" />
      <Box position={[3, 2.8, 4.05]} size={[2.3, 1.8, 0.12]} color="#bad7d0" />
      <Box position={[0, 1.5, 4.1]} size={[1.8, 3, 0.18]} color="#334b42" />
    </RigidBody>
    {place === "mill" && <MillSails />}
    {place === "bakery" && <><Box position={[3, 6.5, -1]} size={[1, 3, 1]} color="#7f5a48" /><Box position={[0, 3.9, 4.65]} size={[9, 0.35, 1.6]} color={broken ? "#b14b3c" : "#dfb971"} /></>}
    {place === "shop" && <Box position={[0, 3.9, 4.7]} size={[10, 0.35, 2]} color="#dfb971" />}
    {place === "garage" && <Box position={[0, 1.8, 4.13]} size={[5, 3.6, 0.15]} color="#899b96" />}
    <Html position={[0, 7.5, 0]} center distanceFactor={24} zIndexRange={[4, 0]} style={{ pointerEvents: "none" }}>
      <div className="min-w-[140px] whitespace-nowrap rounded-lg border border-white/30 bg-[#173c32]/95 px-3 py-2 text-center text-white shadow-lg">
        <div className="text-[11px] font-bold">{info.name}</div>
        <div className="mt-0.5 text-[9px] text-[#e8d7a4]">{place === "bakery" && owned ? broken ? "Твоя пекарня · потрібен ремонт" : "Твоя пекарня · працює" : info.owner}</div>
      </div>
    </Html>
  </group>;
}
export function District() {
  return <>
    <DistrictGround />
    <group>
      <Box position={[0, -0.5, 0]} size={[120, 1, 100]} color="#9aaa78" />
      {[-60, 60].map(x => <Box key={`x${x}`} position={[x, 1.2, 0]} size={[1, 2.4, 100]} color="#74846a" />)}
      {[-50, 50].map(z => <Box key={`z${z}`} position={[0, 1.2, z]} size={[120, 2.4, 1]} color="#74846a" />)}
    </group>
    {[-15, 15].map(z => <Box key={`walk-z${z}`} position={[0, 0.025, z]} size={[65, 0.05, 3]} color="#cbbb96" />)}
    {[-31, 31].map(x => <Box key={`walk-x${x}`} position={[x, 0.025, 0]} size={[3, 0.05, 50]} color="#cbbb96" />)}
    {[-20, 20].map(z => <group key={z}>
      <Box position={[0, 0.015, z]} size={[59, 0.025, 6]} color="#6b7770" />
      {Array.from({ length: 10 }, (_, i) => <Box key={i} position={[-25 + i * 5.5, 0.035, z]} size={[2.5, 0.02, 0.12]} color="#e5dcbf" />)}
    </group>)}
    {[-26, 26].map(x => <group key={x}>
      <Box position={[x, 0.015, 0]} size={[6, 0.025, 46]} color="#6b7770" />
      {Array.from({ length: 7 }, (_, i) => <Box key={i} position={[x, 0.035, -15 + i * 5]} size={[0.12, 0.02, 2.5]} color="#e5dcbf" />)}
    </group>)}
    {(Object.keys(PLACES) as Place[]).map(place => {
      const info = PLACES[place]; const [x, z] = info.point;
      return <group key={place}>
        <Building place={place} />
        <Box position={[x, 0.025, z + (z < 0 ? -4 : 4)]} size={[6, 0.05, 2]} color="#cbbb96" />
        <RigidBody type="fixed" colliders={false} position={[x + (place === "garage" ? 5 : x < 0 ? -4.5 : 4.5), 0, z]}><CapsuleCollider args={[0.65, 0.35]} position={[0, 1, 0]} collisionGroups={interactionGroups(1, [0, 2])} /><Person color={info.color} /></RigidBody>
      </group>;
    })}
    {[-44, -40, -36].map(x => <group key={x}>
      <Box position={[x, 0.05, -1]} size={[2, 0.1, 17]} color="#795b40" />
      {Array.from({ length: 10 }, (_, i) => <mesh key={i} position={[x, 0.4, -8 + i * 1.6]} castShadow><coneGeometry args={[0.35, 0.7, 5]} /><meshStandardMaterial color={x === -44 ? "#d7bf70" : "#6e8c43"} /></mesh>)}
    </group>)}
    {TREES.map(([x, z]) => <RigidBody key={`${x}-${z}`} type="fixed" colliders="hull" collisionGroups={interactionGroups(1, [0, 2])} position={[x, 0, z]}>
      <mesh position={[0, 1.3, 0]} castShadow><cylinderGeometry args={[0.25, 0.4, 2.6, 6]} /><meshStandardMaterial color="#796248" /></mesh>
      <mesh position={[0, 3.5, 0]} castShadow><icosahedronGeometry args={[2.1, 0]} /><meshStandardMaterial color="#50765a" /></mesh>
    </RigidBody>)}
    <Box position={[0, 0.06, 0]} size={[13, 0.12, 9]} color="#d1c8a9" />
    <RigidBody type="fixed" colliders="hull" collisionGroups={interactionGroups(1, [0, 2])}><mesh position={[0, 0.7, 0]} castShadow><cylinderGeometry args={[1.8, 2, 1.4, 16]} /><meshStandardMaterial color="#839b9b" /></mesh></RigidBody>
  </>;
}

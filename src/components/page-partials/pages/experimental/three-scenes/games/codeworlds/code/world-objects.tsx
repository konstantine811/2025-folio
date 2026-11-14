import { CuboidCollider, RigidBody, interactionGroups, useRapier } from "@react-three/rapier";
import { useFrame } from "@react-three/fiber";
import { CodeWorld, WorldEntity } from "./world-model";

function Entity({ entity }: { entity: WorldEntity }) {
  const [w, h, d] = entity.size;
  return <RigidBody type="fixed" position={entity.position} colliders={false} collisionGroups={interactionGroups(1, [0])}>
    <CuboidCollider args={[w / 2, h / 2, d / 2]} position={[0, h / 2, 0]} />
    {entity.prefab === "tree" ? <group>
      <mesh position={[0, h * 0.25, 0]} castShadow receiveShadow><cylinderGeometry args={[w * 0.12, w * 0.16, h * 0.5, 6]} /><meshStandardMaterial color="#856547" /></mesh>
      <mesh position={[0, h * 0.63, 0]} scale={[w, h * 0.7, d]} castShadow><coneGeometry args={[0.5, 1, 7]} /><meshStandardMaterial color={entity.color} flatShading /></mesh>
    </group> : entity.prefab === "crystal" ? <mesh position={[0, h / 2, 0]} scale={[w / 2, h / 2, d / 2]} castShadow>
      <octahedronGeometry /><meshStandardMaterial color={entity.color} emissive={entity.color} emissiveIntensity={0.25} roughness={0.3} />
    </mesh> : <mesh position={[0, h / 2, 0]} castShadow receiveShadow><boxGeometry args={entity.size} /><meshStandardMaterial color={entity.color} roughness={0.85} /></mesh>}
  </RigidBody>;
}
export function WorldObjects({ world }: { world: CodeWorld }) {
  return <>{world.entities.map(entity => <Entity key={entity.id} entity={entity} />)}</>;
}
export function RespawnOnFall({ spawn }: { spawn: CodeWorld["spawn"] }) {
  const { world } = useRapier();
  useFrame(() => {
    world.forEachRigidBody(body => {
      if ((body.userData as { type?: string } | undefined)?.type === "player" && body.translation().y < -12) {
        body.setTranslation({ x: spawn[0], y: spawn[1] + 1.25, z: spawn[2] }, true);
        body.setLinvel({ x: 0, y: 0, z: 0 }, true);
      }
    });
  });
  return null;
}

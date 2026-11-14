import { Suspense, useState, type ReactNode } from "react";
import { CuboidCollider, RigidBody, interactionGroups, useAfterPhysicsStep, useRapier } from "@react-three/rapier";

const groundData = { type: "district-ground" };
/** Explicit colliders exist independently of meshes, assets and auto-collider effects. */
export function DistrictGround() {
  return <RigidBody type="fixed" colliders={false} userData={groundData}>
    <CuboidCollider args={[60, 0.5, 50]} position={[0, -0.5, 0]} collisionGroups={interactionGroups(1, [0, 2])} />
    {[-60, 60].map(x => <CuboidCollider key={`x${x}`} args={[0.5, 1.2, 50]} position={[x, 1.2, 0]} collisionGroups={interactionGroups(1, [0, 2])} />)}
    {[-50, 50].map(z => <CuboidCollider key={`z${z}`} args={[60, 1.2, 0.5]} position={[0, 1.2, z]} collisionGroups={interactionGroups(1, [0, 2])} />)}
  </RigidBody>;
}
export function GroundReadyActors({ children }: { children: ReactNode }) {
  const { world, rapier } = useRapier();
  const [ready, setReady] = useState(false);
  useAfterPhysicsStep(() => {
    if (ready) return;
    // Query only after Rapier updates its spatial index, never advance the world manually.
    const hit = world.castRay(new rapier.Ray({ x: 0, y: 2, z: -15 }, { x: 0, y: -1, z: 0 }), 3, true, undefined, interactionGroups(0, [1]));
    const data = hit?.collider.parent()?.userData as { type?: string } | undefined;
    if (data?.type === "district-ground") setReady(true);
  });
  return ready ? <Suspense fallback={null}>{children}</Suspense> : null;
}

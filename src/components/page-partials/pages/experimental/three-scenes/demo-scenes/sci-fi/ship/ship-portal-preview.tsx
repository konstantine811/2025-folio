import { Suspense } from "react";
import { ShipContainer } from "./ship-container";

/** Ship interior slice for portal FBO (layer 2, no extra physics). */
export function ShipPortalPreview() {
  return (
    <group name="ship-portal-preview">
      <ambientLight intensity={1.7} />
      <directionalLight castShadow position={[1, 3, 1]} intensity={3} />
      <Suspense fallback={null}>
        <ShipContainer visualOnly position={[0, 0, 0]} />
      </Suspense>
    </group>
  );
}

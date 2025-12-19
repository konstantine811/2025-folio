import { Canvas, useFrame } from "@react-three/fiber";
import { Gltf, Environment } from "@react-three/drei";
import { Suspense, useRef, useState } from "react";
import { Group } from "three";
import * as THREE from "three";

const PhoneModel = ({
  mousePosition,
}: {
  mousePosition: { x: number; y: number };
}) => {
  const groupRef = useRef<Group>(null);

  // Smooth rotation interpolation
  useFrame(() => {
    if (!groupRef.current) return;

    // Calculate target rotation from mouse position (-1 to 1 range)
    // Limit rotation to subtle movement (max 15 degrees = ~0.26 radians)
    const targetX = mousePosition.y * 0.26; // Rotate around X axis based on Y mouse position
    const targetY = mousePosition.x * 0.26; // Rotate around Y axis based on X mouse position

    // Lerp towards target rotation for smooth movement
    const lerpFactor = 0.1;
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      targetX,
      lerpFactor
    );
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetY,
      lerpFactor
    );
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[0, 0, 5]} intensity={1.2} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <directionalLight position={[-5, -5, -5]} intensity={0.4} />
      <group ref={groupRef} rotation={[0, 0, 0]}>
        <Gltf
          src="/3d-models/apple_iphone_15_pro_max_black.glb"
          scale={2.5}
          position={[0, 0, 0]}
          rotation={[0, Math.PI / 1.3, 0]}
        />
      </group>
      <Environment preset="warehouse" blur={0.3} />
    </>
  );
};

const Phone3D = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1; // -1 to 1
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1; // -1 to 1

    setMousePosition({ x, y });
  };

  const handlePointerLeave = () => {
    setMousePosition({ x: 0, y: 0 });
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <Canvas
        camera={{ position: [0, 0, 2.8], fov: 40 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <PhoneModel mousePosition={mousePosition} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Phone3D;

import { PointMaterial, Points } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, useEffect } from "react";
import { Mesh, Points as PointsType, Group, MathUtils } from "three";

const DarkSimple = () => {
  const meshRef = useRef<Mesh>(null!);
  const pointsRef = useRef<PointsType>(null!);
  const sphereGroupRef = useRef<Group>(null!);
  const pointsGroupRef = useRef<Group>(null!);
  const mouseRef = useRef({ x: 0, y: 0 });

  const points = useMemo(() => {
    const p = new Float32Array(500 * 3);
    for (let i = 0; i < 500; i++) {
      p[i * 3] = (Math.random() - 0.5) * 200;
      p[i * 3 + 1] = (Math.random() - 0.5) * 200;
      p[i * 3 + 2] = (Math.random() - 0.5) * 200;
    }
    return p;
  }, []);

  // Відстеження курсора через window events (якщо pointer з useFrame не працює)
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    const mouseX = mouseRef.current.x;
    const mouseY = mouseRef.current.y;

    // Обертання групи сфери навколо курсора (швидше)
    if (sphereGroupRef.current) {
      const targetRotationY = mouseX * 0.2; // більша інтенсивність
      const targetRotationX = -mouseY * 0.2;
      const lerpFactor = Math.min(delta * 10, 1); // швидший lerp

      sphereGroupRef.current.rotation.y = MathUtils.lerp(
        sphereGroupRef.current.rotation.y,
        targetRotationY,
        lerpFactor
      );
      sphereGroupRef.current.rotation.x = MathUtils.lerp(
        sphereGroupRef.current.rotation.x,
        targetRotationX,
        lerpFactor
      );
    }

    // Анімація самої сфери (локальна, відносно групи)
    if (meshRef.current) {
      meshRef.current.rotation.y = time * 0.1;
      meshRef.current.position.y = Math.sin(time * 0.5) * 2;
    }

    // Обертання групи точок навколо курсора окремо (повільніше)
    if (pointsGroupRef.current) {
      const targetRotationY = mouseX * 0.01; // менша інтенсивність
      const targetRotationX = -mouseY * 0.01;
      const lerpFactor = Math.min(delta * 4, 1); // повільніший lerp

      pointsGroupRef.current.rotation.y = MathUtils.lerp(
        pointsGroupRef.current.rotation.y,
        targetRotationY,
        lerpFactor
      );
      pointsGroupRef.current.rotation.x = MathUtils.lerp(
        pointsGroupRef.current.rotation.x,
        targetRotationX,
        lerpFactor
      );
    }

    // Анімація самих точок (локальна, відносно групи)
    if (pointsRef.current) {
      pointsRef.current.rotation.y = time * 0.08;
      pointsRef.current.rotation.x = time * 0.02;
    }
  });

  return (
    <group>
      {/* Група для сфери з обертанням навколо курсора */}
      {/* Позиція групи = позиція сфери, щоб обертання було навколо центру сфери */}
      <group ref={sphereGroupRef} position={[40, -3, 0]}>
        <mesh ref={meshRef}>
          <icosahedronGeometry args={[45, 3]} />
          <meshBasicMaterial color="black" wireframe />
        </mesh>
      </group>

      {/* Група для точок з обертанням навколо курсора */}
      <group ref={pointsGroupRef}>
        <Points
          ref={pointsRef}
          positions={points}
          stride={3}
          frustumCulled={false}
        >
          <PointMaterial
            transparent
            color="black"
            size={0.2}
            sizeAttenuation={true}
            depthWrite={false}
          />
        </Points>
      </group>
    </group>
  );
};

export default DarkSimple;

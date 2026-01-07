import { PointMaterial, Points } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Mesh, Points as PointsType } from "three";

const DarkSimple = () => {
  const meshRef = useRef<Mesh>(null!);

  const ref = useRef<PointsType>(null!);

  const points = useMemo(() => {
    const p = new Float32Array(500 * 3);
    for (let i = 0; i < 500; i++) {
      p[i * 3] = (Math.random() - 0.5) * 200;
      p[i * 3 + 1] = (Math.random() - 0.5) * 200;
      p[i * 3 + 2] = (Math.random() - 0.5) * 200;
    }
    return p;
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    meshRef.current.rotation.y = time * 0.1;
    meshRef.current.position.y = Math.sin(time * 0.5) * 2;

    // poingt
    ref.current.rotation.y = time * 0.05;
    ref.current.rotation.x = time * 0.02;
  });

  return (
    <>
      <mesh ref={meshRef} position={[40, 10, 0]}>
        <icosahedronGeometry args={[50, 2]} />
        <meshBasicMaterial color="black" wireframe transparent opacity={1} />
      </mesh>
      <Points ref={ref} positions={points} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="black"
          size={0.5}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </>
  );
};

export default DarkSimple;

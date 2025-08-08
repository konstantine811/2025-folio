import { Trail, useScroll } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import { MeshLineMaterial, MeshLineGeometry } from "meshline";
import { useMemo, useRef } from "react";
import { AdditiveBlending, Color, Mesh, Vector3 } from "three";

extend({ MeshLineMaterial, MeshLineGeometry });

const tmpVector = new Vector3();
const LERP_SPEED = 10;

const Comet = ({
  length,
  size,
  color,
  startPosition,
  orbitSpeed,
  coinSpeed,
  radius,
}: {
  length: number;
  size: number;
  color: string;
  startPosition: [number, number, number];
  orbitSpeed: number;
  coinSpeed: number;
  radius: number;
}) => {
  const meshRef = useRef<Mesh>(null);
  const emissiveColor = useMemo(() => {
    const newColor = new Color(color);
    newColor.multiplyScalar(5);
    return newColor;
  }, [color]);
  const data = useScroll();
  useFrame(({ clock }, delta) => {
    if (!meshRef.current) return;
    const coinMode = data.visible(1 / 4, 1 / 4);
    if (coinMode) {
      tmpVector.x = Math.cos(clock.elapsedTime * coinSpeed) * radius;
      tmpVector.y = Math.sin(clock.elapsedTime * coinSpeed) * radius;
      tmpVector.z = 0;
    } else {
      // default orbit
      tmpVector.x = startPosition[0];
      tmpVector.y = Math.sin(clock.elapsedTime * orbitSpeed) * 20;
      tmpVector.z = -5 + Math.cos(clock.elapsedTime * orbitSpeed) * 80;
    }

    meshRef.current.position.lerp(tmpVector, delta * LERP_SPEED);
  });
  return (
    <group position={startPosition}>
      <Trail
        target={undefined}
        width={size} // Width of the trail
        length={length} // Length of the line
        decay={1} // How fast the line fades away
        local={false} // Wether to use the target's world or local positions
        stride={0} // Min distance between previous and current point
        interval={1} // Number of frames to wait before nex calculation trail
        attenuation={(p) => {
          return p;
        }} // A function to define the width in each point along it
      >
        {/* If target is not defined, Trail will use the first Object3D child as the target */}
        <mesh ref={meshRef} position={startPosition} rotation-x={Math.PI / 2}>
          <sphereGeometry args={[size / 50]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={1}
          />
        </mesh>

        {/* You can optionally define a custom meshLineMaterial to use */}
        <meshLineMaterial
          color={emissiveColor}
          transparent
          toneMapped={false}
          opacity={0.5}
          blending={AdditiveBlending}
        />
      </Trail>
    </group>
  );
};

export default Comet;

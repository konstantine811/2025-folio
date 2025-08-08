import { useFrame, useThree } from "@react-three/fiber";
import { useControls } from "leva";
import { useRef } from "react";
import { Group, Vector3 } from "three";
import SimpleTrail from "./simple-trail";

const tmpVec = new Vector3();

const Cursor = () => {
  const targetRef = useRef<Group>(null);
  const { size, color, opacity, intensity } = useControls("Cursor", {
    size: { value: 0.2, min: 0.1, max: 3, step: 0.01 },
    color: "#dfbcff",
    intensity: { value: 4.6, min: 1, max: 10, step: 0.1 },
    opacity: { value: 0.5, min: 0, max: 1, step: 0.01 },
  });

  const viewport = useThree((state) => state.viewport);

  useFrame(({ pointer }, delta) => {
    if (!targetRef.current) return;
    tmpVec.set(
      (pointer.x * viewport.width) / 2,
      (pointer.y * viewport.height) / 2,
      0
    );
    targetRef.current.position.lerp(tmpVec, delta * 12);
    // const elapsedTime = clock.getElapsedTime();
    // targetRef.current.position.x = Math.sin(elapsedTime) * 5;
    // targetRef.current.position.y = Math.cos(elapsedTime * 2) * 4;
    // targetRef.current.position.z = Math.sin(elapsedTime * 2) * 10;
  });
  return (
    <>
      <group ref={targetRef}>
        <mesh>
          <sphereGeometry args={[size / 2, 32, 32]} />
          <meshStandardMaterial
            color={color}
            transparent
            opacity={opacity}
            emissive={color}
            emissiveIntensity={intensity}
          />
        </mesh>
      </group>
      <SimpleTrail
        target={targetRef.current}
        color={color}
        intensity={intensity}
        opacity={opacity}
        height={size}
      />
    </>
  );
};

export default Cursor;

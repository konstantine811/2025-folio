import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Mesh, Vector3 } from "three";

const WORLD_SCALE = 5;
const GRAVITY = -9.81;
const BOX_SIZE = 50;
const HALF_BOX_SIZE = BOX_SIZE / 2;
const BOX_POSITION = new Vector3(0, HALF_BOX_SIZE, 0);
const GROUND_POSITION = new Vector3(
  BOX_POSITION.x,
  BOX_POSITION.y - HALF_BOX_SIZE,
  BOX_POSITION.z
);
const SPHERE_RADIUS = 1;
const BOUNCE_FACTOR = 0.3;

const BouncingBall = () => {
  const ballRef = useRef<Mesh>(null);
  const position = useRef(new Vector3(0, 40, 0));
  const velocity = useRef(new Vector3(1.5 * WORLD_SCALE, 0, 3.0 * WORLD_SCALE));
  useFrame((_, delta) => {
    if (ballRef.current) {
      velocity.current.y += GRAVITY * delta * WORLD_SCALE;
      position.current.y += velocity.current.y * delta;
      position.current.x += velocity.current.x * delta;
      position.current.z += velocity.current.z * delta;
      const minX = BOX_POSITION.x - HALF_BOX_SIZE + SPHERE_RADIUS;
      const maxX = BOX_POSITION.x + HALF_BOX_SIZE - SPHERE_RADIUS;
      const minY = BOX_POSITION.y - HALF_BOX_SIZE + SPHERE_RADIUS;
      const maxY = BOX_POSITION.y + HALF_BOX_SIZE - SPHERE_RADIUS;
      const minZ = BOX_POSITION.z - HALF_BOX_SIZE + SPHERE_RADIUS;
      const maxZ = BOX_POSITION.z + HALF_BOX_SIZE - SPHERE_RADIUS;
      if (position.current.x < minX) {
        position.current.x = minX;
        velocity.current.x *= -BOUNCE_FACTOR;
      }
      if (position.current.x > maxX) {
        position.current.x = maxX;
        velocity.current.x *= -BOUNCE_FACTOR;
      }
      if (ballRef.current.position.y < minY) {
        position.current.y = minY;
        velocity.current.y *= -BOUNCE_FACTOR;
      }
      if (position.current.y > maxY) {
        position.current.y = maxY;
        velocity.current.y *= -BOUNCE_FACTOR;
      }
      if (position.current.z < minZ) {
        position.current.z = minZ;
        velocity.current.z *= -BOUNCE_FACTOR;
      }
      if (position.current.z > maxZ) {
        position.current.z = maxZ;
        velocity.current.z *= -BOUNCE_FACTOR;
      }
      ballRef.current.position.set(
        position.current.x,
        position.current.y,
        position.current.z
      );
    }
  });
  return (
    <group>
      <mesh ref={ballRef} position={[0, 10, 0]}>
        <sphereGeometry args={[SPHERE_RADIUS, 32, 32]} />
        <meshStandardMaterial color="red" />
      </mesh>
      <mesh position={BOX_POSITION}>
        <boxGeometry args={[BOX_SIZE, BOX_SIZE, BOX_SIZE]} />
        <meshStandardMaterial color="white" transparent opacity={0.5} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={GROUND_POSITION}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="white" />
      </mesh>
    </group>
  );
};

export default BouncingBall;

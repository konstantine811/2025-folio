import { CuboidCollider, RigidBody } from "@react-three/rapier";

type BoxObstacleProps = {
  position: [number, number, number];
  rotation?: [number, number, number];
  size: [number, number, number];
  color: string;
  wireframe?: boolean;
  dynamic?: boolean;
  mass?: number;
};

function BoxObstacle({
  position,
  rotation = [0, 0, 0],
  size,
  color,
  wireframe = false,
  dynamic = false,
  mass = 2.5,
}: BoxObstacleProps) {
  const [width, height, depth] = size;

  return (
    <RigidBody
      type={dynamic ? "dynamic" : "fixed"}
      position={position}
      rotation={rotation}
      mass={dynamic ? mass : undefined}
      friction={0.85}
      restitution={0.05}
      linearDamping={dynamic ? 0.25 : undefined}
      angularDamping={dynamic ? 0.45 : undefined}
      colliders={false}
    >
      <CuboidCollider
        args={[width / 2, height / 2, depth / 2]}
        friction={0.85}
        restitution={0.05}
      />
      <mesh castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial
          color={color}
          wireframe={wireframe}
          roughness={0.65}
          metalness={wireframe ? 0 : 0.08}
        />
      </mesh>
    </RigidBody>
  );
}

type RampProps = {
  positionZ: number;
  width: number;
  length: number;
  thickness: number;
  pitch: number;
  color: string;
  direction?: "up" | "down";
};

/** Top-surface Y at the high (+Z) end of an "up" ramp flush to y=0 at the low end. */
function getRampExitSurfaceY(length: number, thickness: number, pitch: number) {
  const halfY = thickness / 2;
  const halfZ = length / 2;
  const centerY = halfY * Math.cos(pitch) + halfZ * Math.sin(pitch);
  return centerY + halfY * Math.cos(pitch) + halfZ * Math.sin(pitch);
}

/** Ramp flush to ground on the low side; car drives toward +Z. */
function Ramp({
  positionZ,
  width,
  length,
  thickness,
  pitch,
  color,
  direction = "up",
}: RampProps) {
  const halfY = thickness / 2;
  const halfZ = length / 2;
  const centerY = halfY * Math.cos(pitch) + halfZ * Math.sin(pitch);
  const rotationX = direction === "up" ? -pitch : pitch;

  return (
    <RigidBody
      type="fixed"
      position={[0, centerY, positionZ]}
      rotation={[rotationX, 0, 0]}
      friction={1.1}
      restitution={0.01}
      colliders={false}
      userData={{ isGround: true }}
    >
      <CuboidCollider
        args={[width / 2, halfY, halfZ]}
        friction={1.1}
        restitution={0.01}
      />
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, thickness, length]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
    </RigidBody>
  );
}

type CylinderObstacleProps = {
  position: [number, number, number];
  radius?: number;
  height?: number;
  color: string;
  mass?: number;
};

function CylinderObstacle({
  position,
  radius = 0.45,
  height = 1.1,
  color,
  mass = 1.8,
}: CylinderObstacleProps) {
  return (
    <RigidBody
      type="dynamic"
      position={position}
      mass={mass}
      friction={0.75}
      restitution={0.08}
      linearDamping={0.25}
      angularDamping={0.4}
      colliders="hull"
    >
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[radius, radius, height, 12]} />
        <meshStandardMaterial color={color} roughness={0.55} />
      </mesh>
    </RigidBody>
  );
}

/**
 * Static test track near spawn (+Z). Simple primitives for car physics checks.
 */
export function StylizedWorldTestCourse() {
  const climbPitch = 0.11;
  const climbLength = 12;
  const climbThickness = 0.24;
  const climbExitY = getRampExitSurfaceY(climbLength, climbThickness, climbPitch);
  const plateauHalfHeight = 0.1;

  return (
    <group name="stylized-world-test-course">
      {/* Movable slalom boxes */}
      <BoxObstacle
        dynamic
        position={[-4, 0.55, 14]}
        size={[1.2, 1.1, 1.2]}
        color="#e07a7a"
      />
      <BoxObstacle
        dynamic
        position={[4, 0.55, 18]}
        size={[1.2, 1.1, 1.2]}
        color="#e07a7a"
      />
      <BoxObstacle
        dynamic
        position={[-3, 0.55, 24]}
        size={[1.2, 1.1, 1.2]}
        color="#d96a6a"
      />
      <BoxObstacle
        dynamic
        position={[3, 0.55, 28]}
        size={[1.2, 1.1, 1.2]}
        color="#d96a6a"
      />

      {/* Bollards */}
      <CylinderObstacle position={[0, 0.55, 20]} color="#f0c060" />
      <CylinderObstacle position={[2.5, 0.55, 22]} color="#f0c060" />
      <CylinderObstacle position={[-2.5, 0.55, 22]} color="#f0c060" />

      {/* Gentle climb — long low ramp + small plateau */}
      <Ramp
        positionZ={36}
        width={8}
        length={climbLength}
        thickness={climbThickness}
        pitch={climbPitch}
        color="#7ec8a8"
      />
      <BoxObstacle
        position={[0, climbExitY - plateauHalfHeight, 44.15]}
        size={[8.4, plateauHalfHeight * 2, 4.3]}
        color="#6fbf9b"
      />
      <Ramp
        positionZ={52}
        width={8}
        length={climbLength}
        thickness={climbThickness}
        pitch={climbPitch}
        direction="down"
        color="#6fbf9b"
      />

      {/* Small hill on flat ground */}
      <Ramp
        positionZ={62}
        width={6}
        length={6}
        thickness={0.22}
        pitch={0.14}
        color="#8fd4e8"
      />
      <Ramp
        positionZ={68}
        width={6}
        length={6}
        thickness={0.22}
        pitch={0.14}
        direction="down"
        color="#8fd4e8"
      />

      {/* Low jump */}
      <Ramp
        positionZ={76}
        width={5}
        length={4.5}
        thickness={0.2}
        pitch={0.17}
        color="#c9a0e8"
      />
      <BoxObstacle position={[0, 0.72, 79.5]} size={[5, 0.18, 3]} color="#b890dc" />

      {/* Brake wall */}
      <BoxObstacle
        position={[0, 1.2, 86]}
        size={[8, 2.4, 0.6]}
        color="#f5f5f5"
        wireframe
      />

      {/* Side walls */}
      <BoxObstacle
        position={[-3.2, 0.7, 36]}
        size={[0.5, 1.4, 10]}
        color="#888888"
        wireframe
      />
      <BoxObstacle
        position={[3.2, 0.7, 36]}
        size={[0.5, 1.4, 10]}
        color="#888888"
        wireframe
      />
    </group>
  );
}

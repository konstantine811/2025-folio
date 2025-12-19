import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, Shape, DoubleSide, ShapeGeometry } from "three";

// Colors
const colorTriangle = 0x059669; // Emerald 600
const colorLeft = 0x34d399; // Emerald 400
const colorBottom = 0x08fafc; // Slate 50 (White-ish)
const colorHypot = 0x6ee7b7; // Emerald 300

interface HingedSquareProps {
  width: number;
  height: number;
  color: number;
  position: [number, number, number];
  rotationZ: number;
  alignX: number;
  alignY: number;
  hingeRotation: number;
}

const HingedSquare = ({
  width,
  height,
  color,
  position,
  rotationZ,
  alignX,
  alignY,
  hingeRotation,
}: HingedSquareProps) => {
  const wrapperRef = useRef<Group>(null);
  const hingeRef = useRef<Group>(null);

  useEffect(() => {
    if (wrapperRef.current) {
      wrapperRef.current.position.set(...position);
      wrapperRef.current.rotation.z = rotationZ;
    }
  }, [position, rotationZ]);

  useFrame(() => {
    if (hingeRef.current) {
      hingeRef.current.rotation.x = hingeRotation;
    }
  });

  return (
    <group ref={wrapperRef}>
      <group ref={hingeRef}>
        <mesh position={[(width / 2) * alignX, (height / 2) * alignY, 0]}>
          <planeGeometry args={[width, height]} />
          <meshBasicMaterial color={color} side={DoubleSide} />
        </mesh>
      </group>
    </group>
  );
};

interface ExperienceProps {
  animationProgress: number;
}

const Experience = ({ animationProgress }: ExperienceProps) => {
  const globalGroupRef = useRef<Group>(null);

  // Create triangle shape and geometry
  const triangleGeometry = useMemo(() => {
    const shape = new Shape();
    shape.moveTo(0, 0);
    shape.lineTo(3, 0);
    shape.lineTo(0, 4);
    shape.lineTo(0, 0);
    return new ShapeGeometry(shape);
  }, []);

  // Easing function
  const easeInOutQuart = (x: number) => {
    return x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2;
  };

  // Calculate current angle based on progress
  const startAngle = -Math.PI / 2;
  const endAngle = 0;
  const easedProgress = easeInOutQuart(animationProgress);
  const currentAngle = startAngle + (endAngle - startAngle) * easedProgress;

  // Center the visual in 3D space
  useEffect(() => {
    if (globalGroupRef.current) {
      globalGroupRef.current.position.set(-1.0, -1.0, 0);
    }
  }, []);

  // Calculate angle for hypotenuse square
  const hypotAngle = Math.atan2(-4, 3);

  return (
    <group ref={globalGroupRef}>
      {/* Central Triangle */}
      <mesh geometry={triangleGeometry}>
        <meshBasicMaterial color={colorTriangle} side={DoubleSide} />
      </mesh>

      {/* Left Square (4x4) - Side 'b' */}
      <HingedSquare
        width={4}
        height={4}
        color={colorLeft}
        position={[0, 0, 0]}
        rotationZ={Math.PI / 2}
        alignX={1}
        alignY={1}
        hingeRotation={currentAngle}
      />

      {/* Bottom Square (3x3) - Side 'a' */}
      <HingedSquare
        width={3}
        height={3}
        color={colorBottom}
        position={[0, 0, 0]}
        rotationZ={0}
        alignX={1}
        alignY={-1}
        hingeRotation={-currentAngle}
      />

      {/* Hypotenuse Square (5x5) - Side 'c' */}
      <HingedSquare
        width={5}
        height={5}
        color={colorHypot}
        position={[0, 4, 0]}
        rotationZ={hypotAngle}
        alignX={1}
        alignY={1}
        hingeRotation={currentAngle}
      />
    </group>
  );
};

export default Experience;

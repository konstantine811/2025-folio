import { shaderMaterial } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Color, DoubleSide, Group, Mesh, Vector3 } from "three";

const TrailMaterial = shaderMaterial(
  {
    color: new Color("#ffffff"),
    opacity: 1,
    intensity: 1,
  },
  /*glsl */ `
    varying vec2 vUv;
    
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
    `,
  /*glsl */ `
    uniform vec3 color;
    uniform float opacity;
    uniform float intensity;
    varying vec2 vUv;

    void main() {
        float alpha = smoothstep(1.0, 0.5, vUv.y) * smoothstep(1.0, 0.5, vUv.x) * smoothstep(0.0, 0.5, vUv.x);
        gl_FragColor = vec4(color * intensity, alpha * opacity);
    }
  `
);

extend({ TrailMaterial });

const SimpleTrail = ({
  target,
  color = "#ffffff",
  //   intensity = 6,
  numPoints = 20,
  height = 10.42,
  minDistance = 0.1,
  opacity = 0.5,
  duration = 20,
}: {
  target: Group | null;
  color?: string;
  intensity: number;
  numPoints?: number;
  height?: number;
  minDistance?: number;
  opacity?: number;
  duration?: number;
}) => {
  const meshRef = useRef<Mesh>(null);
  const lastUnshift = useRef<number>(Date.now());
  const positions = useRef<Vector3[]>(
    new Array(numPoints).fill(new Vector3(0, 0, 0))
  );
  useFrame(() => {
    if (!meshRef.current || !target) return;
    const curPoint = target.position;
    const lastPoint = positions.current[0];
    const distanceToLastPoint = lastPoint.distanceTo(target.position);
    if (distanceToLastPoint < minDistance) {
      if (Date.now() - lastUnshift.current > duration) {
        positions.current.unshift(lastPoint);
        positions.current.pop();
        lastUnshift.current = Date.now();
      }
    } else {
      positions.current.unshift(curPoint.clone());
      positions.current.pop();
    }
    const geometry = meshRef.current.geometry;
    const positionAttribute = geometry.getAttribute("position");
    for (let i = 0; i < numPoints; i++) {
      const point = positions.current[positions.current.length - 1 - i];
      positionAttribute.setXYZ(i * 2, point.x, point.y - height / 2, point.z);
      positionAttribute.setXYZ(
        i * 2 + 1,
        point.x,
        point.y + height / 2,
        point.z
      );
    }
    positionAttribute.needsUpdate = true;
  });
  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[1, 1, 1, numPoints - 1]} />
      <trailMaterial
        color={color}
        side={DoubleSide}
        transparent
        opacity={opacity}
        depthWrite={false}
      />
    </mesh>
  );
};

export default SimpleTrail;

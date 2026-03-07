import { Line } from "@react-three/drei";
import { Vec3 } from "../../models/character-controller.model";

export default function AgentPathDebug({
  path,
  pathIndex,
}: {
  path: Vec3[];
  pathIndex: number;
}) {
  if (!path.length) return null;

  const linePoints: [number, number, number][] = path.map((p) => [
    p.x,
    p.y + 0.08,
    p.z,
  ]);

  return (
    <group>
      <Line points={linePoints} color="cyan" lineWidth={2} />

      {path.map((point, index) => {
        const isCurrent = index === pathIndex;

        return (
          <mesh
            key={index}
            position={[point.x, point.y + 0.1, point.z]}
            scale={isCurrent ? 1.4 : 1}
          >
            <sphereGeometry args={[0.08, 10, 10]} />
            <meshBasicMaterial color={isCurrent ? "red" : "yellow"} />
          </mesh>
        );
      })}
    </group>
  );
}

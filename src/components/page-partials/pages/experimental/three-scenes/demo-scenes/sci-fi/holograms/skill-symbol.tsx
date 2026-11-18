import { useEffect, useMemo } from "react";
import { BufferGeometry, Float32BufferAttribute, LineBasicMaterial, MeshBasicMaterial, PlaneGeometry } from "three";
import type { SkillKind } from "./skill-stations.config";

export function SkillSymbol({ kind, material, lineMaterial }: { kind: SkillKind; material: MeshBasicMaterial; lineMaterial: LineBasicMaterial }) {
  const terrain = useMemo(() => {
    if (kind !== "maps") return null;
    const geometry = new PlaneGeometry(1.7, 1.3, 18, 14);
    geometry.rotateX(-Math.PI / 2);
    const positions = geometry.getAttribute("position");
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i), z = positions.getZ(i);
      const height = 0.5 * Math.exp(-((x - 0.2) ** 2 + (z + 0.1) ** 2) * 5)
        + 0.16 * Math.sin(x * 8 + z * 4) * Math.cos(z * 6);
      positions.setY(i, height);
    }
    return geometry;
  }, [kind]);
  const ribbons = useMemo(() => {
    if (kind !== "motion") return [];
    return [0, 1, 2].map((strand) => {
      const vertices: number[] = [];
      for (let i = 0; i < 80; i++) {
        for (const t of [i / 80, (i + 1) / 80]) {
          const a = t * Math.PI * 3 + strand * 0.22;
          vertices.push(Math.sin(a) * 0.7, (t - 0.5) * 1.6, Math.cos(a) * 0.4);
        }
      }
      return new BufferGeometry().setAttribute("position", new Float32BufferAttribute(vertices, 3));
    });
  }, [kind]);
  useEffect(() => () => { terrain?.dispose(); ribbons.forEach((geometry) => geometry.dispose()); }, [terrain, ribbons]);

  if (kind === "frontend") return (
    <>
      <mesh material={material}><boxGeometry args={[1.25, 1.25, 1.25, 2, 2, 2]} /></mesh>
      <mesh material={material} rotation={[0.3, 0.4, 0]}><boxGeometry args={[0.55, 0.55, 0.55]} /></mesh>
    </>
  );
  if (kind === "three") return (
    <>
      <mesh material={material}><icosahedronGeometry args={[0.7, 1]} /></mesh>
      <mesh material={material} rotation={[Math.PI / 2, 0.4, 0]}><torusGeometry args={[0.9, 0.018, 4, 48]} /></mesh>
    </>
  );
  if (kind === "maps" && terrain) return <mesh material={material} geometry={terrain} rotation={[0.22, 0, 0]} />;
  if (kind === "backend") return (
    <>
      <mesh material={material}><boxGeometry args={[0.8, 1.7, 0.6]} /></mesh>
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} material={material} position={[0, -0.66 + i * 0.26, 0]}><boxGeometry args={[0.7, 0.1, 0.55]} /></mesh>
      ))}
    </>
  );
  if (kind === "data") return (
    <>
      {[-0.55, 0, 0.55].map((y) => (
        <group key={y} position={[0, y, 0]}>
          <mesh material={material}><cylinderGeometry args={[0.57, 0.57, 0.14, 24, 1, true]} /></mesh>
          <mesh material={material} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.57, 0.02, 4, 32]} /></mesh>
        </group>
      ))}
    </>
  );
  return <>{ribbons.map((geometry, i) => <lineSegments key={i} geometry={geometry} material={lineMaterial} />)}</>;
}

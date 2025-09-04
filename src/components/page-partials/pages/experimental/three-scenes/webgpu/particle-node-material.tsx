import { useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import { color, mix, uv, uniform } from "three/tsl";

type Props = {
  colorA?: string;
  colorB?: string;
};

const ParticleNodeMaterial = ({
  colorA = "white",
  colorB = "orange",
}: Props) => {
  const { nodes, uniforms } = useMemo(() => {
    const uniforms = {
      colorA: uniform(color(colorA)),
      colorB: uniform(color(colorB)),
    };

    return {
      nodes: {
        colorNode: mix(uniforms.colorA, uniforms.colorB, uv()),
      },
      uniforms,
    };
  }, []);

  useFrame(() => {
    uniforms.colorA.value.set(colorA);
    uniforms.colorB.value.set(colorB);
  });

  return <meshStandardNodeMaterial {...nodes} />;
};

export default ParticleNodeMaterial;

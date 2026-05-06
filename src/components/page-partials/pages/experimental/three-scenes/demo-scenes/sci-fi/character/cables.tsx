import { useGLTF } from "@react-three/drei";
import { JSX } from "react";
import { Mesh } from "three";

const cablesPath = "/3d-models/sci-fi/cables.glb";
const cablesOrigin: [number, number, number] = [0, -1.6, -9.63];

type CableConfig = {
  name: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
};

const cableConfigs: CableConfig[] = [
  { name: "Cable_1", position: [-0.77, 0.827, 22.09] },
  {
    name: "Cable_2",
    position: [0.069, 1.592, 9.634],
    rotation: [0, Math.PI / 2, 0],
    scale: [2.775, 1, 1],
  },
  {
    name: "Cable_3",
    position: [-0.077, 1.626, 9.626],
    rotation: [0, Math.PI / 2, 0],
    scale: [2.775, 1, 1],
  },
  {
    name: "Cable_4",
    position: [0.099, 1.626, 9.625],
    rotation: [0, Math.PI / 2, 0],
    scale: [2.775, 1, 1],
  },
  {
    name: "Cable_5",
    position: [-0.056, 1.601, 9.659],
    rotation: [0, Math.PI / 2, 0],
    scale: [2.775, 1, 1],
  },
  {
    name: "Cable_6",
    position: [0.081, 1.599, 9.666],
    rotation: [0, Math.PI / 2, 0],
    scale: [2.775, 1, 1],
  },
  {
    name: "Cable_7",
    position: [0.114, 1.633, 9.567],
    rotation: [0, Math.PI / 2, 0],
    scale: [2.775, 1, 1],
  },
  {
    name: "Cable_8",
    position: [-0.095, 1.634, 9.566],
    rotation: [0, Math.PI / 2, 0],
    scale: [2.775, 1, 1],
  },
];

type CablesModelProps = JSX.IntrinsicElements["group"] & {
  centered?: boolean;
};

export function CablesModel({ centered = false, ...props }: CablesModelProps) {
  const { nodes, materials } = useGLTF(cablesPath);
  const cableMaterial = materials["Material.002"];

  return (
    <group {...props} dispose={null}>
      <group position={centered ? cablesOrigin : undefined}>
        {cableConfigs.map((config) => {
          const mesh = nodes[config.name] as Mesh;

          return (
            <mesh
              key={config.name}
              castShadow
              receiveShadow
              geometry={mesh.geometry}
              material={cableMaterial}
              name={config.name}
              position={config.position}
              rotation={config.rotation}
              scale={config.scale}
            />
          );
        })}
      </group>
    </group>
  );
}

useGLTF.preload(cablesPath);

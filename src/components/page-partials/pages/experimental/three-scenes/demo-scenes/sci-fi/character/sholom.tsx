import { useGLTF } from "@react-three/drei";
import { JSX } from "react";
import { Mesh } from "three";

const pathModel = "/3d-models/sci-fi/sholom.glb";
const helmetOrigin: [number, number, number] = [0, -2.067, -6.745];

type SholomModelProps = JSX.IntrinsicElements["group"] & {
  centered?: boolean;
};

export function SholomModel({ centered = false, ...props }: SholomModelProps) {
  const { nodes, materials } = useGLTF(pathModel);
  return (
    <group {...props} dispose={null}>
      <group position={centered ? helmetOrigin : undefined}>
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.helmet001 as Mesh).geometry}
          material={materials["Scratched Metal"]}
          position={[0, 2.067, 6.745]}
          rotation={[Math.PI, 0, Math.PI]}
          scale={0.011}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Sphere009 as Mesh).geometry}
          material={materials["Scratched Metal"]}
          position={[-0.096, 2.178, 6.702]}
          rotation={[-2.998, 0.467, 2.632]}
          scale={[0.243, 0.156, 0.243]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Sphere010 as Mesh).geometry}
          material={materials["Scratched Metal"]}
          position={[-0.001, 2.135, 6.542]}
          rotation={[1.871, 0.825, 3.061]}
          scale={[0.146, 0.094, 0.146]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Sphere011 as Mesh).geometry}
          material={materials["Scratched Metal"]}
          position={[-0.001, 2.163, 6.566]}
          rotation={[2.609, 0.793, 3.101]}
          scale={[0.146, 0.094, 0.146]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Sphere030 as Mesh).geometry}
          material={materials["Scratched Metal"]}
          position={[-0.002, 2.176, 6.6]}
          rotation={[2.877, 0.787, 3.118]}
          scale={[0.146, 0.094, 0.146]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Sphere031 as Mesh).geometry}
          material={materials["Scratched Metal"]}
          position={[-0.002, 2.184, 6.637]}
          rotation={[2.99, 0.785, 3.126]}
          scale={[0.146, 0.094, 0.146]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Sphere032 as Mesh).geometry}
          material={materials["Scratched Metal"]}
          position={[-0.112, 2.142, 6.605]}
          rotation={[-2.558, 0.287, 1.838]}
          scale={[0.146, 0.094, 0.146]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Sphere033 as Mesh).geometry}
          material={materials["Scratched Metal"]}
          position={[-0.11, 2.157, 6.667]}
          rotation={[-2.542, 0.227, 1.823]}
          scale={[0.146, 0.094, 0.146]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Sphere034 as Mesh).geometry}
          material={materials["Scratched Metal"]}
          position={[0.105, 2.146, 6.584]}
          rotation={[2.305, 0.161, -2.419]}
          scale={[0.146, 0.094, 0.146]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Sphere035 as Mesh).geometry}
          material={materials["Scratched Metal"]}
          position={[0.116, 2.127, 6.608]}
          rotation={[2.169, 0.094, -1.678]}
          scale={[0.146, 0.094, 0.146]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Sphere038 as Mesh).geometry}
          material={materials["Scratched Metal"]}
          position={[0.085, 2.175, 6.639]}
          rotation={[2.271, 0.956, -2.328]}
          scale={[0.243, 0.156, 0.243]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Sphere039 as Mesh).geometry}
          material={materials["Scratched Metal"]}
          position={[0.096, 2.179, 6.704]}
          rotation={[2.287, 0.954, -2.289]}
          scale={[0.243, 0.156, 0.243]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Sphere040 as Mesh).geometry}
          material={materials["Scratched Metal"]}
          position={[0.003, 2.073, 6.953]}
          rotation={[-1.525, -0.247, -3.137]}
          scale={[0.49, 0.315, 0.49]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Sphere041 as Mesh).geometry}
          material={materials["Scratched Metal"]}
          position={[-0.116, 2.138, 6.712]}
          rotation={[-2.515, 0.076, 1.662]}
          scale={[0.146, 0.094, 0.146]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Sphere042 as Mesh).geometry}
          material={materials["Scratched Metal"]}
          position={[-0.117, 2.127, 6.656]}
          rotation={[-2.516, 0.084, 1.666]}
          scale={[0.146, 0.094, 0.146]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Sphere043 as Mesh).geometry}
          material={materials["Scratched Metal"]}
          position={[-0.055, 2.133, 6.547]}
          rotation={[2.106, 0.783, 2.729]}
          scale={[0.243, 0.156, 0.243]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Sphere044 as Mesh).geometry}
          material={materials["Scratched Metal"]}
          position={[0.059, 2.134, 6.549]}
          rotation={[1.507, 0.783, -2.729]}
          scale={[0.243, 0.156, 0.243]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Sphere045 as Mesh).geometry}
          material={materials["Scratched Metal"]}
          position={[0.069, 2.165, 6.584]}
          rotation={[2.408, 1.039, -2.748]}
          scale={[0.243, 0.156, 0.243]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Sphere046 as Mesh).geometry}
          material={materials["Scratched Metal"]}
          position={[-0.003, 2.194, 6.712]}
          rotation={[3.042, 0.784, 3.129]}
          scale={[0.146, 0.094, 0.146]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Sphere047 as Mesh).geometry}
          material={materials["Scratched Metal"]}
          position={[-0.101, 2.115, 6.565]}
          rotation={[-2.415, 0.697, 1.168]}
          scale={[0.146, 0.094, 0.146]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Sphere048 as Mesh).geometry}
          material={materials["Scratched Metal"]}
          position={[0.117, 2.093, 6.684]}
          rotation={[2.153, -0.021, -1.563]}
          scale={[0.146, 0.094, 0.146]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Sphere049 as Mesh).geometry}
          material={materials["Scratched Metal"]}
          position={[0.116, 2.129, 6.657]}
          rotation={[2.158, 0.095, -1.651]}
          scale={[0.146, 0.094, 0.146]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Sphere050 as Mesh).geometry}
          material={materials["Scratched Metal"]}
          position={[-0.117, 2.089, 6.636]}
          rotation={[-2.513, -0.029, 1.528]}
          scale={[0.146, 0.094, 0.146]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Sphere051 as Mesh).geometry}
          material={materials["Scratched Metal"]}
          position={[0.112, 2.153, 6.679]}
          rotation={[2.279, 0.233, -1.817]}
          scale={[0.146, 0.094, 0.146]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Sphere052 as Mesh).geometry}
          material={materials["Scratched Metal"]}
          position={[0.109, 2.154, 6.627]}
          rotation={[2.277, 0.232, -1.843]}
          scale={[0.146, 0.094, 0.146]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Sphere053 as Mesh).geometry}
          material={materials["Scratched Metal"]}
          position={[0.116, 2.089, 6.605]}
          rotation={[2.148, -0.058, -1.554]}
          scale={[0.146, 0.094, 0.146]}
        />
        <mesh
          castShadow
          receiveShadow
          visible={false}
          geometry={(nodes.collision_plane_2 as Mesh).geometry}
          position={[-0.019, 1.58, 6.563]}
          rotation={[1.575, -0.025, -3.124]}
        />
      </group>
    </group>
  );
}

useGLTF.preload(pathModel);

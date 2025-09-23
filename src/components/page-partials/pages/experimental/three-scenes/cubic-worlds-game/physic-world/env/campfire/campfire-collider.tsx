import { JSX } from "react";
import { publicModelPath } from "../../../config/3d-model.config";
import { useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import { Mesh } from "three";

type Props = JSX.IntrinsicElements["group"] & {};

const path = publicModelPath("campfire_collider.glb");

const CampfireCollider = ({ ...props }: Props) => {
  const { nodes } = useGLTF(path);
  return (
    <group {...props} dispose={null}>
      <RigidBody type="fixed" colliders="hull">
        <mesh
          geometry={(nodes.Cylinder as Mesh).geometry}
          position={[2.439, 0.586, 1.636]}
          scale={0.595}
          material-visible={false}
        />

        <mesh
          geometry={(nodes.Cube as Mesh).geometry}
          material-visible={false}
          position={[2.27, 0.537, 2.279]}
          rotation={[-Math.PI, 0.217, -Math.PI]}
          scale={[-0.026, -0.592, -0.026]}
        />
        <mesh
          geometry={(nodes.Cube001 as Mesh).geometry}
          material-visible={false}
          position={[2.531, 0.537, 1.043]}
          rotation={[-Math.PI, 0.217, -Math.PI]}
          scale={[-0.026, -0.592, -0.026]}
        />
        <mesh
          geometry={(nodes.Cube002 as Mesh).geometry}
          material-visible={false}
          position={[2.421, 1.09, 1.665]}
          rotation={[-1.53, 0.209, 2.947]}
          scale={[-0.026, -0.773, -0.026]}
        />
      </RigidBody>
    </group>
  );
};

export default CampfireCollider;

useGLTF.preload(path);

import { useGLTF } from "@react-three/drei";
import { publicModelPath } from "../../../config/3d-model.config";
import { JSX, useEffect, useRef, useState } from "react";
import { Mesh } from "three";
import { RapierRigidBody, RigidBody } from "@react-three/rapier";

const path = publicModelPath("simple-box-distroyed.glb");

type Props = JSX.IntrinsicElements["group"] & {};

const geometryNames = [
  "box_wood026",
  "box_wood017",
  "box_wood018",
  "box_wood019",
  "box_wood020",
  "box_wood021",
  "box_wood022",
  "box_wood023",
  "box_wood024",
  "box_wood025",
  "box_wood027",
  "box_wood028",
  "box_wood029",
  "box_wood030",
  "box_wood031",
  "box_wood032",
  "box_wood033",
  "box_wood034",
  "box_wood035",
  "box_wood036",
  "box_wood037",
];

const BoxDestroyed = ({ ...props }: Props) => {
  const { nodes, materials } = useGLTF(path);
  const rbRef = useRef<RapierRigidBody>(null);
  const [onHide, setOnHide] = useState(false);
  useEffect(() => {
    if (rbRef.current) {
      rbRef.current.setLinvel({ x: 5, y: 5, z: 5 }, true);
      rbRef.current.setAngvel({ x: 5, y: 5, z: 5 }, true);
      setTimeout(() => {
        setOnHide(true);
      }, 10000);
    }
  }, [rbRef]);
  return (
    <>
      {!onHide && (
        <group {...props} dispose={null}>
          {geometryNames.map((name) => (
            <RigidBody key={name} ref={rbRef} type="dynamic" colliders="cuboid">
              <mesh
                geometry={(nodes[name] as Mesh).geometry}
                material={materials.box_darken}
              />
            </RigidBody>
          ))}
        </group>
      )}
    </>
  );
};

export default BoxDestroyed;
useGLTF.preload(path);

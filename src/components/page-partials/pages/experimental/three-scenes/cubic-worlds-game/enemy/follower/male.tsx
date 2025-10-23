import { useGLTF } from "@react-three/drei";
import { JSX } from "react";
import { publicModelPath } from "../../config/3d-model.config";
import { Mesh, SkinnedMesh } from "three";

type Props = JSX.IntrinsicElements["group"] & {};

const path = publicModelPath("male.glb");

export function MaleModel(props: Props) {
  const { nodes, materials } = useGLTF(path);
  return (
    <group {...props} dispose={null}>
      <skinnedMesh
        name="human_male001"
        geometry={(nodes.human_male001 as Mesh).geometry}
        material={materials.male_bake}
        skeleton={(nodes.human_male001 as SkinnedMesh).skeleton}
        morphTargetDictionary={
          (nodes.human_male001 as SkinnedMesh).morphTargetDictionary
        }
        morphTargetInfluences={
          (nodes.human_male001 as SkinnedMesh).morphTargetInfluences
        }
      />
      <primitive object={nodes.rig_male_root} />
      <primitive object={nodes.rig_male_hand_IK_L} />
      <primitive object={nodes.rig_male_foot_IK_L} />
      <primitive object={nodes.rig_male_hand_IK_R} />
      <primitive object={nodes.rig_male_foot_IK_R} />
    </group>
  );
}

useGLTF.preload(path);

import { JSX, useRef } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { Group, SkinnedMesh } from "three";

const characterPath = "/3d-models/sci-fi/character.glb";

export function Character(props: JSX.IntrinsicElements["group"]) {
  const group = useRef<Group>(null);
  const { nodes, materials, animations } = useGLTF(characterPath);
  const { actions } = useAnimations(animations, group);
  return (
    <group ref={group} {...props} dispose={null}>
      <group name="Scene">
        <group
          name="Armature008"
          position={[0, 0.055, 13.821]}
          rotation={[Math.PI / 2, 0, Math.PI]}
          scale={0.011}
        >
          <skinnedMesh
            name="human001"
            geometry={(nodes.human001 as SkinnedMesh).geometry}
            material={materials.Skin}
            skeleton={(nodes.human001 as SkinnedMesh).skeleton}
          />
          <skinnedMesh
            name="l_manb001"
            geometry={(nodes.l_manb001 as SkinnedMesh).geometry}
            material={materials["L_m_default.007"]}
            skeleton={(nodes.l_manb001 as SkinnedMesh).skeleton}
          />
          <primitive object={nodes.mixamorigHips} />
        </group>
      </group>
    </group>
  );
}
useGLTF.preload(characterPath);

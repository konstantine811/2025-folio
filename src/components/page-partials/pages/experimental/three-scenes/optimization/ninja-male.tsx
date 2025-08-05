import { useAnimations, useGLTF } from "@react-three/drei";
import { JSX, useEffect, useRef } from "react";
import { Group, SkinnedMesh } from "three";

const NinjaMale = ({ props }: { props?: JSX.IntrinsicElements["group"] }) => {
  const group = useRef<Group>(null);
  const { nodes, materials, animations } = useGLTF(
    "/3d-models/characters/Ninja_Male_Hair.gltf"
  );
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    if (actions) {
      actions["Run"]?.play();
    }
  }, [actions]); // Play the "Run" animation when the component mounts
  return (
    <group ref={group} {...props} dispose={null}>
      <group name="Scene">
        <group name="CharacterArmature">
          <primitive object={nodes.Bone} />
          <group name="Body_1">
            <skinnedMesh
              name="Cube004"
              geometry={(nodes.Cube004 as SkinnedMesh).geometry}
              material={materials.Skin}
              skeleton={(nodes.Cube004 as SkinnedMesh).skeleton}
            />
            <skinnedMesh
              name="Cube004_1"
              geometry={(nodes.Cube004_1 as SkinnedMesh).geometry}
              material={materials.Main}
              skeleton={(nodes.Cube004_1 as SkinnedMesh).skeleton}
            />
            <skinnedMesh
              name="Cube004_2"
              geometry={(nodes.Cube004_2 as SkinnedMesh).geometry}
              material={materials.Details}
              skeleton={(nodes.Cube004_2 as SkinnedMesh).skeleton}
            />
            <skinnedMesh
              name="Cube004_3"
              geometry={(nodes.Cube004_3 as SkinnedMesh).geometry}
              material={materials.Grey}
              skeleton={(nodes.Cube004_3 as SkinnedMesh).skeleton}
            />
            <skinnedMesh
              name="Cube004_4"
              geometry={(nodes.Cube004_4 as SkinnedMesh).geometry}
              material={materials.Face}
              skeleton={(nodes.Cube004_4 as SkinnedMesh).skeleton}
            />
            <skinnedMesh
              name="Cube004_5"
              geometry={(nodes.Cube004_5 as SkinnedMesh).geometry}
              material={materials.Hair}
              skeleton={(nodes.Cube004_5 as SkinnedMesh).skeleton}
            />
          </group>
        </group>
      </group>
    </group>
  );
};

export default NinjaMale;

useGLTF.preload("/3d-models/characters/Ninja_Male_Hair.gltf");

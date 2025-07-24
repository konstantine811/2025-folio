import { useAnimations, useGLTF } from "@react-three/drei";
import { JSX, useEffect, useRef } from "react";
import { Group, SkinnedMesh } from "three";

const Witch = ({ props }: { props: JSX.IntrinsicElements["group"] }) => {
  const group = useRef<Group>(null);
  const { nodes, materials, animations } = useGLTF(
    "/3d-models/postprocessing-model/Witch.gltf"
  );
  const { actions } = useAnimations(animations, group);

  const animation = "Idle";

  useEffect(() => {
    if (actions[animation]) {
      actions[animation].fadeIn(0.5).play();
    }
    return () => {
      if (actions[animation]) {
        actions[animation].fadeOut(0.5);
      }
    };
  }, [animation, actions]);
  return (
    <group ref={group} {...props} dispose={null}>
      <group name="Scene">
        <group name="CharacterArmature">
          <primitive object={nodes.Root} />
          <group name="Witch_Body">
            <skinnedMesh
              name="Cube040"
              geometry={(nodes.Cube040 as SkinnedMesh).geometry}
              material={materials.Skin}
              skeleton={(nodes.Cube040 as SkinnedMesh).skeleton}
            />
            <skinnedMesh
              name="Cube040_1"
              geometry={(nodes.Cube040_1 as SkinnedMesh).geometry}
              material={materials.Brown2}
              skeleton={(nodes.Cube040_1 as SkinnedMesh).skeleton}
            />
            <skinnedMesh
              name="Cube040_2"
              geometry={(nodes.Cube040_2 as SkinnedMesh).geometry}
              material={materials.Purple}
              skeleton={(nodes.Cube040_2 as SkinnedMesh).skeleton}
            />
            <skinnedMesh
              name="Cube040_3"
              geometry={(nodes.Cube040_3 as SkinnedMesh).geometry}
              material={materials.Gold}
              skeleton={(nodes.Cube040_3 as SkinnedMesh).skeleton}
            />
          </group>
          <skinnedMesh
            name="Witch_Feet"
            geometry={(nodes.Witch_Feet as SkinnedMesh).geometry}
            material={materials.Brown2}
            skeleton={(nodes.Witch_Feet as SkinnedMesh).skeleton}
          />
          <group name="Witch_Head">
            <skinnedMesh
              name="Cube014"
              geometry={(nodes.Cube014 as SkinnedMesh).geometry}
              material={materials.Skin}
              skeleton={(nodes.Cube014 as SkinnedMesh).skeleton}
            />
            <skinnedMesh
              name="Cube014_1"
              geometry={(nodes.Cube014_1 as SkinnedMesh).geometry}
              material={materials.Purple}
              skeleton={(nodes.Cube014_1 as SkinnedMesh).skeleton}
            />
            <skinnedMesh
              name="Cube014_2"
              geometry={(nodes.Cube014_2 as SkinnedMesh).geometry}
              material={materials.Brown}
              skeleton={(nodes.Cube014_2 as SkinnedMesh).skeleton}
            />
            <skinnedMesh
              name="Cube014_3"
              geometry={(nodes.Cube014_3 as SkinnedMesh).geometry}
              material={materials.Gold}
              skeleton={(nodes.Cube014_3 as SkinnedMesh).skeleton}
            />
            <skinnedMesh
              name="Cube014_4"
              geometry={(nodes.Cube014_4 as SkinnedMesh).geometry}
              material={materials.Hair_Black}
              skeleton={(nodes.Cube014_4 as SkinnedMesh).skeleton}
            />
          </group>
          <group name="Witch_Legs">
            <skinnedMesh
              name="Cube011"
              geometry={(nodes.Cube011 as SkinnedMesh).geometry}
              material={materials.Purple}
              skeleton={(nodes.Cube011 as SkinnedMesh).skeleton}
            />
            <skinnedMesh
              name="Cube011_1"
              geometry={(nodes.Cube011_1 as SkinnedMesh).geometry}
              material={materials.Brown}
              skeleton={(nodes.Cube011_1 as SkinnedMesh).skeleton}
            />
            <skinnedMesh
              name="Cube011_2"
              geometry={(nodes.Cube011_2 as SkinnedMesh).geometry}
              material={materials.Gold}
              skeleton={(nodes.Cube011_2 as SkinnedMesh).skeleton}
            />
          </group>
        </group>
      </group>
    </group>
  );
};

export default Witch;

useGLTF.preload("/3d-models/postprocessing-model/Witch.gltf");

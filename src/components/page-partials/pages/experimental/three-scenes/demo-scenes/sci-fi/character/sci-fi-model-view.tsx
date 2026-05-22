import { RefObject } from "react";
import {
  Group,
  Material,
  Object3D,
  Object3DEventMap,
  SkinnedMesh,
} from "three";

type SciFiCharacterModelViewProps = {
  modelRootRef: RefObject<Group | null>;
  nodes: Record<string, Object3D<Object3DEventMap>>;
  materials: Record<string, Material>;
  modelRotationY?: number;
};

export function SciFiCharacterModelView({
  modelRootRef,
  nodes,
  materials,
  modelRotationY = 0,
}: SciFiCharacterModelViewProps) {
  return (
    <group ref={modelRootRef} name="Scene">
      <group rotation={[0, modelRotationY, 0]}>
        <group
          name="Armature008"
          position={[0, 0, 0]}
          rotation={[Math.PI / 2, 0, 0]}
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

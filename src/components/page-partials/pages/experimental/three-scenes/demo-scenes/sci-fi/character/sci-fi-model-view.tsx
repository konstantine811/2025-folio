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
        <group name="Armature">
          <skinnedMesh
            name="human"
            geometry={(nodes.human as SkinnedMesh).geometry}
            material={materials["Skin.002"]}
            skeleton={(nodes.human as SkinnedMesh).skeleton}
          />
          <skinnedMesh
            name="l_manb"
            geometry={(nodes.l_manb as SkinnedMesh).geometry}
            material={materials.L_m_default}
            skeleton={(nodes.l_manb as SkinnedMesh).skeleton}
          />
          <primitive object={nodes.mixamorigHips} />
        </group>
      </group>
    </group>
  );
}

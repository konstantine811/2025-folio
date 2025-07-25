import { useAnimations, useGLTF } from "@react-three/drei";
import { JSX, useEffect, useRef } from "react";
import { Group, MeshStandardMaterial, SkinnedMesh } from "three";

const MedievalFantasyBook = ({
  props,
  envMapIntensity = 0.3,
}: {
  props?: JSX.IntrinsicElements["group"];
  envMapIntensity?: number;
}) => {
  const group = useRef<Group>(null);
  const { nodes, materials, animations } = useGLTF(
    "/3d-models/theatre-js-model/medieval_fantasy_book.glb"
  );
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    if (actions && actions["The Life"]) {
      actions["The Life"].play();
      Object.values(materials).forEach((material) => {
        const mat = material as MeshStandardMaterial;
        mat.envMapIntensity = envMapIntensity;
      });
    }
  });
  return (
    <group ref={group} {...props} dispose={null}>
      <group name="Scene">
        <group name="Sketchfab_model" rotation={[-Math.PI / 2, 0, 0]}>
          <group
            name="dad255dd2cf24ae0bb357684e49722b4fbx"
            rotation={[Math.PI / 2, 0, 0]}
          >
            <group name="Object_2">
              <group name="RootNode">
                <group
                  name="flag"
                  position={[-11.513, 12.497, -6.752]}
                  rotation={[-Math.PI / 2, 0, -Math.PI / 6]}
                >
                  <group name="Object_17" position={[-7.262, 9.035, -8.16]}>
                    <mesh
                      name="0"
                      geometry={(nodes["0"] as SkinnedMesh).geometry}
                      material={materials["Texture-base"]}
                      morphTargetDictionary={
                        (nodes["0"] as SkinnedMesh).morphTargetDictionary
                      }
                      morphTargetInfluences={
                        (nodes["0"] as SkinnedMesh).morphTargetInfluences
                      }
                      castShadow
                      receiveShadow
                    />
                  </group>
                </group>
                <group
                  name="flag-second"
                  position={[-11.494, 12.552, -26.245]}
                  rotation={[-Math.PI / 2, 0, 0]}
                >
                  <group name="Object_20" position={[-7.262, 9.035, -8.16]}>
                    <mesh
                      name="1"
                      geometry={(nodes["1"] as SkinnedMesh).geometry}
                      material={materials["Texture-base"]}
                      morphTargetDictionary={
                        (nodes["1"] as SkinnedMesh).morphTargetDictionary
                      }
                      morphTargetInfluences={
                        (nodes["1"] as SkinnedMesh).morphTargetInfluences
                      }
                      castShadow
                      receiveShadow
                    />
                  </group>
                </group>
                <group
                  name="deers"
                  position={[-23.122, -0.049, 14.878]}
                  rotation={[-Math.PI / 2, 0, 0]}
                >
                  <group name="Object_26" position={[4.328, 30.387, 4.387]}>
                    <mesh
                      name="deers_Texture-base_0"
                      geometry={
                        (nodes["deers_Texture-base_0"] as SkinnedMesh).geometry
                      }
                      material={materials["Texture-base"]}
                      castShadow
                      receiveShadow
                    />
                  </group>
                </group>
                <group
                  name="Scene_1"
                  position={[-4.794, 0, 0.278]}
                  rotation={[-Math.PI / 2, 0, 0]}
                >
                  <group
                    name="Mill-water-wheel"
                    position={[3.708, -15.395, -0.444]}
                    rotation={[-1.92, 0, 0]}
                  >
                    <group name="Object_14" position={[-17.708, 31.183, 4.781]}>
                      <mesh
                        name="Mill-water-wheel_Texture-base_0"
                        geometry={
                          (
                            nodes[
                              "Mill-water-wheel_Texture-base_0"
                            ] as SkinnedMesh
                          ).geometry
                        }
                        material={materials["Texture-base"]}
                        castShadow
                        receiveShadow
                      />
                    </group>
                  </group>
                  <group
                    name="Mill-wind-wheel"
                    position={[-35.783, -27.192, 3.888]}
                    rotation={[0.445, -0.447, -0.498]}
                  >
                    <group
                      name="Object_11"
                      position={[-8.253, 39.884, -25.75]}
                      rotation={[-0.607, 0.138, 0.644]}
                    >
                      <mesh
                        name="Mill-wind-wheel_Texture-base_0"
                        geometry={
                          (
                            nodes[
                              "Mill-wind-wheel_Texture-base_0"
                            ] as SkinnedMesh
                          ).geometry
                        }
                        material={materials["Texture-base"]}
                        castShadow
                        receiveShadow
                      />
                    </group>
                  </group>
                  <group name="Object_5" position={[-14, 15.788, 4.337]}>
                    <mesh
                      name="Scene_Book-tittle_0"
                      geometry={
                        (nodes["Scene_Book-tittle_0"] as SkinnedMesh).geometry
                      }
                      material={materials["Book-tittle"]}
                      castShadow
                      receiveShadow
                    />
                    <mesh
                      name="Scene_Texture-base-gloss-jpg_0"
                      geometry={
                        (nodes["Scene_Texture-base-gloss-jpg_0"] as SkinnedMesh)
                          .geometry
                      }
                      material={materials["Texture-base-gloss-jpg"]}
                      castShadow
                      receiveShadow
                    />
                    <mesh
                      name="Scene_Texture-base_0"
                      geometry={
                        (nodes["Scene_Texture-base_0"] as SkinnedMesh).geometry
                      }
                      material={materials["Texture-base"]}
                      castShadow
                      receiveShadow
                    />
                    <mesh
                      name="Scene_Texture-base_0001"
                      geometry={
                        (nodes["Scene_Texture-base_0001"] as SkinnedMesh)
                          .geometry
                      }
                      material={materials["Texture-base"]}
                      castShadow
                      receiveShadow
                    />
                  </group>
                </group>
                <group
                  name="Waterfall"
                  position={[-4.794, 0, 0.351]}
                  rotation={[-Math.PI / 2, 0, 0]}
                >
                  <group name="Object_23" position={[-14, 15.788, 4.337]}>
                    <mesh
                      name="Waterfall_Texture-base-gloss-jpg_0"
                      geometry={
                        (
                          nodes[
                            "Waterfall_Texture-base-gloss-jpg_0"
                          ] as SkinnedMesh
                        ).geometry
                      }
                      material={materials["Texture-base-gloss-jpg"]}
                      castShadow
                      receiveShadow
                    />
                  </group>
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
};

export default MedievalFantasyBook;

useGLTF.preload("/3d-models/theatre-js-model/medieval_fantasy_book.glb");

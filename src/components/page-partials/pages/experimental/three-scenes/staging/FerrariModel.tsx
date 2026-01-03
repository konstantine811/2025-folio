import { useGLTF } from "@react-three/drei";
import { JSX } from "react";
import { SkinnedMesh } from "three";

function FerrariModel(props: JSX.IntrinsicElements["group"]) {
  const { nodes, materials } = useGLTF(
    "/3d-models/cars/1991_ferrari_512_tr/scene.gltf"
  );
  return (
    <group {...props} dispose={null}>
      <group scale={1}>
        <primitive object={nodes._rootJoint} />
        <group position={[0, 0.118, 0]}>
          <mesh
            castShadow
            receiveShadow
            geometry={
              (
                nodes.fWindow_Geo_lodA_Window_Geo_lodA_Ferrari_512TR_1991Window_Material_fFerrari_512TR_1991Window_Material1_0 as SkinnedMesh
              ).geometry
            }
            material={materials.fFerrari_512TR_1991Window_Material1}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={
              (
                nodes.fWindow_Geo_lodA_Window_Geo_lodA_Ferrari_512TR_1991Window_Material_orange_glass_0 as SkinnedMesh
              ).geometry
            }
            material={materials.orange_glass}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={
              (
                nodes.fWindow_Geo_lodA_Window_Geo_lodA_Ferrari_512TR_1991Window_Material_red_glass_0 as SkinnedMesh
              ).geometry
            }
            material={materials.red_glass}
          />
        </group>
        <mesh
          castShadow
          receiveShadow
          geometry={
            (
              nodes.fEngine_Geo_lodA_Engine_Geo_lodA_Ferrari_512TR_1991EngineA_Material_fFerrari_512TR_1991EngineA_Material1_0 as SkinnedMesh
            ).geometry
          }
          material={materials.fFerrari_512TR_1991EngineA_Material1}
          position={[0, 0.118, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={
            (
              nodes.fGrilleNoAlpha8_Geo_lodA_GrilleNoAlpha8_Geo_lodA_Ferrari_512TR_1991GrilleNoAlpha8A_Material_fFerrari_512TR_1991GrilleNoAlpha8A_Material1_0 as SkinnedMesh
            ).geometry
          }
          material={materials.fFerrari_512TR_1991GrilleNoAlpha8A_Material1}
          position={[0, 0.118, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={
            (
              nodes.fPaint_Geo_lodA_Paint_Geo_lodA_Ferrari_512TR_1991Paint_Material_fFerrari_512TR_1991Paint_Material1_0 as SkinnedMesh
            ).geometry
          }
          material={materials.fFerrari_512TR_1991Paint_Material1}
          position={[0, 0.118, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={
            (
              nodes.fTextured_Geo_lodA_Textured_Geo_lodA_Ferrari_512TR_1991TexturedA_Material_fFerrari_512TR_1991TexturedA_Material1_0 as SkinnedMesh
            ).geometry
          }
          material={materials.fFerrari_512TR_1991TexturedA_Material1}
          position={[0, 0.118, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={
            (
              nodes.fGrilleNoAlpha4_Geo_lodA_GrilleNoAlpha4_Geo_lodA_Ferrari_512TR_1991GrilleNoAlpha4A_Material_fFerrari_512TR_1991GrilleNoAlpha4A_Material1_0 as SkinnedMesh
            ).geometry
          }
          material={materials.fFerrari_512TR_1991GrilleNoAlpha4A_Material1}
          position={[0, 1.198, 0.413]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={
            (
              nodes.fBadge_Geo_lodA_Badge_Geo_lodA_Ferrari_512TR_1991BadgeA_Material_fFerrari_512TR_1991BadgeA_Material1_0 as SkinnedMesh
            ).geometry
          }
          material={materials.fFerrari_512TR_1991BadgeA_Material1}
          position={[0, 0.118, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={
            (
              nodes.fGrilleAlpha1_Geo_lodA_GrilleAlpha1_Geo_lodA_Ferrari_512TR_1991GrilleAlpha1A_Material_fFerrari_512TR_1991GrilleAlpha1A_Material1_0 as SkinnedMesh
            ).geometry
          }
          material={materials.fFerrari_512TR_1991GrilleAlpha1A_Material1}
          position={[0, 0.118, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={
            (
              nodes.fGrilleNoAlpha5_Geo_lodA_GrilleNoAlpha5_Geo_lodA_Ferrari_512TR_1991GrilleNoAlpha5A_Material_fFerrari_512TR_1991GrilleNoAlpha5A_Material1_0 as SkinnedMesh
            ).geometry
          }
          material={materials.fFerrari_512TR_1991GrilleNoAlpha5A_Material1}
          position={[0, 0.118, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={
            (
              nodes.fGrilleNoAlpha9_Geo_lodA_GrilleNoAlpha9_Geo_lodA_Ferrari_512TR_1991GrilleNoAlpha9A_Material_fFerrari_512TR_1991GrilleNoAlpha9A_Material1_0 as SkinnedMesh
            ).geometry
          }
          material={materials.fFerrari_512TR_1991GrilleNoAlpha9A_Material1}
          position={[0, 0.118, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={
            (
              nodes.fWindowInside_Geo_lodA_WindowInside_Geo_lodA_Ferrari_512TR_1991WindowInside_Material_fFerrari_512TR_1991Window_Material1_0 as SkinnedMesh
            ).geometry
          }
          material={materials.fFerrari_512TR_1991Window_Material1}
          position={[0, 0.118, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={
            (
              nodes.fBase_Geo_lodA_Base_Geo_lodA_Ferrari_512TR_1991Base_Material_fFerrari_512TR_1991Base_Material1_0 as SkinnedMesh
            ).geometry
          }
          material={materials.fFerrari_512TR_1991Base_Material1}
          position={[0, 0.118, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={
            (
              nodes.fGrilleAlpha2_Geo_lodA_GrilleAlpha2_Geo_lodA_Ferrari_512TR_1991GrilleAlpha2A_Material_fFerrari_512TR_1991GrilleAlpha2A_Material1_0 as SkinnedMesh
            ).geometry
          }
          material={materials.fFerrari_512TR_1991GrilleAlpha2A_Material1}
          position={[0, 0.118, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={
            (
              nodes.fGrilleNoAlpha6_Geo_lodA_GrilleNoAlpha6_Geo_lodA_Ferrari_512TR_1991GrilleNoAlpha6A_Material_fFerrari_512TR_1991GrilleNoAlpha6A_Material1_0 as SkinnedMesh
            ).geometry
          }
          material={materials.fFerrari_512TR_1991GrilleNoAlpha6A_Material1}
          position={[0, 0.118, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={
            (
              nodes.fInteriorTillingColourZone_Geo_lodA_InteriorTillingColourZone_Geo_lodA_Ferrari_512TR_1991InteriorTillingColourZoneA_Material_fFerrari_512TR_1991InteriorTillingColourZoneA_Material1_0 as SkinnedMesh
            ).geometry
          }
          material={
            materials.fFerrari_512TR_1991InteriorTillingColourZoneA_Material1
          }
          position={[0, 0.118, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={
            (
              nodes.fLight_Geo_lodA_Light_Geo_lodA_Ferrari_512TR_1991LightA_Material_fFerrari_512TR_1991LightA_Material1_0 as SkinnedMesh
            ).geometry
          }
          material={materials.fFerrari_512TR_1991LightA_Material1}
          position={[0, 0.118, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={
            (
              nodes.fColoured_Geo_lodA_Coloured_Geo_lodA_Ferrari_512TR_1991Coloured_Material_fFerrari_512TR_1991Coloured_Material1_0 as SkinnedMesh
            ).geometry
          }
          material={materials.fFerrari_512TR_1991Coloured_Material1}
          position={[0, 0.118, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={
            (
              nodes.fGrilleNoAlpha3_Geo_lodA_GrilleNoAlpha3_Geo_lodA_Ferrari_512TR_1991GrilleNoAlpha3A_Material_fFerrari_512TR_1991GrilleNoAlpha3A_Material1_0 as SkinnedMesh
            ).geometry
          }
          material={materials.fFerrari_512TR_1991GrilleNoAlpha3A_Material1}
          position={[0, 0.118, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={
            (
              nodes.fGrilleNoAlpha7_Geo_lodA_GrilleNoAlpha7_Geo_lodA_Ferrari_512TR_1991GrilleNoAlpha7A_Material_fFerrari_512TR_1991GrilleNoAlpha7A_Material1_0 as SkinnedMesh
            ).geometry
          }
          material={materials.fFerrari_512TR_1991GrilleNoAlpha7A_Material1}
          position={[0, 0.118, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={
            (
              nodes.fInterior_Geo_lodA_Interior_Geo_lodA_Ferrari_512TR_1991InteriorA_Material_fFerrari_512TR_1991InteriorA_Material1_0 as SkinnedMesh
            ).geometry
          }
          material={materials.fFerrari_512TR_1991InteriorA_Material1}
          position={[0, 0.118, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={
            (
              nodes.fManufacturerPlate_Geo_lodA_ManufacturerPlate_Geo_lodA_Ferrari_512TR_1991ManufacturerPlateA_Material_fFerrari_512TR_1991ManufacturerPlateA_Material1_0 as SkinnedMesh
            ).geometry
          }
          material={materials.fFerrari_512TR_1991ManufacturerPlateA_Material1}
          position={[0, 0.118, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={
            (
              nodes.fSeatBelt_Geo_lodA_SeatBelt_Geo_lodA_Ferrari_512TR_1991SeatBelt_Material_fFerrari_512TR_1991Coloured_Material1_0 as SkinnedMesh
            ).geometry
          }
          material={materials.fFerrari_512TR_1991Coloured_Material1}
          position={[0, 0.118, 0]}
        />
      </group>
    </group>
  );
}

useGLTF.preload("/3d-models/cars/1991_ferrari_512_tr/scene.gltf");
export default FerrariModel;

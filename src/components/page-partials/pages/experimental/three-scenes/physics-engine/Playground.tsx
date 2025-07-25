import { useGLTF } from "@react-three/drei";
import {
  CuboidCollider,
  RapierRigidBody,
  RigidBody,
} from "@react-three/rapier";
import { JSX, useEffect, useRef } from "react";
import { SkinnedMesh } from "three";

interface Props {
  props?: JSX.IntrinsicElements["group"];
}

export function Playground({ props }: Props) {
  const { nodes, materials } = useGLTF(
    "/3d-models/physics-train-model/playground.glb"
  );
  const swiper = useRef<RapierRigidBody>(null);

  useEffect(() => {
    if (swiper.current) {
      swiper.current.setAngvel({ x: 0, y: 3, z: 0 }, true);
    }
  }, []);
  return (
    <group {...props} dispose={null}>
      <RigidBody type="fixed" name="ground" colliders="trimesh">
        <group name="button_teamYellow" position={[-39.612, -0.038, -27.712]}>
          <mesh
            receiveShadow
            castShadow
            name="Cube1548"
            geometry={(nodes.Cube1548 as SkinnedMesh).geometry}
            material={materials["Yellow.032"]}
          />
          <mesh
            receiveShadow
            castShadow
            name="Cube1548_1"
            geometry={(nodes.Cube1548_1 as SkinnedMesh).geometry}
            material={materials["Metal.065"]}
          />
        </group>
        <group
          name="flag_teamYellow"
          position={[-39.987, -0.145, -25.53]}
          rotation={[0, -0.548, 0]}
        >
          <mesh
            receiveShadow
            castShadow
            name="Cube1559"
            geometry={(nodes.Cube1559 as SkinnedMesh).geometry}
            material={materials["Yellow.022"]}
          />
          <mesh
            receiveShadow
            castShadow
            name="Cube1559_1"
            geometry={(nodes.Cube1559_1 as SkinnedMesh).geometry}
            material={materials["Brown.012"]}
          />
          <mesh
            receiveShadow
            castShadow
            name="Cube1559_2"
            geometry={(nodes.Cube1559_2 as SkinnedMesh).geometry}
            material={materials["Metal.050"]}
          />
        </group>
        <RigidBody
          type="fixed"
          name="gateIn"
          sensor
          colliders={false}
          position={[-20.325, -0.249, -28.42]}
        >
          <mesh
            receiveShadow
            castShadow
            name="gateLargeWide_teamBlue"
            geometry={(nodes.gateLargeWide_teamBlue as SkinnedMesh).geometry}
            material={materials["Blue.020"]}
            rotation={[0, 1.571, 0]}
          />
          <CuboidCollider position={[-1, 0, 0]} args={[0.5, 2, 1.5]} />
        </RigidBody>
        <mesh
          receiveShadow
          castShadow
          name="gateLargeWide_teamYellow"
          geometry={(nodes.gateLargeWide_teamYellow as SkinnedMesh).geometry}
          material={materials["Yellow.024"]}
          position={[-35.697, -0.141, -27.933]}
          rotation={[0, 1.571, 0]}
        />
        <mesh
          receiveShadow
          castShadow
          name="plantA_forest"
          geometry={(nodes.plantA_forest as SkinnedMesh).geometry}
          material={materials["Green.008"]}
          position={[-2.077, 0.09, 1.102]}
        />
        <mesh
          receiveShadow
          castShadow
          name="plantB_forest"
          geometry={(nodes.plantB_forest as SkinnedMesh).geometry}
          material={materials["Green.009"]}
          position={[2.191, -0.074, -2.562]}
        />
        <mesh
          receiveShadow
          castShadow
          name="rocksB_forest"
          geometry={(nodes.rocksB_forest as SkinnedMesh).geometry}
          material={materials["Stone.001"]}
          position={[-0.454, -0.031, 1.748]}
        />
      </RigidBody>
      <RigidBody
        type="kinematicVelocity"
        colliders="trimesh"
        ref={swiper}
        restitution={3}
        name="swiper"
      >
        <group
          name="swiperDouble_teamRed"
          position={[0.002, -0.106, -21.65]}
          rotation-y={Math.PI / 4}
        >
          <mesh
            receiveShadow
            castShadow
            name="Cylinder051"
            geometry={(nodes.Cylinder051 as SkinnedMesh).geometry}
            material={materials["Brown.004"]}
          />
          <mesh
            receiveShadow
            castShadow
            name="Cylinder051_1"
            geometry={(nodes.Cylinder051_1 as SkinnedMesh).geometry}
            material={materials["Metal.030"]}
          />
          <mesh
            receiveShadow
            castShadow
            name="Cylinder051_2"
            geometry={(nodes.Cylinder051_2 as SkinnedMesh).geometry}
            material={materials["Red.010"]}
          />
          <mesh
            receiveShadow
            castShadow
            name="Cylinder051_3"
            geometry={(nodes.Cylinder051_3 as SkinnedMesh).geometry}
            material={materials["White.005"]}
          />
        </group>
      </RigidBody>
      <RigidBody type="fixed" name="ground" colliders="trimesh">
        <group name="tileHigh_forest" position={[-0.077, -1.023, -15.377]}>
          <mesh
            receiveShadow
            castShadow
            name="Cube1600"
            geometry={(nodes.Cube1600 as SkinnedMesh).geometry}
            material={materials["Green.007"]}
          />
          <mesh
            receiveShadow
            castShadow
            name="Cube1600_1"
            geometry={(nodes.Cube1600_1 as SkinnedMesh).geometry}
            material={materials["BrownDark.019"]}
          />
        </group>
        <group name="tileLarge_forest" position={[0.014, -1.023, -0.209]}>
          <mesh
            receiveShadow
            castShadow
            name="Cube1605"
            geometry={(nodes.Cube1605 as SkinnedMesh).geometry}
            material={materials["Green.001"]}
          />
          <mesh
            receiveShadow
            castShadow
            name="Cube1605_1"
            geometry={(nodes.Cube1605_1 as SkinnedMesh).geometry}
            material={materials["BrownDark.004"]}
          />
        </group>
        <group name="tileLarge_teamBlue" position={[-18.017, -1.023, -28.243]}>
          <mesh
            receiveShadow
            castShadow
            name="Cube1606"
            geometry={(nodes.Cube1606 as SkinnedMesh).geometry}
            material={materials["Blue.001"]}
          />
          <mesh
            receiveShadow
            castShadow
            name="Cube1606_1"
            geometry={(nodes.Cube1606_1 as SkinnedMesh).geometry}
            material={materials["Metal.007"]}
          />
        </group>
        <group name="tileLarge_teamRed" position={[0.068, -1.023, -21.648]}>
          <mesh
            receiveShadow
            castShadow
            name="Cube1607"
            geometry={(nodes.Cube1607 as SkinnedMesh).geometry}
            material={materials["Red.003"]}
          />
          <mesh
            receiveShadow
            castShadow
            name="Cube1607_1"
            geometry={(nodes.Cube1607_1 as SkinnedMesh).geometry}
            material={materials["Metal.008"]}
          />
        </group>
        <group name="tileLarge_teamYellow" position={[-37.85, -1.023, -27.665]}>
          <mesh
            receiveShadow
            castShadow
            name="Cube1608"
            geometry={(nodes.Cube1608 as SkinnedMesh).geometry}
            material={materials["Yellow.004"]}
          />
          <mesh
            receiveShadow
            castShadow
            name="Cube1608_1"
            geometry={(nodes.Cube1608_1 as SkinnedMesh).geometry}
            material={materials["Metal.009"]}
          />
        </group>
        <group name="tileLow_forest" position={[-0.145, -1.023, -6.557]}>
          <mesh
            receiveShadow
            castShadow
            name="Cube1610"
            geometry={(nodes.Cube1610 as SkinnedMesh).geometry}
            material={materials["Green.002"]}
          />
          <mesh
            receiveShadow
            castShadow
            name="Cube1610_1"
            geometry={(nodes.Cube1610_1 as SkinnedMesh).geometry}
            material={materials["BrownDark.006"]}
          />
        </group>
        <group name="tileMedium_teamRed" position={[-11.56, -1.023, -27.446]}>
          <mesh
            receiveShadow
            castShadow
            name="Cube1617"
            geometry={(nodes.Cube1617 as SkinnedMesh).geometry}
            material={materials["Red.005"]}
          />
          <mesh
            receiveShadow
            castShadow
            name="Cube1617_1"
            geometry={(nodes.Cube1617_1 as SkinnedMesh).geometry}
            material={materials["Metal.014"]}
          />
        </group>
        <group
          name="tileSlopeLowHigh_teamRed"
          position={[-8.125, -1.023, -25.431]}
        >
          <mesh
            receiveShadow
            castShadow
            name="Cube1622"
            geometry={(nodes.Cube1622 as SkinnedMesh).geometry}
            material={materials["Red.006"]}
          />
          <mesh
            receiveShadow
            castShadow
            name="Cube1622_1"
            geometry={(nodes.Cube1622_1 as SkinnedMesh).geometry}
            material={materials["Metal.017"]}
          />
        </group>
        <group
          name="tileSlopeLowMedium_teamRed"
          position={[-5.44, -1.023, -21.994]}
        >
          <mesh
            receiveShadow
            castShadow
            name="Cube1624"
            geometry={(nodes.Cube1624 as SkinnedMesh).geometry}
            material={materials["Red.007"]}
          />
          <mesh
            receiveShadow
            castShadow
            name="Cube1624_1"
            geometry={(nodes.Cube1624_1 as SkinnedMesh).geometry}
            material={materials["Metal.019"]}
          />
        </group>
        <group
          name="tileSlopeLowMedium_forest"
          position={[-0.118, -1.023, -10.849]}
        >
          <mesh
            receiveShadow
            castShadow
            name="Cube1626"
            geometry={(nodes.Cube1626 as SkinnedMesh).geometry}
            material={materials["Green.005"]}
          />
          <mesh
            receiveShadow
            castShadow
            name="Cube1626_1"
            geometry={(nodes.Cube1626_1 as SkinnedMesh).geometry}
            material={materials["BrownDark.012"]}
          />
        </group>
        <mesh
          receiveShadow
          castShadow
          name="tree_desert"
          geometry={(nodes.tree_desert as SkinnedMesh).geometry}
          material={materials.GreenDark}
          position={[1.723, -0.125, 1.288]}
          rotation={[0, 0.473, 0]}
        />
        <group name="tree_forest" position={[-1.828, -0.232, -2.041]}>
          <mesh
            receiveShadow
            castShadow
            name="Cylinder067"
            geometry={(nodes.Cylinder067 as SkinnedMesh).geometry}
            material={materials["GreenDark.001"]}
          />
          <mesh
            receiveShadow
            castShadow
            name="Cylinder067_1"
            geometry={(nodes.Cylinder067_1 as SkinnedMesh).geometry}
            material={materials["BrownDark.002"]}
          />
        </group>
      </RigidBody>
    </group>
  );
}

useGLTF.preload("/3d-models/physics-train-model/playground.glb");

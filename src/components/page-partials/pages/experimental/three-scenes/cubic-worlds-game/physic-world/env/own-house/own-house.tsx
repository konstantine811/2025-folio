import { useGLTF } from "@react-three/drei";
import { publicModelPath } from "../../../config/3d-model.config";
import { JSX, useEffect, useMemo, useRef } from "react";
import { Mesh, MeshStandardMaterial } from "three";
import {
  interactionGroups,
  RapierRigidBody,
  RigidBody,
  useRevoluteJoint,
} from "@react-three/rapier";
import { CollisionWorldType } from "../../../../config/collision";
import HouseFurniture from "./house-furniture";
import FireParticle from "../campfire/fire-particle";
import Light from "./light";
import Plants from "./plants";

const path = publicModelPath("own_house.glb");

type Props = JSX.IntrinsicElements["group"] & {};

export default function OwnHouse(props: Props) {
  const { nodes, materials } = useGLTF(path);
  const frameRef = useRef<RapierRigidBody>(null!); // нерухома рама
  const doorRef = useRef<RapierRigidBody>(null!); // динамічні двері

  const { parketMat } = useMemo(() => {
    const parketMat = (materials.parket as MeshStandardMaterial).clone();
    parketMat.roughness = 0.8;
    parketMat.metalness = 0;
    parketMat.color.multiplyScalar(0.2); // 60% яскравості
    return { parketMat };
  }, [materials]);

  const joint = useRevoluteJoint(frameRef, doorRef, [
    [0, 0, 0],
    [0, 0, 0],
    [0, 1, 0],
  ]);

  useEffect(() => {
    if (joint.current) {
      joint.current.setLimits(-Math.PI / 2, Math.PI / 2);
    }
  }, [joint]);
  return (
    <group {...props} dispose={null}>
      <Light position={[-5, 3, 3]} />
      <FireParticle
        position={[-8.65, 0.5, 7.4]}
        smokeDirMin={[-0.1, 1, -0.08]}
      />
      <Plants />
      <HouseFurniture />
      <RigidBody type="fixed" colliders="cuboid">
        <group position={[-6.019, -0.176, 4.877]} scale={[3.922, 3.922, 4.052]}>
          <mesh
            castShadow
            receiveShadow
            geometry={(nodes.Cube061 as Mesh).geometry}
            material={materials.roof}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={(nodes.Cube061_1 as Mesh).geometry}
            material={materials.house_wood}
          />
        </group>

        <mesh
          castShadow
          receiveShadow
          geometry={(nodes._cube_bottom as Mesh).geometry}
          material={materials["wood.001"]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes._cube_bottom002 as Mesh).geometry}
          material={materials["wood.001"]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes._cube_bottom005 as Mesh).geometry}
          material={materials["wood.001"]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes._cube_bottom008 as Mesh).geometry}
          material={materials["wood.001"]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes._cube_bottom009 as Mesh).geometry}
          material={materials["wood.001"]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes._cube_bottom011 as Mesh).geometry}
          material={materials["wood.001"]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes._cube_bottom015 as Mesh).geometry}
          material={materials["wood.001"]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes._cube_bottom017 as Mesh).geometry}
          material={materials["wood.001"]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Cube074 as Mesh).geometry}
          material={materials["bricks.001"]}
        />
      </RigidBody>
      <RigidBody type="fixed" colliders="trimesh">
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.roof as Mesh).geometry}
          material={materials.roof}
        />
      </RigidBody>
      <group position={[-3.1, 1.26, 4.36]}>
        <RigidBody
          ref={frameRef}
          type="fixed"
          colliders={false}
          position={[0, 0, 0]}
        />
        <RigidBody
          ref={doorRef}
          colliders="hull"
          position={[0, 0.15, 0]}
          collisionGroups={interactionGroups(CollisionWorldType.doorHouse, [
            CollisionWorldType.mainCharacter,
          ])}
          mass={70}
          friction={5}
        >
          <mesh
            castShadow
            receiveShadow
            geometry={(nodes._cube_bottom025 as Mesh).geometry}
            material={materials.door_wood}
            rotation={[0, -Math.PI / 2, 0]}
          >
            <mesh
              castShadow
              receiveShadow
              geometry={(nodes._cube_bottom006 as Mesh).geometry}
              material={materials["cube_material.004"]}
              position={[0.972, 1.078, -0.059]}
              rotation={[3.141, 1.474, 0.001]}
              scale={0.009}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={(nodes._cube_bottom026 as Mesh).geometry}
              material={materials["cube_material.004"]}
              position={[0.966, 1.021, -0.125]}
              rotation={[-Math.PI, 1.475, -Math.PI]}
              scale={0.009}
            />
          </mesh>
        </RigidBody>
      </group>
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.sdie_hose as Mesh).geometry}
        material={materials.house_wood}
        position={[-6.023, -0.176, 4.877]}
        scale={3.922}
      >
        <group
          position={[0.565, 1.914, 0.022]}
          rotation={[Math.PI / 2, 0, -Math.PI / 2]}
          scale={0.092}
        >
          <mesh
            castShadow
            receiveShadow
            geometry={(nodes.Cube125 as Mesh).geometry}
            material={materials["cube_material.010"]}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={(nodes.Cube125_1 as Mesh).geometry}
            material={materials["cube_material.011"]}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={(nodes.window_glasses012 as Mesh).geometry}
            material={materials["Material.002"]}
            position={[0.012, 1.92, -0.006]}
            rotation={[Math.PI, -Math.PI / 2, 0]}
            scale={0.912}
          />
        </group>
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.first_side_window001 as Mesh).geometry}
          material={materials["cube_material.009"]}
          position={[1.536, 0.045, -1.244]}
          scale={0.255}
        >
          <mesh
            castShadow
            receiveShadow
            geometry={(nodes.window_glasses001 as Mesh).geometry}
            material={materials["Material.002"]}
          />
        </mesh>
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.first_side_window002 as Mesh).geometry}
          material={materials["cube_material.009"]}
          position={[1.536, 0.045, -1.244]}
          scale={0.255}
        >
          <mesh
            castShadow
            receiveShadow
            geometry={(nodes.window_glasses as Mesh).geometry}
            material={materials["Material.002"]}
          />
        </mesh>
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.first_side_window004 as Mesh).geometry}
          material={materials["cube_material.009"]}
          position={[1.536, 0.045, -1.244]}
          scale={0.255}
        >
          <mesh
            castShadow
            receiveShadow
            geometry={(nodes.window_glasses003 as Mesh).geometry}
            material={materials["Material.002"]}
          />
        </mesh>
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.first_side_window006 as Mesh).geometry}
          material={materials["cube_material.009"]}
          position={[1.536, 0.045, -1.244]}
          scale={0.255}
        >
          <mesh
            castShadow
            receiveShadow
            geometry={(nodes.window_glasses002 as Mesh).geometry}
            material={materials["Material.002"]}
          />
        </mesh>
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.first_side_window009 as Mesh).geometry}
          material={materials["cube_material.009"]}
          position={[1.536, 0.045, -1.244]}
          scale={0.255}
        >
          <mesh
            castShadow
            receiveShadow
            geometry={(nodes.window_glasses004 as Mesh).geometry}
            material={materials["Material.002"]}
          />
        </mesh>
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.first_side_window010 as Mesh).geometry}
          material={materials["cube_material.009"]}
          position={[1.536, 0.045, -1.244]}
          scale={0.255}
        >
          <mesh
            castShadow
            receiveShadow
            geometry={(nodes.window_glasses005 as Mesh).geometry}
            material={materials["Material.002"]}
          />
        </mesh>
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.first_side_window013 as Mesh).geometry}
          material={materials["cube_material.009"]}
          position={[1.536, 0.045, -1.244]}
          scale={0.255}
        >
          <mesh
            castShadow
            receiveShadow
            geometry={(nodes.window_glasses007 as Mesh).geometry}
            material={materials["Material.002"]}
          />
        </mesh>
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.first_side_window014 as Mesh).geometry}
          material={materials["cube_material.009"]}
          position={[1.536, 0.045, -1.244]}
          scale={0.255}
        >
          <mesh
            castShadow
            receiveShadow
            geometry={(nodes.window_glasses006 as Mesh).geometry}
            material={materials["Material.002"]}
          />
        </mesh>
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes._cube_bottom001 as Mesh).geometry}
        material={materials["bricks.001"]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.front_box_side as Mesh).geometry}
        material={materials.house_wood}
        position={[-6.023, -0.176, 4.877]}
      >
        <RigidBody
          type="fixed"
          colliders="trimesh"
          collisionGroups={interactionGroups(CollisionWorldType.doorFrame)}
        >
          <mesh
            castShadow
            receiveShadow
            geometry={(nodes._cube_bottom024 as Mesh).geometry}
            material={materials.cube_material}
            position={[2.917, 2.488, 0.018]}
            scale={[0.777, 1.111, 0.597]}
          />
        </RigidBody>
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.first_side_window017 as Mesh).geometry}
          material={materials["cube_material.009"]}
          position={[2.876, 5.82, 1.77]}
          rotation={[Math.PI, 0, -Math.PI / 2]}
          scale={[0.593, 0.379, 0.593]}
        >
          <mesh
            castShadow
            receiveShadow
            geometry={(nodes.window_glasses010 as Mesh).geometry}
            material={materials["Material.002"]}
            position={[-0.034, 0.014, 0.053]}
            rotation={[-Math.PI, 0, 0]}
            scale={[0.958, 1.501, 0.958]}
          />
        </mesh>
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.first_side_window018 as Mesh).geometry}
          material={materials["cube_material.009"]}
          position={[2.876, 5.82, -1.785]}
          rotation={[Math.PI, 0, -Math.PI / 2]}
          scale={[0.593, 0.379, 0.593]}
        >
          <mesh
            castShadow
            receiveShadow
            geometry={(nodes.window_glasses011 as Mesh).geometry}
            material={materials["Material.002"]}
            position={[-0.034, 0.014, 0.052]}
            rotation={[-Math.PI, 0, 0]}
            scale={[0.958, 1.501, 0.958]}
          />
        </mesh>
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.front_window as Mesh).geometry}
          material={materials["cube_material.006"]}
          position={[2.902, 2.196, -2.521]}
          scale={[0.033, 0.641, 0.971]}
        >
          <mesh
            castShadow
            receiveShadow
            geometry={(nodes.window_glasses008 as Mesh).geometry}
            material={materials["Material.002"]}
            position={[-0.376, 0.981, -0.002]}
            rotation={[0, 0, Math.PI / 2]}
            scale={[0.93, 17.293, 0.908]}
          />
        </mesh>
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.front_window001 as Mesh).geometry}
          material={materials["cube_material.006"]}
          position={[2.902, 2.196, 2.522]}
          scale={[0.033, 0.641, 0.971]}
        >
          <mesh
            castShadow
            receiveShadow
            geometry={(nodes.window_glasses009 as Mesh).geometry}
            material={materials["Material.002"]}
            position={[-0.376, 0.981, 0.002]}
            rotation={[0, 0, Math.PI / 2]}
            scale={[0.93, 17.293, 0.908]}
          />
        </mesh>
      </mesh>
      <RigidBody type="fixed" colliders="trimesh">
        <mesh
          material-visible={false}
          geometry={(nodes.front_box_side_collider as Mesh).geometry}
          position={[-6.023, -0.176, 4.877]}
          scale={3.922}
        />
        <mesh
          geometry={(nodes.sdie_hose_collider as Mesh).geometry}
          material-visible={false}
          position={[-6.023, -0.176, 4.877]}
          scale={3.922}
        />
      </RigidBody>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.ftont_floor as Mesh).geometry}
          material={parketMat}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes._cube_bottom014 as Mesh).geometry}
          material={parketMat}
          position={[-6.53, 1.093, 4.881]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes._cube_bottom036 as Mesh).geometry}
          material={materials["wood.001"]}
        />
      </RigidBody>

      <RigidBody type="fixed" colliders="hull">
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes._cube_bottom030 as Mesh).geometry}
          material={materials["wood.001"]}
        />

        <mesh
          castShadow
          receiveShadow
          geometry={(nodes._cube_bottom032 as Mesh).geometry}
          material={materials["wood.001"]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes._cube_bottom034 as Mesh).geometry}
          material={materials["wood.001"]}
        />
      </RigidBody>
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.stairs_side as Mesh).geometry}
        material={materials["bricks.001"]}
      />
      <RigidBody type="fixed" colliders="trimesh">
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.stairs_floor as Mesh).geometry}
          material={parketMat}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes["3_floor001"] as Mesh).geometry}
          material={parketMat}
          position={[-6.53, 6.59, 4.881]}
          rotation={[-Math.PI, 0, 0]}
          scale={[-3.396, -0.07, -3.916]}
        />
      </RigidBody>

      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.Cube074_1 as Mesh).geometry}
        material={materials.groub}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.Cube074_2 as Mesh).geometry}
        material={materials["black.002"]}
      />
      <RigidBody type="fixed" colliders="trimesh">
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Cube032 as Mesh).geometry}
          material={parketMat}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Cube032_1 as Mesh).geometry}
          material={materials["cube_material.001"]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes["2_floor"] as Mesh).geometry}
          material={parketMat}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Cube040 as Mesh).geometry}
          material={materials["cube_material.001"]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Cube040_1 as Mesh).geometry}
          material={parketMat}
        />
      </RigidBody>
    </group>
  );
}

useGLTF.preload(path);

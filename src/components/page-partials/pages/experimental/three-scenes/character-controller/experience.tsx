import { Physics, RigidBody } from "@react-three/rapier";
import CharacterController from "./controller/character-controller";
import { characterAnimations } from "./config/character-controller.config";
import Ground from "./physics-world/ground";
import { useRef } from "react";
import { Group } from "three";
import { NavMeshDebug } from "./physics-world/nav-second/navmesh/navmesh-debug";
import { useControls } from "leva";
import { NavMeshGenerator } from "./physics-world/nav-second/navmesh/navmesh";
import { init as initRecast } from "recast-navigation";
import { suspend } from "suspend-react";
import { Component, Entity } from "./ecs";

const ps1Char = "/3d-models/characters/major_ps1_character.glb";
// const ghostChar = "/3d-models/folio-scene/adventure_game/ghost_char.glb";

const Experience = () => {
  const navMeshSourceRef = useRef<Group>(null);
  const { isDebug } = useControls({
    isDebug: {
      value: true,
      label: "Debug",
    },
  });

  suspend(async () => {
    await initRecast();
  }, []);
  return (
    <>
      <Physics debug={isDebug} interpolate={false} gravity={[0, -9.81, 0]}>
        <CharacterController
          animationType={characterAnimations}
          modelPath={ps1Char}
        />
        <group
          name="ground"
          userData={{ forNavMesh: true }}
          ref={navMeshSourceRef}
        >
          <Ground />
          <Entity traversable>
            <Component name="rigidBody">
              <RigidBody type="dynamic" position={[0, 10, 0]}>
                <Component name="three">
                  <mesh receiveShadow castShadow>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshBasicMaterial color="red" />
                  </mesh>
                </Component>
              </RigidBody>
            </Component>
          </Entity>
        </group>
        {/* <NavMeshFollowers isDebug={isDebug} /> */}
        <NavMeshGenerator />
      </Physics>

      {isDebug && <NavMeshDebug />}
      {/* <NavMeshBuilder sourceRef={navMeshSourceRef} /> */}
      {/* {isDebug && <NavMeshDebug />} */}
    </>
  );
};

export default Experience;

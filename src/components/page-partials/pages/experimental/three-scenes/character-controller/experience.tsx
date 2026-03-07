import { Physics, RigidBody } from "@react-three/rapier";
import CharacterController from "./controller/character-controller";
import { characterAnimations } from "./config/character-controller.config";
import Ground from "./physics-world/ground";
import { useRef } from "react";
import { Group } from "three";
import NavMeshBuilder from "./physics-world/nav/nav-mesh-builder";
import NavMeshDebug from "./physics-world/nav/nav-mesh-debug";
import NavMeshFollowers from "./physics-world/nav/nav-mesh-followers";

const Experience = () => {
  const navMeshSourceRef = useRef<Group>(null);
  return (
    <>
      <Physics debug={true} interpolate={false} gravity={[0, -9.81, 0]}>
        <CharacterController
          animationType={characterAnimations}
          modelPath="/3d-models/characters/major_ps1_character.glb"
        />
        <group
          name="ground"
          userData={{ forNavMesh: true }}
          ref={navMeshSourceRef}
        >
          <Ground />
          <RigidBody type="dynamic" position={[0, 10, 0]}>
            <mesh receiveShadow castShadow>
              <boxGeometry args={[1, 1, 1]} />
              <meshBasicMaterial color="red" />
            </mesh>
          </RigidBody>
        </group>
        <NavMeshFollowers isDebug />
      </Physics>
      <NavMeshBuilder sourceRef={navMeshSourceRef} />
      {/* <NavMeshDebug /> */}
    </>
  );
};

export default Experience;

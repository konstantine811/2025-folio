import { Environment, useHelper } from "@react-three/drei";

import InitPhysicWorld from "./physic-world/physics-world";
import { useRef } from "react";
import { DirectionalLight, DirectionalLightHelper } from "three";
import Followers from "./enemy/follower/followers";
import NavMeshDebug from "./nav-mesh/nav-mesh-debug";
import useBuildNavMesh from "./nav-mesh/useBuildNavMesh";
// import CrowdEnemy from "./nav-mesh/crowd/crowd-enemy";
// import { SceneObjectName } from "./physic-world/character-controller/config/character.config";
// import GrassWrapper from "./grass/grass-wrapper";

const Experience = () => {
  const dirLight = useRef<DirectionalLight>(null!);
  useHelper(dirLight, DirectionalLightHelper, 1);
  useBuildNavMesh();
  return (
    <>
      <InitPhysicWorld />
      <Followers />
      {/* <CrowdEnemy /> */}
      <NavMeshDebug />
      {/* <GrassWrapper /> */}
      <ambientLight intensity={0} />
      {/* <directionalLight
        name={SceneObjectName.characterLight}
        intensity={1}
        castShadow
        shadow-mapSize={[1024, 1024]}
      ></directionalLight> */}
      <Environment preset="night" />
    </>
  );
};

export default Experience;

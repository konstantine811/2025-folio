import { Environment, useHelper } from "@react-three/drei";

import InitPhysicWorld from "./physic-world/physics-world";
import { useRef } from "react";
import { DirectionalLight, DirectionalLightHelper } from "three";
// import { SceneObjectName } from "./physic-world/character-controller/config/character.config";
// import GrassWrapper from "./grass/grass-wrapper";

const Experience = () => {
  const dirLight = useRef<DirectionalLight>(null!);
  useHelper(dirLight, DirectionalLightHelper, 1);
  return (
    <>
      <InitPhysicWorld />
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

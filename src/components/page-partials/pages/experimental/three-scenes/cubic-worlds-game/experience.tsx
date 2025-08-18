import { Environment, useHelper } from "@react-three/drei";

import InitPhysicWorld from "./physic-world/init";
import { useRef } from "react";
import { DirectionalLight, DirectionalLightHelper } from "three";
import { SceneObjectName } from "./physic-world/controllers/character.config";

const Experience = () => {
  const dirLight = useRef<DirectionalLight>(null!);
  useHelper(dirLight, DirectionalLightHelper, 1);
  return (
    <>
      <InitPhysicWorld />

      <ambientLight intensity={1} />
      <directionalLight
        position={[1, 10, 1]}
        intensity={1}
        name={SceneObjectName.characterLight}
        color={"#FFBF74"}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={1000}
        shadow-camera-near={0.1}
        castShadow
        ref={dirLight}
      />
      <Environment preset="sunset" />
    </>
  );
};

export default Experience;

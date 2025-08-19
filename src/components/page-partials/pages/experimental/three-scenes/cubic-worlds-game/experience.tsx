import { Environment, PerspectiveCamera, useHelper } from "@react-three/drei";

import InitPhysicWorld from "./physic-world/init";
import { useRef } from "react";
import { DirectionalLight, DirectionalLightHelper } from "three";
import { SceneObjectName } from "./physic-world/controllers/config/character.config";

const Experience = () => {
  const dirLight = useRef<DirectionalLight>(null!);
  useHelper(dirLight, DirectionalLightHelper, 1);
  return (
    <>
      <InitPhysicWorld />

      <ambientLight intensity={1} />
      <directionalLight
        name={SceneObjectName.characterLight}
        intensity={0.4}
        castShadow
        shadow-mapSize={[1024, 1024]}
      >
        <PerspectiveCamera
          attach={"shadow-camera"}
          near={55}
          far={86}
          fov={80}
        />
      </directionalLight>

      <Environment preset="sunset" />
    </>
  );
};

export default Experience;

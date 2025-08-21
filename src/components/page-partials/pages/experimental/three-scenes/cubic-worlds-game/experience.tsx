import { Environment, PerspectiveCamera, useHelper } from "@react-three/drei";

import InitPhysicWorld from "./physic-world/init";
import { useRef } from "react";
import { DirectionalLight, DirectionalLightHelper } from "three";
import { SceneObjectName } from "./physic-world/controllers/config/character.config";
import { InfiniteGrass } from "./grass/grass";

const Experience = () => {
  const dirLight = useRef<DirectionalLight>(null!);
  useHelper(dirLight, DirectionalLightHelper, 1);
  return (
    <>
      <InitPhysicWorld />
      <InfiniteGrass
        radius={1}
        tileSize={30}
        density={40} // 15 лез/м^2 ≈ 540 лез/тайл
        seed={20}
        // yAt={(x, z) => 0} // Сюди можна підставити висоту терену, якщо є.
      />
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

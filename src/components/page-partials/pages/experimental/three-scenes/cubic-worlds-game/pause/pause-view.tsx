import { Models } from "../config/3d-model.config";

import { Canvas } from "@react-three/fiber";
import CharacterCloneModel from "../physic-world/character/character-clone";
import { animationSet } from "../physic-world/character-controller/config/character.config";
import { Suspense } from "react";

const PauseView = () => {
  return (
    <>
      <Canvas
        shadows
        camera={{
          position: [-0.623195402509739, 0.9461523129892376, 1.649266368038179],
          fov: 70,
          rotation: [
            -0.07373367621319847, -0.3757265312399425, -0.02709896377665663,
          ],
        }}
      >
        <Suspense fallback={null}>
          <CharacterCloneModel
            path={Models.mainCharacter}
            animation={animationSet.idle}
          />
        </Suspense>
      </Canvas>
    </>
  );
};

export default PauseView;

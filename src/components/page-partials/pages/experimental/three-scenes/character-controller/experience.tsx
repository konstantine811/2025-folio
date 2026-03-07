import { Physics, RigidBody } from "@react-three/rapier";
import CharacterController from "./controller/character-controller";
import { characterAnimations } from "./config/character-controller.config";
import Ground from "./physics-world/ground";

const Experience = () => {
  return (
    <Physics debug={true} interpolate={false} gravity={[0, -9.81, 0]}>
      <CharacterController
        animationType={characterAnimations}
        modelPath="/3d-models/characters/major_ps1_character.glb"
      />
      <Ground />
      <RigidBody type="dynamic" position={[10, -10, 10]}>
        <boxGeometry />
        <meshBasicMaterial color="red" />
      </RigidBody>
    </Physics>
  );
};

export default Experience;

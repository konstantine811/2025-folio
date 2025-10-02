import { Physics } from "@react-three/rapier";
import Ground from "./ground";

// simple controller
// import CharacterController from "./character-controller/simple-controller/simple-character-controller";
import Environment from "./env/env";
// import DrawMesh from "./draw-mesh/draw-mesh";
import { useEditModeStore } from "../store/useEditModeStore";
import EditModeCamera from "./edit-mode-camera";

// import PickUpController from "./controllers/pick-up-controller";

const InitPhysicWorld = () => {
  const isDebug = useEditModeStore((s) => s.isPhysicsDebug);

  return (
    <>
      <Physics timeStep="vary" debug={isDebug} gravity={[0, -9.81, 0]}>
        <Environment />
        <Ground />
        <EditModeCamera />

        {/* Контролер пікапу */}
        {/* <PickUpController /> */}
      </Physics>
    </>
  );
};

export default InitPhysicWorld;

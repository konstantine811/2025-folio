import {
  CoefficientCombineRule,
  Physics,
  RigidBody,
} from "@react-three/rapier";
import Ground from "./ground";
import PrimitiveModel from "../primitive-modle";
import { randFloatSpread } from "three/src/math/MathUtils.js";
import CharacterController from "./controllers/character-controller";

const InitPhysicWorld = () => {
  return (
    <Physics debug>
      <Ground />
      {Array.from({ length: 500 }, (_, i) => {
        return (
          <RigidBody
            key={i}
            type="dynamic"
            position={[randFloatSpread(40), 5, randFloatSpread(40)]}
            rotation={[Math.PI / 4, 0, 0]}
            userData={{ isGround: true }}
            frictionCombineRule={CoefficientCombineRule.Average}
            restitutionCombineRule={CoefficientCombineRule.Multiply}
            friction={3.001}
            density={3.001}
            angularDamping={1.1}
            // linearDamping={1.1}
            mass={10}
            // mass={100}
          >
            <PrimitiveModel modelName="box.glb" />
          </RigidBody>
        );
      })}
      <CharacterController />
    </Physics>
  );
};

export default InitPhysicWorld;

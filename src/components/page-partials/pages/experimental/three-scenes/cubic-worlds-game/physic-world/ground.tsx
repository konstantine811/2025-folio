import { CoefficientCombineRule, RigidBody } from "@react-three/rapier";

const Ground = () => {
  return (
    <RigidBody
      userData={{ isGround: true }}
      rotation={[-Math.PI / 2, 0, 0]}
      type="fixed"
      frictionCombineRule={CoefficientCombineRule.Average}
      restitutionCombineRule={CoefficientCombineRule.Multiply}
      friction={0.1}
      density={0.1}
      mass={1000}
    >
      <mesh receiveShadow castShadow>
        <planeGeometry args={[100, 100]} />
        <meshPhysicalMaterial color={"#FFBF74"} />
      </mesh>
    </RigidBody>
  );
};

export default Ground;

import { RigidBody } from "@react-three/rapier";

const Ground = () => {
  return (
    <RigidBody
      userData={{ isGround: true }}
      rotation={[-Math.PI / 2, 0, 0]}
      type="fixed"
    >
      <mesh receiveShadow castShadow>
        <planeGeometry args={[100, 100]} />
        <meshPhysicalMaterial color={"#FFBF74"} />
      </mesh>
    </RigidBody>
  );
};

export default Ground;

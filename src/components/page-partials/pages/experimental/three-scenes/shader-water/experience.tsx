import {
  CameraControls,
  Environment,
  Float,
  Gltf,
  Text,
} from "@react-three/drei";
import { JSX } from "react";
import { degToRad } from "three/src/math/MathUtils.js";
import Water from "./water";
import { useControls } from "leva";
// import { Water } from "./water-2/water";

type Props = JSX.IntrinsicElements["group"] & {};

const Experience = ({ ...props }: Props) => {
  const { position } = useControls("Duck transform", {
    position: [0, 0, 0],
  });
  return (
    <group {...props}>
      <CameraControls
        minDistance={5}
        maxDistance={32}
        minPolarAngle={degToRad(-10)}
        maxPolarAngle={degToRad(80)}
      />
      {/* LIGHTS */}
      <Environment preset="sunset" />
      <pointLight
        position={[12, 5, 12]}
        intensity={1.2}
        decay={0.8}
        distance={100}
        color="white"
      />
      <directionalLight
        position={[-15, 5, -15]}
        intensity={1.12}
        color="skyblue"
      />
      {/* SCENE */}
      <Gltf src={"/3d-models/water-model/pool.glb"} />
      <Text
        font={"/fonts/Inter-Black.woff"}
        rotation-x={degToRad(-90)}
        rotation-z={degToRad(90)}
        position-y={0.1}
        position-x={-16.5}
        fontSize={4.3}
      >
        REACT THREE FIBER
        <meshStandardMaterial color="white" roughness={0.7} />
      </Text>
      <Text
        font={"/fonts/Inter-Black.woff"}
        rotation-x={degToRad(-90)}
        position-y={0.1}
        position-z={-24}
        fontSize={3.2}
      >
        ULTIMATE GUIDE
        <meshStandardMaterial color="white" roughness={0.7} />
      </Text>
      <Float floatIntensity={2} rotationIntensity={2} position-y={-1}>
        <Gltf
          src={"/3d-models/water-model/duck.glb"}
          scale={2.5}
          position={position}
        />
      </Float>
      <Water rotation-x={-Math.PI / 2} position-y={-0.1} />
    </group>
  );
};

export default Experience;

import { Player } from "./player";
import {
  Grid,
  OrbitControls,
  PerspectiveCamera,
  useHelper,
} from "@react-three/drei";
import { Playground } from "./Playground";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { useRef } from "react";
import {
  CameraHelper,
  PerspectiveCamera as ThreePerspectiveCamera,
} from "three";

const Experience = () => {
  const shadowCameraRef = useRef<ThreePerspectiveCamera>(null!);
  useHelper(shadowCameraRef, CameraHelper);
  return (
    <>
      <directionalLight
        position={[-50, 50, 25]}
        intensity={0.4}
        castShadow
        shadow-mapSize={[1024, 1024]}
      >
        <PerspectiveCamera
          ref={shadowCameraRef}
          attach={"shadow-camera"}
          near={55}
          far={86}
          fov={80}
        />
      </directionalLight>
      <OrbitControls />
      <ambientLight intensity={0.5} />
      <Player />
      <Playground />
      <RigidBody
        type="fixed"
        colliders={false}
        sensor
        name="space"
        position-y={-5}
      >
        <CuboidCollider args={[50, 0.5, 50]} />
      </RigidBody>
      <Grid
        sectionSize={3}
        sectionColor={"white"}
        sectionThickness={1}
        cellSize={1}
        cellColor={"#ececec"}
        cellThickness={0.6}
        infiniteGrid
        fadeDistance={100}
        fadeStrength={5}
      />
    </>
  );
};

export default Experience;

import { useFrame } from "@react-three/fiber";
import {
  SimpleCharacter,
  BvhPhysicsBody,
  PrototypeBox,
  useXRControllerInput,
} from "@react-three/viverse";
import { useRef } from "react";
import { Group } from "three";

export function Scene() {
  const characterRef = useRef<Group>(null);
  useFrame(() => {
    if (characterRef.current == null) {
      return;
    }
    if (characterRef.current.position.y < -10) {
      characterRef.current.position.set(0, 0, 0);
    }
  });
  const input = useXRControllerInput();
  return (
    <>
      <directionalLight
        intensity={1.2}
        position={[5, 10, 10]}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <ambientLight intensity={1} />
      <SimpleCharacter
        input={[input]}
        cameraBehavior={false}
        ref={characterRef}
      />
      <BvhPhysicsBody>
        <PrototypeBox
          color="&#35;cccccc"
          scale={[2, 1, 3]}
          position={[3.91, 0, 0]}
        />
        <PrototypeBox
          color="&#35;ffccff"
          scale={[3, 1, 3]}
          position={[2.92, 1.5, -1.22]}
        />
        <PrototypeBox
          color="&#35;ccffff"
          scale={[2, 0.5, 3]}
          position={[1.92, 2.5, -3.22]}
        />
        <PrototypeBox
          color="&#35;ffccff"
          scale={[2, 1, 3]}
          position={[-2.92, 0, -2.22]}
        />
        <PrototypeBox
          color="&#35;ccffff"
          scale={[1, 1, 4]}
          position={[0.08, -1, 0]}
        />
        <PrototypeBox
          color="&#35;ffffcc"
          scale={[4, 1, 1]}
          position={[0.08, 3.5, 0]}
        />
        <PrototypeBox
          color="&#35;ffffff"
          scale={[10, 0.5, 10]}
          position={[0.08, -2, 0]}
        />
      </BvhPhysicsBody>
    </>
  );
}

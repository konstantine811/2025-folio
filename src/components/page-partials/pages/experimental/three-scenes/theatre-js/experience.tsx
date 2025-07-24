import { Environment } from "@react-three/drei";
import MedievalFantasyBook from "./medieval-fantasy-book";
import { editable as e } from "@theatre/r3f";
import { Autofocus, EffectComposer } from "@react-three/postprocessing";
import { useRef } from "react";
import { Mesh, Vector3 } from "three";
import { useFrame } from "@react-three/fiber";
import { isProd } from "@/utils/check-env";
const Experience = () => {
  const focusTargetVissualizeRef = useRef<Mesh>(null!);
  const focusTargetRef = useRef<Vector3>(new Vector3(0, 0, 0));

  useFrame(() => {
    if (focusTargetVissualizeRef.current) {
      focusTargetRef.current.copy(focusTargetVissualizeRef.current.position);
    }
  });
  return (
    <>
      <e.directionalLight
        theatreKey="SunLight"
        position={[3, 3, 3]}
        intensity={0.2}
        castShadow
        shadow-bias={-0.001}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <e.group theatreKey="MedievalFantasyBook">
        <MedievalFantasyBook props={{ scale: 0.1 }} envMapIntensity={0.3} />
      </e.group>
      <e.mesh
        theatreKey="FocusTarget"
        visible="editor"
        ref={focusTargetVissualizeRef}
      >
        <sphereGeometry args={[0.01, 8, 8]} />
        <meshBasicMaterial color="red" wireframe />
      </e.mesh>
      <EffectComposer>
        <Autofocus
          target={focusTargetRef.current}
          smoothTime={0.1}
          debug={isProd ? undefined : 0.04}
          focusRange={0.002}
          bokehScale={8}
        ></Autofocus>
      </EffectComposer>
      <Environment preset="dawn" background blur={4} />
    </>
  );
};

export default Experience;

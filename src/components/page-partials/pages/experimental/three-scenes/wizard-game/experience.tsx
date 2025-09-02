import { Environment, OrbitControls } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import Magic from "./magic";

const Experience = () => {
  return (
    <>
      <OrbitControls enabled={false} />
      <Environment preset="night" />
      <directionalLight
        position={[1.5, 5, -5]}
        castShadow
        intensity={0.5}
        shadow-mapSize-width={128}
        shadow-mapSize-height={128}
      />
      <Magic />
      <EffectComposer>
        <Bloom intensity={1.2} luminanceThreshold={1} mipmapBlur />
      </EffectComposer>
    </>
  );
};

export default Experience;

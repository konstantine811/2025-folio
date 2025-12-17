import MainWrapperOffset from "@/components/ui-abc/main-wrapper-offset";
import ThreeLoader from "../common/three-loader";
import { Canvas } from "@react-three/fiber";
import Experience from "./Experience";
import { Suspense, useState } from "react";
import MorphingScene from "./EarthParticle";

const ParticleEarth = () => {
  const [controls, setControls] = useState<{ beginMorph: () => void } | null>(
    null
  );
  return (
    <MainWrapperOffset className="relative">
      <ThreeLoader />
      <Canvas>
        <color attach="background" args={["#121512"]} />
        <Suspense fallback={null}>
          <Experience />
          <MorphingScene onReady={setControls} />
        </Suspense>
      </Canvas>
      <button
        id="morphButton"
        className="absolute bottom-0 right-4 z-50"
        onClick={() => {
          controls?.beginMorph();
        }}
      >
        Morph Shape
      </button>
    </MainWrapperOffset>
  );
};

export default ParticleEarth;

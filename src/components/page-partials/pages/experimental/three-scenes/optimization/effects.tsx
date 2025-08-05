import { DepthOfField, EffectComposer } from "@react-three/postprocessing";
import { Vector3 } from "three";

const focusTarget = new Vector3(0, 1.2, 1);
const Effects = () => {
  return (
    <EffectComposer>
      <DepthOfField
        target={focusTarget}
        focusRange={0.001}
        focalLength={0.2}
        bokehScale={5}
      />
    </EffectComposer>
  );
};

export default Effects;

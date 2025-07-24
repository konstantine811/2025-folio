import {
  Autofocus,
  Bloom,
  BrightnessContrast,
  EffectComposer,
  Noise,
  Sepia,
  Vignette,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { useControls } from "leva";

const Effects = () => {
  const vignetteConfig = useControls("Vignette", {
    enabled: true,
    offset: { value: 0.1, min: 0, max: 1 },
    darkness: { value: 0.92, min: 0, max: 1 },
  });

  const bloomConfig = useControls("Bloom", {
    enabled: true,
    luminanceThreshold: { value: 1, min: 0, max: 2 },
    intensity: { value: 1.28, min: 0, max: 2 },
    mipmapBlur: true,
  });

  const brightnessConstrastConfig = useControls("BrightnessContrast", {
    enabled: true,
    brightness: { value: 0.02, min: -1, max: 1 },
    contrast: { value: -0.1, min: -1, max: 1 },
  });

  const sepiaConfig = useControls("Sepia", {
    enabled: true,
    blendFunction: {
      value: "DARKEN" as keyof typeof BlendFunction,
      options: Object.keys(BlendFunction).filter((k) =>
        isNaN(Number(k))
      ) as (keyof typeof BlendFunction)[],
    },
  });
  const noiseConfig = useControls("Noise", {
    enabled: true,
    opacity: { value: 0.1, min: 0, max: 1 },
  });

  const autofocusConfig = useControls("Autofocus", {
    enabled: true,
    mouse: true,
    focusRange: { value: 0.001, min: 0, max: 0.01 },
    bokehScale: { value: 8, min: 0, max: 40 },
    focalLength: { value: 0.8, min: 0, max: 1 },
    smoothTime: { value: 0.5, min: 0, max: 1 },
  });
  return (
    <EffectComposer>
      <>
        {vignetteConfig.enabled && <Vignette {...vignetteConfig} />}
        {bloomConfig.enabled && <Bloom {...bloomConfig} />}
        {brightnessConstrastConfig.enabled && (
          <BrightnessContrast {...brightnessConstrastConfig} />
        )}
        {sepiaConfig.enabled && (
          <Sepia blendFunction={BlendFunction[sepiaConfig.blendFunction]} />
        )}
        {noiseConfig.enabled && <Noise {...noiseConfig} />}
        {autofocusConfig.enabled && <Autofocus {...autofocusConfig} />}
      </>
    </EffectComposer>
  );
};

export default Effects;

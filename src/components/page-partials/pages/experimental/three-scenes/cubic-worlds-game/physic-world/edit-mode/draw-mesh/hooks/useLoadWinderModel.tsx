import { useFrame } from "@react-three/fiber";
import { useGeometry } from "../../../../utils/getModelGeometry";
import { useEmbeddedMaps } from "../../../../utils/textureAlbedoHandle";
import { useMemo } from "react";
import { WinderMaterial } from "../../../../shaders/winder-shader";
import { Vector2 } from "three";

type Props = {
  modelUrl: string;
};

const useLoadWinderModel = ({ modelUrl }: Props) => {
  const bladeGeom = useGeometry(modelUrl);
  const { albedo } = useEmbeddedMaps(modelUrl);

  const sharedMaterial = useMemo(() => {
    const m = new WinderMaterial();
    // ініціалізація уніформ і флагів один раз:
    m.transparent = false;
    m.defines = { USE_INSTANCING: "" }; // ок
    m.uniforms = {
      ...m.uniforms,
      time: { value: 0 },
      albedoMap: { value: albedo ?? null },
      _fallbackEdgeWidth: { value: 0.5 },
      _fallbackEdgeDark: { value: 2.01 }, // мін. яскравість краю
      uWindAmp: { value: 0.03 },
      transparency: { value: 0.3 },
      uWindFreq: { value: 3.2 },
      uWindDir: { value: new Vector2(1.85, 1.2).normalize() },
      windDirNoiseScale: { value: 0.5 }, // масштаб шуму напряму
      windStrNoiseScale: { value: 0.25 }, // масштаб шуму сили
      gustStrength: { value: 0.25 }, // поривчастість (shape)
      noiseScrollDir: { value: 0.5 }, // “дрейф” карти вітру
      // інші твої уніформи...
    };
    return m;
  }, [albedo]);

  useFrame((_, dt) => {
    if (sharedMaterial.uniforms?.time) {
      sharedMaterial.uniforms.time.value += dt;
    }
  });

  return { bladeGeom, sharedMaterial };
};

export default useLoadWinderModel;

import { useMemo } from "react";
import { Vector2, Vector3 } from "three";
import { useGeometry } from "../../utils/getModelGeometry";
import { useEmbeddedMaps } from "../../utils/textureAlbedoHandle";
import { useFrame } from "@react-three/fiber";
import { WinderMaterial } from "../../shaders/winder-shader";
import AddWinderModel from "./add-winder-model";
import useCreateChunkInstance from "./hooks/useCreateChucnkInstance";

type Props = {
  strokes: Vector3[][];
  strokeNormals: Vector3[];
  seed: number;
  limit: number;
  density: number;
  radius: number;
  rotationDeg: number;
  offset: number;
  randomness: number;
  scale: number;
  modelUrl: string;
};

export default function AddWinderInstanceModel({
  strokes,
  strokeNormals,
  seed,
  limit,
  density,
  radius,
  rotationDeg,
  offset,
  randomness,
  scale,
  modelUrl,
}: Props) {
  // 1) ПІДТЯГУЄМО РЕАЛЬНУ ГЕОМЕТРІЮ ТРАВИНКИ
  const bladeGeom = useGeometry(modelUrl);
  const { albedo } = useEmbeddedMaps(modelUrl);

  const sharedMaterial = useMemo(() => {
    const m = new WinderMaterial();
    // ініціалізація уніформ і флагів один раз:
    m.defines = { USE_INSTANCING: "" };
    m.transparent = false;
    m.uniforms = {
      ...m.uniforms,
      time: { value: 0 },
      albedoMap: { value: albedo ?? null },
      _fallbackEdgeWidth: { value: 10.5 },
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
  const chunks = useCreateChunkInstance({
    strokes,
    strokeNormals,
    seed,
    limit,
    density,
    radius,
    rotationDeg,
    offset,
    randomness,
    scale,
    geometry: bladeGeom,
  });
  // Оновлюємо time ОДИН раз:
  useFrame((_, dt) => {
    if (sharedMaterial.uniforms?.time) sharedMaterial.uniforms.time.value += dt;
  });

  return (
    <group>
      {chunks.map((mats, i) => {
        return (
          <AddWinderModel
            key={i}
            matrices={mats}
            material={sharedMaterial}
            blade={bladeGeom}
          />
        );
      })}
    </group>
  );
}

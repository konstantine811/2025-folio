import { Matrix4, Vector3 } from "three";
import AddWinderInstancedModelWrap from "./add-winder-instanced-model-wrap";
import useCreateChunkInstance from "../hooks/useCreateChucnkInstance";
import useLoadWinderModel from "../hooks/useLoadWinderModel";
import { useEffect } from "react";

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
  onChunksCreated: (chunks: Matrix4[][]) => void;
  isEditMode: boolean;
};

export default function ModelInstanceChunks({
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
  onChunksCreated,
  isEditMode,
}: Props) {
  // 1) ПІДТЯГУЄМО РЕАЛЬНУ ГЕОМЕТРІЮ ТРАВИНКИ
  const { bladeGeom, sharedMaterial } = useLoadWinderModel({ modelUrl });
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
  // ✅ повідомляємо батька лише ПІСЛЯ рендера
  useEffect(() => {
    onChunksCreated(chunks);
  }, [chunks, onChunksCreated]);

  return (
    <group>
      {chunks.map((mats, i) => {
        return (
          <AddWinderInstancedModelWrap
            key={i}
            matrices={mats}
            material={sharedMaterial}
            blade={bladeGeom}
            isEditMode={isEditMode}
          />
        );
      })}
    </group>
  );
}

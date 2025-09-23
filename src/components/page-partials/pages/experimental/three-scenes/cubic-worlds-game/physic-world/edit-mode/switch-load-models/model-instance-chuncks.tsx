import {
  BufferGeometry,
  Material,
  Matrix4,
  NormalBufferAttributes,
  Vector3,
} from "three";
import AddWinderInstancedModelWrap from "../draw-mesh/winder-model/add-winder-instanced-model-wrap";
import useCreateChunkInstance from "../draw-mesh/hooks/useCreateChucnkInstance";
import { useCallback, useEffect } from "react";
import { TypeModel } from "../../../config/3d-model.config";
import { ShaderMaterial } from "three";
import { UpHint } from "../draw-mesh/hooks/useCreatePivotPoint";
import AddSimpleInstancedModelWrap from "../draw-mesh/simple-model/add-simple-instanced-model";

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
  onChunksCreated: (chunks: Matrix4[][]) => void;
  isEditMode: boolean;
  geom: BufferGeometry<NormalBufferAttributes>;
  material: Material | ShaderMaterial;
  type: TypeModel;
  hint: UpHint;
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
  onChunksCreated,
  isEditMode,
  geom,
  material,
  type,
  hint = "auto-normals",
}: Props) {
  // 1) ПІДТЯГУЄМО РЕАЛЬНУ ГЕОМЕТРІЮ ТРАВИНКИ
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
    geometry: geom,
    hint,
  });
  // ✅ повідомляємо батька лише ПІСЛЯ рендера
  useEffect(() => {
    onChunksCreated(chunks);
  }, [chunks, onChunksCreated]);

  const switchType = useCallback(() => {
    switch (type) {
      case TypeModel.touchWinder:
        return chunks.map((mats, i) => {
          return (
            <AddWinderInstancedModelWrap
              key={i}
              matrices={mats}
              material={material as ShaderMaterial}
              blade={geom}
              isEditMode={isEditMode}
            />
          );
        });
      case TypeModel.simple:
        return chunks.map((mats, i) => {
          return (
            <AddSimpleInstancedModelWrap
              key={i}
              matrices={mats}
              material={material as Material}
              blade={geom}
              isEditMode={isEditMode}
              id={i.toString()}
            />
          );
        });
      default:
        return null;
    }
  }, [chunks, material, geom, isEditMode, type]);

  return <group>{switchType()}</group>;
}

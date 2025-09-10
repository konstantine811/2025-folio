import { useMemo } from "react";
import { Matrix4 } from "three";
import AddWinderInstancedModelWrap from "../draw-mesh/winder-model/add-winder-instanced-model-wrap";
import useLoadWinderModel from "../draw-mesh/hooks/useLoadWinderModel";
import { PackedPayload, parsePackedJSON } from "../../utils/save-chunks";

type Props = {
  modelUrl: string;
  data: PackedPayload;
  isEditMode?: boolean;
};

export default function AddWinderInstanceModel({
  modelUrl,
  data,
  isEditMode = false,
}: Props) {
  const parsedChunks = useMemo<Matrix4[][]>(() => {
    return parsePackedJSON(data);
  }, [data]);

  const { bladeGeom, sharedMaterial } = useLoadWinderModel({ modelUrl });

  return (
    <group>
      {parsedChunks.map((mats, i) => {
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

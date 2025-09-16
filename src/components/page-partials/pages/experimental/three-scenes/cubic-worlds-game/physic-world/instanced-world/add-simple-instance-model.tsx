import { useEffect, useRef, useState } from "react";
import { Matrix4, MeshBasicMaterial, ShaderMaterial } from "three";
import { saveScatterToStorage } from "@/services/firebase/cubic-worlds-game/firestore-scatter-objects";
import { StatusServer, useEditModeStore } from "../../store/useEditModeStore";
import { MeshShaderData } from "../edit-mode/switch-load-models/load.model";
import { UpHint } from "../edit-mode/draw-mesh/hooks/useCreatePivotPoint";
import { TypeModel } from "../../config/3d-model.config";
import AddSimpleInstancedModelWrap from "../edit-mode/draw-mesh/simple-model/add-simple-instanced-model";
import LoadSimpleModel from "../edit-mode/switch-load-models/load-simple-model";

type Props = {
  modelUrl: string;
  metrices: Matrix4[][];
  isEditMode?: boolean;
  fileName?: string;
  modelName: string;
  hint: UpHint;
  type: TypeModel;
};

export default function AddSimpleInstanceModel({
  modelUrl,
  metrices,
  isEditMode = false,
  fileName,
  modelName,
  hint,
  type,
}: Props) {
  const isMatrixUpdate = useRef(false);
  const [meshData, setMeshData] = useState<MeshShaderData | null>(null);
  const { setStatusServer } = useEditModeStore();
  const editMaterial = new MeshBasicMaterial({
    color: 0x33bb00,
  });
  const prevIsEdit = useRef(isEditMode);

  useEffect(() => {
    const wasEdit = prevIsEdit.current;
    const nowEdit = isEditMode;
    if (wasEdit && !nowEdit && isMatrixUpdate.current) {
      (async () => {
        if (fileName) {
          setStatusServer(StatusServer.start);
          saveScatterToStorage(fileName, metrices, {
            name: modelName,
            path: modelUrl,
            type: type,
            hintMode: hint,
          }).then(() => {
            setStatusServer(StatusServer.loaded);
            isMatrixUpdate.current = false; // СКИДАЙ прапорець після успіху
          });
        } else {
          console.error("File name is not defined");
          isMatrixUpdate.current = false;
        }
      })();
    }

    prevIsEdit.current = nowEdit;
    // ЗВЕРНИ УВАГУ: залежність тільки від isEditMode,
    // parsedChunks/fileName не потрібні тут як тригери.
  }, [isEditMode, setStatusServer]); // <= тільки перехід режиму

  return (
    <group>
      {meshData && metrices && (
        <>
          {metrices.map((mats, i) => {
            return (
              <group key={i}>
                <AddSimpleInstancedModelWrap
                  key={i}
                  matrices={mats}
                  material={isEditMode ? editMaterial : meshData.material}
                  blade={meshData.geometry}
                  isEditMode={isEditMode}
                  onUpdate={() => {
                    isMatrixUpdate.current = true;
                  }}
                />
              </group>
            );
          })}
        </>
      )}
      <LoadSimpleModel
        modelUrl={modelUrl}
        onCreateModelGeom={(geom, mat) => {
          setMeshData({ geometry: geom, material: mat as ShaderMaterial });
        }}
      />
    </group>
  );
}

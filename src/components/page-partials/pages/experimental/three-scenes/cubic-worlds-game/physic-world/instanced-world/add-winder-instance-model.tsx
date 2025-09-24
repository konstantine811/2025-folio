import { useCallback, useEffect, useRef, useState } from "react";
import { Matrix4, ShaderMaterial } from "three";
import AddWinderInstancedModelWrap from "../edit-mode/draw-mesh/winder-model/add-winder-instanced-model-wrap";
import { saveScatterToStorage } from "@/services/firebase/cubic-worlds-game/firestore-scatter-objects";
import { StatusServer, useEditModeStore } from "../../store/useEditModeStore";
import { MeshShaderData } from "../edit-mode/switch-load-models/load.model";
import { UpHint } from "../edit-mode/draw-mesh/hooks/useCreatePivotPoint";
import { TypeModel } from "../../config/3d-model.config";
import { buildGridCells } from "../../utils/grid";
import { Key } from "@/config/key";
import AddInstanceMesh from "../edit-mode/draw-mesh/add-instance-mesh";
import LoadWinderModel from "../edit-mode/switch-load-models/load-winder-model";

type Props = {
  modelUrl: string;
  metrices: Matrix4[][];
  isEditMode?: boolean;
  fileName?: string;
  modelName: string;
  hint: UpHint;
  type: TypeModel;
};

export default function AddWinderInstanceModel({
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
  const setStatusServer = useEditModeStore((s) => s.setStatusServer);
  const [newMatrices, setNewMatrices] = useState<Matrix4[][]>(metrices);
  const prevIsEdit = useRef(isEditMode);
  const [isAddModel, setIsAddModel] = useState(false);
  const [placementPosition, setPlacementPosition] = useState<Matrix4[]>([]);

  const updateServerData = useCallback(
    (fileName: string, data: Matrix4[][]) => {
      setStatusServer(StatusServer.start);
      saveScatterToStorage(fileName, data, {
        name: modelName,
        path: modelUrl,
        type: type,
        hintMode: hint,
      }).then(() => {
        setStatusServer(StatusServer.loaded);
        setNewMatrices(data);
        setPlacementPosition([]);
        isMatrixUpdate.current = false; // СКИДАЙ прапорець після успіху
      });
    },
    [modelName, modelUrl, type, hint, setStatusServer]
  );

  useEffect(() => {
    const wasEdit = prevIsEdit.current;
    const nowEdit = isEditMode;

    if (wasEdit && !nowEdit && isMatrixUpdate.current) {
      if (fileName) {
        updateServerData(fileName, newMatrices);
      } else {
        console.error("File name is not defined");
        isMatrixUpdate.current = false;
      }
    }

    prevIsEdit.current = nowEdit;
    // ЗВЕРНИ УВАГУ: залежність тільки від isEditMode,
    // parsedChunks/fileName не потрібні тут як тригери.
  }, [isEditMode, setStatusServer, updateServerData, fileName]); // <= тільки перехід режиму

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const key = e.code;
      // ==== SCALE (S) ====
      if (key === Key.A && e.shiftKey) {
        setIsAddModel(true);
      }
      if (key === Key.ESC) {
        const matx = buildGridCells([...placementPosition, ...metrices.flat()]);
        if (fileName) {
          updateServerData(fileName, matx);
        }
        setIsAddModel(false);
      }
    },
    [fileName, placementPosition, metrices, updateServerData]
  );

  useEffect(() => {
    if (isEditMode) {
      window.addEventListener("keydown", onKeyDown);
    } else {
      window.removeEventListener("keydown", onKeyDown);
      setIsAddModel(false);
    }
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isEditMode, onKeyDown]);

  return (
    <group>
      {meshData && newMatrices && (
        <>
          {newMatrices.map((mats, i) => {
            return (
              <group key={i}>
                <AddWinderInstancedModelWrap
                  key={i}
                  matrices={mats}
                  material={meshData.material}
                  blade={meshData.geometry}
                  isEditMode={isEditMode}
                  onUpdate={() => {
                    isMatrixUpdate.current = true;
                  }}
                />
              </group>
            );
          })}
          {isAddModel && (
            <>
              <AddInstanceMesh
                geom={meshData.geometry}
                material={meshData.material}
                onUpdateMatrices={setPlacementPosition}
              />
              <AddWinderInstancedModelWrap
                matrices={placementPosition}
                material={meshData.material}
                blade={meshData.geometry}
                // meshName="grass"
                isEditMode={false}
              />
            </>
          )}
        </>
      )}
      <LoadWinderModel
        modelUrl={modelUrl}
        onCreateModelGeom={(geom, mat) => {
          setMeshData({ geometry: geom, material: mat as ShaderMaterial });
        }}
      />
    </group>
  );
}

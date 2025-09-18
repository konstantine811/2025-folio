import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Matrix4, MeshBasicMaterial, ShaderMaterial } from "three";
import { saveScatterToStorage } from "@/services/firebase/cubic-worlds-game/firestore-scatter-objects";
import { StatusServer, useEditModeStore } from "../../store/useEditModeStore";
import { MeshShaderData } from "../edit-mode/switch-load-models/load.model";
import { UpHint } from "../edit-mode/draw-mesh/hooks/useCreatePivotPoint";
import { TypeModel } from "../../config/3d-model.config";
import AddSimpleInstancedModelWrap from "../edit-mode/draw-mesh/simple-model/add-simple-instanced-model";
import LoadSimpleModel from "../edit-mode/switch-load-models/load-simple-model";
import { Key } from "@/config/key";
import AddInstanceMesh from "../edit-mode/draw-mesh/add-instance-mesh";
import { buildGridCells } from "../../utils/grid";

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
  const [newMatrices, setNewMatrices] = useState<Matrix4[][]>(metrices);
  const { setStatusServer } = useEditModeStore();
  const [isAddModel, setIsAddModel] = useState(false);
  const editMaterial = useMemo(
    () => new MeshBasicMaterial({ color: 0x33bb00 }),
    []
  );
  const drawMaterial = useMemo(
    () => (meshData ? meshData.material.clone() : null),
    [meshData]
  );
  const prevIsEdit = useRef(isEditMode);
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
        setPlacementPosition([]);
      } else {
        console.error("File name is not defined");
        isMatrixUpdate.current = false;
      }
    }

    prevIsEdit.current = nowEdit;
    // ЗВЕРНИ УВАГУ: залежність тільки від isEditMode,
    // parsedChunks/fileName не потрібні тут як тригери.
  }, [isEditMode, updateServerData, fileName, newMatrices]); // <= тільки перехід режиму

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
      {meshData && newMatrices && drawMaterial && (
        <>
          {newMatrices.map((mats, i) => {
            return (
              <group key={i}>
                <AddSimpleInstancedModelWrap
                  key={i}
                  matrices={mats}
                  material={isEditMode ? editMaterial : drawMaterial}
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
                material={drawMaterial}
                onUpdateMatrices={setPlacementPosition}
              />
              <AddSimpleInstancedModelWrap
                matrices={placementPosition}
                material={drawMaterial}
                blade={meshData.geometry}
                // meshName="grass"
                isEditMode={false}
              />
            </>
          )}
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

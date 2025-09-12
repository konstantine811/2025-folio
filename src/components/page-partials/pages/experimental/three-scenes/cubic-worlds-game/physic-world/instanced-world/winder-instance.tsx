import { useEffect, useRef } from "react";
import { Matrix4 } from "three";
import AddWinderInstancedModelWrap from "../edit-mode/draw-mesh/winder-model/add-winder-instanced-model-wrap";
import useLoadWinderModel from "../edit-mode/draw-mesh/hooks/useLoadWinderModel";
import { saveScatterToStorage } from "@/services/firebase/cubic-worlds-game/firestore-scatter-objects";
import { StatusServer, useEditModeStore } from "../../store/useEditModeStore";

type Props = {
  modelUrl: string;
  metrices: Matrix4[][];
  isEditMode?: boolean;
  fileName?: string;
};

export default function AddWinderInstanceModel({
  modelUrl,
  metrices,
  isEditMode = false,
  fileName,
}: Props) {
  const isMatrixUpdate = useRef(false);

  const { bladeGeom, sharedMaterial } = useLoadWinderModel({ modelUrl });
  const { setStatusServer } = useEditModeStore();

  const prevIsEdit = useRef(isEditMode);

  useEffect(() => {
    const wasEdit = prevIsEdit.current;
    const nowEdit = isEditMode;

    if (wasEdit && !nowEdit && isMatrixUpdate.current) {
      (async () => {
        if (fileName) {
          setStatusServer(StatusServer.start);
          saveScatterToStorage(fileName, metrices).then(() => {
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
      {metrices.map((mats, i) => {
        return (
          <AddWinderInstancedModelWrap
            key={i}
            matrices={mats}
            material={sharedMaterial}
            blade={bladeGeom}
            isEditMode={isEditMode}
            onUpdate={() => {
              isMatrixUpdate.current = true;
            }}
          />
        );
      })}
    </group>
  );
}

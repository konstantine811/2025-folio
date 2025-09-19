import { useCallback, useEffect, useRef } from "react";
import {
  EditModeAction,
  useEditModeStore,
} from "../../../../store/useEditModeStore";
import { Matrix4 } from "three";
import PlanePainter from "../line-painter";

const LainPainterSaver = () => {
  const { editModeAction, onSetNewInstance, scatterModelDraw } =
    useEditModeStore();
  const chunksRef = useRef<Matrix4[][]>([]);

  const onChunksChange = useCallback((chunks: Matrix4[][]) => {
    chunksRef.current = chunks;
  }, []);

  useEffect(() => {
    if (editModeAction !== EditModeAction.drawScatter) {
      const latest = chunksRef.current;
      if (latest?.length) {
        onSetNewInstance({
          matrix: latest,
          model: scatterModelDraw,
        });
        chunksRef.current = []; // опціонально очистити
      }
    }
  }, [editModeAction, onSetNewInstance, scatterModelDraw]);
  return (
    <>
      {editModeAction === EditModeAction.drawScatter && (
        <PlanePainter
          onChunksCreated={onChunksChange}
          scatterModelDraw={scatterModelDraw}
        />
      )}
    </>
  );
};

export default LainPainterSaver;

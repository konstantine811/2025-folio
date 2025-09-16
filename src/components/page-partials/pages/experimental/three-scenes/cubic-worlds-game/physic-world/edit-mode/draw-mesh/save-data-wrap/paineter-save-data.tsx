import { useCallback, useEffect, useRef } from "react";
import { useEditModeStore } from "../../../../store/useEditModeStore";
import { Matrix4 } from "three";
import PlanePainter from "../plain-painter";

const PainterSaver = () => {
  const { isDrawScatter, onSetNewScatter, scatterModelDraw } =
    useEditModeStore();
  const chunksRef = useRef<Matrix4[][]>([]);

  const onChunksChange = useCallback((chunks: Matrix4[][]) => {
    chunksRef.current = chunks;
  }, []);

  useEffect(() => {
    if (!isDrawScatter) {
      const latest = chunksRef.current;
      if (latest?.length) {
        onSetNewScatter({
          matrix: latest,
          model: scatterModelDraw,
        });
        chunksRef.current = []; // опціонально очистити
      }
    }
  }, [isDrawScatter, onSetNewScatter, scatterModelDraw]);
  return (
    <>
      {isDrawScatter && (
        <PlanePainter
          onChunksCreated={onChunksChange}
          scatterModelDraw={scatterModelDraw}
        />
      )}
    </>
  );
};

export default PainterSaver;

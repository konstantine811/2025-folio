import { useCallback, useEffect, useRef } from "react";
import { useEditModeStore } from "../../../store/useEditModeStore";
import { Matrix4 } from "three";
import { saveChunksPackedJSON } from "../../../utils/save-chunks";
import PlanePainter from "../plain-painter";

const PainterSaver = () => {
  const { isDrawScatter } = useEditModeStore();
  const chunksRef = useRef<Matrix4[][]>([]);

  const onChunksChange = useCallback((chunks: Matrix4[][]) => {
    chunksRef.current = chunks;
  }, []);

  // реакція на ПЕРЕХІД true -> false
  useEffect(() => {
    if (!isDrawScatter) {
      const latest = chunksRef.current;
      if (latest?.length) {
        saveChunksPackedJSON(latest); // синхронний Blob+download
        chunksRef.current = []; // опціонально очистити
      }
    }
  }, [isDrawScatter]);
  return (
    <>{isDrawScatter && <PlanePainter onChunksCreated={onChunksChange} />}</>
  );
};

export default PainterSaver;

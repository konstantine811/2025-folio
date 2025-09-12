import { useCallback, useEffect, useRef } from "react";
import { useEditModeStore } from "../../../../store/useEditModeStore";
import { Matrix4 } from "three";
import PlanePainter from "../plain-painter";

const PainterSaver = () => {
  const { isDrawScatter, onSetNewScatter } = useEditModeStore();
  const chunksRef = useRef<Matrix4[][]>([]);

  const onChunksChange = useCallback((chunks: Matrix4[][]) => {
    chunksRef.current = chunks;
  }, []);

  useEffect(() => {
    if (!isDrawScatter) {
      const latest = chunksRef.current;
      if (latest?.length) {
        onSetNewScatter(latest);
        chunksRef.current = []; // опціонально очистити
      }
    }
  }, [isDrawScatter, onSetNewScatter]);
  return (
    <>{isDrawScatter && <PlanePainter onChunksCreated={onChunksChange} />}</>
  );
};

export default PainterSaver;

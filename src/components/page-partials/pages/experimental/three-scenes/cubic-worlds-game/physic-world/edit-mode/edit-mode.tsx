import { GizmoHelper, GizmoViewport } from "@react-three/drei";
import PainterSaver from "./draw-mesh/save-data-wrap/paineter-save-data";
import DrawMesh from "./draw-mesh/draw-mesh";

const EditMode = () => {
  return (
    <>
      <GizmoHelper
        alignment="bottom-center" // widget alignment within scene
        margin={[80, 80]} // widget margins (X, Y)
      >
        <GizmoViewport />
        {/* alternative: <GizmoViewcube /> */}
      </GizmoHelper>
      <DrawMesh />
      <PainterSaver />
    </>
  );
};

export default EditMode;

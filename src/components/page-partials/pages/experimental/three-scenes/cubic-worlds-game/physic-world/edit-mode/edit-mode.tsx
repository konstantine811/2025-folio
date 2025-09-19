import { GizmoHelper, GizmoViewport } from "@react-three/drei";
import PainterSaver from "./draw-mesh/save-data-wrap/paineter-save-data";
import DrawSingleInstanceWrap from "./draw-mesh/draw-single-instance/draw-singe-instance-wrap";

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
      <DrawSingleInstanceWrap />
      <DrawSingleInstanceWrap />
      <PainterSaver />
    </>
  );
};

export default EditMode;

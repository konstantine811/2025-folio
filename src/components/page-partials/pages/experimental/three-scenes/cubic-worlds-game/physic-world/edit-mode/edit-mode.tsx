import { GizmoHelper, GizmoViewport } from "@react-three/drei";

const EditMode = () => {
  return (
    <GizmoHelper
      alignment="bottom-right" // widget alignment within scene
      margin={[80, 80]} // widget margins (X, Y)
    >
      <GizmoViewport />
      {/* alternative: <GizmoViewcube /> */}
    </GizmoHelper>
  );
};

export default EditMode;

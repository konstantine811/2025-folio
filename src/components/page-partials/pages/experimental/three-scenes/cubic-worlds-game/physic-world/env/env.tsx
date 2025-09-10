// import GrassWrapper from "../../grass/grass-wrapper";
// import useEnvSound from "../../hooks/useEnvSound";
// import Boxes from "./boxes/boxes";
import chunksJson from "@config/three-world/cubic-worlds/scatter/grass-chunks.json";
import HouseModel from "./house";
import WinderInstance from "../instanced-world/winder-instance";
import "../../shaders/winder-shader";
import { PackedPayload } from "../../utils/save-chunks";
import { useEditModeStore } from "../../store/useEditModeStore";
const Environment = () => {
  const isTransformEdit = useEditModeStore((s) => s.isTransformEdit);
  return (
    <>
      <HouseModel position={[-20, 0, 40]} />
      <WinderInstance
        modelUrl="/3d-models/cubic-worlds-model/grass.glb"
        data={chunksJson as PackedPayload}
        isEditMode={isTransformEdit}
      />
      {/* <GrassWrapper /> */}
      {/* <Boxes count={5000} /> */}
    </>
  );
};

export default Environment;

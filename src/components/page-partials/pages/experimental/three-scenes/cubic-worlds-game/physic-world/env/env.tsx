// import GrassWrapper from "../../grass/grass-wrapper";
// import useEnvSound from "../../hooks/useEnvSound";
// import Boxes from "./boxes/boxes";
import chunksJson from "@config/three-world/cubic-worlds/scatter/grass-chunks.json";
import HouseModel from "./house";
import WinderInstance from "../instanced-world/winder-instance";
import "../../shaders/winder-shader";
import PainterSaver from "../draw-mesh/save-data-wrap/paineter-save-data";
import { PackedPayload } from "../../utils/save-chunks";
const Environment = () => {
  return (
    <>
      <HouseModel position={[-20, 0, 40]} />
      <PainterSaver />
      <WinderInstance
        modelUrl="/3d-models/cubic-worlds-model/grass.glb"
        data={chunksJson as PackedPayload}
      />
      {/* <GrassWrapper /> */}
      {/* <Boxes count={5000} /> */}
    </>
  );
};

export default Environment;

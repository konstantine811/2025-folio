import { useGLTF } from "@react-three/drei";
import { PainterModelConfig } from "../config/3d-model.config";

PainterModelConfig.forEach((model) => {
  useGLTF.preload(model.path);
});

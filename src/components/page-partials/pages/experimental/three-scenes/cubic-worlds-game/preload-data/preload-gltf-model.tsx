import { useGLTF } from "@react-three/drei";
import {
  PainterModelConfig,
  SingleAddModelConfig,
} from "../config/3d-model.config";

PainterModelConfig.forEach((model) => {
  useGLTF.preload(model.path);
});
SingleAddModelConfig.forEach((model) => {
  useGLTF.preload(model.path);
});

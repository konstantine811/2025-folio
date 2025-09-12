import { useGLTF } from "@react-three/drei";
import { modelConfig } from "../config/3d-model.confit";

Object.values(modelConfig).forEach((url) => {
  useGLTF.preload(url);
});

import { useGLTF } from "@react-three/drei";
import { JSX, useMemo } from "react";
import { ModelNames } from "./config";

interface Props {
  props?: JSX.IntrinsicElements["group"];
  modelName?: ModelNames;
}

const initPath = "/3d-models/views-model";

const ItemModel = ({ props, modelName = ModelNames.casual }: Props) => {
  const path = () => {
    if (modelName === ModelNames.casual) {
      return `${initPath}/${modelName}.gltf`;
    } else {
      return `${initPath}/${modelName}.glb`;
    }
  };
  const { scene } = useGLTF(path());
  const copiedScene = useMemo(() => scene.clone(), [scene]);
  return (
    <group {...props}>
      <primitive object={copiedScene} />
    </group>
  );
};

export default ItemModel;

useGLTF.preload(`${initPath}/${ModelNames.casual}.gltf`);
useGLTF.preload(`${initPath}/${ModelNames.classRoom}.glb`);
useGLTF.preload(`${initPath}/${ModelNames.macBook}.glb`);
useGLTF.preload(`${initPath}/${ModelNames.oculus}.glb`);
useGLTF.preload(`${initPath}/${ModelNames.phone}.glb`);
useGLTF.preload(`${initPath}/${ModelNames.vr}.glb`);
useGLTF.preload(`${initPath}/${ModelNames.flower_1}.glb`);
useGLTF.preload(`${initPath}/${ModelNames.flower_2}.glb`);
useGLTF.preload(`${initPath}/${ModelNames.flower_3}.glb`);
useGLTF.preload(`${initPath}/${ModelNames.flower_4}.glb`);
useGLTF.preload(`${initPath}/${ModelNames.flower_5}.glb`);

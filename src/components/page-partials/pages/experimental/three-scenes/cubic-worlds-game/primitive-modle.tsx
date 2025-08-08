import { useGLTF } from "@react-three/drei";
import { JSX, useEffect } from "react";

type Props = JSX.IntrinsicElements["group"] & {
  modelName: string;
};

const PrimitiveModel = ({ modelName, ...props }: Props) => {
  const path = `/3d-models/cubic-worlds-model/${modelName}`;
  const { scene } = useGLTF(path);
  useEffect(() => {
    useGLTF.preload(path);
  }, [path]);
  return (
    <group {...props}>
      <primitive object={scene} />
    </group>
  );
};

export default PrimitiveModel;

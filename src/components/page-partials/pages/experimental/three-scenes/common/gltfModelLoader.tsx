import { useGLTF } from "@react-three/drei";
import { JSX, useEffect, useMemo } from "react";
import { Mesh, Object3D } from "three";

type Props = JSX.IntrinsicElements["group"] & {
  modelName: string;
};

const GltfModelLoader = ({ modelName, ...props }: Props) => {
  const path = `/3d-models/${modelName}`;
  const { scene } = useGLTF(path);
  useEffect(() => {
    useGLTF.preload(path);
  }, [path]);
  const cloned = useMemo(() => scene.clone(true), [scene]);
  useEffect(() => {
    if (cloned) {
      cloned.traverse((obj: Object3D) => {
        if (obj instanceof Mesh) {
          obj.castShadow = true;
          obj.receiveShadow = true;
        }
      });
    }
  }, [cloned]);

  return (
    <group {...props}>
      <primitive object={cloned} />
    </group>
  );
};

export default GltfModelLoader;

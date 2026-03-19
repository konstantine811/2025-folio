import { useGLTF } from "@react-three/drei";

const ModelLoader = ({
  path,
  scale = 1,
  position,
}: {
  path: string;
  scale?: number;
  position?: [number, number, number];
}) => {
  const { scene } = useGLTF(path);

  return <primitive scale={scale} position={position} object={scene} />;
};

export default ModelLoader;

import { useGLTF } from "@react-three/drei";
export const Sword = ({ modelPath }: { modelPath: string }) => {
  const { scene } = useGLTF(modelPath, true);
  return <primitive object={scene} />;
};

import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { BufferGeometry, SphereGeometry } from "three";
import { RefObject, useEffect, useRef } from "react";

const SimpleShowModel = ({
  showIndexModel = 0,
  pathModel = "/3d-models/models.glb",
  uSectionProgressRef,
}: {
  showIndexModel: number;
  uSectionProgressRef: RefObject<number>;
  pathModel: string;
}) => {
  const { scene } = useGLTF(pathModel);
  const geometryRef = useRef<BufferGeometry>(new SphereGeometry(200, 64, 64));
  useEffect(() => {
    geometryRef.current.setIndex(null);
    geometryRef.current.deleteAttribute("normal");
    if (scene) {
    }
  }, [scene]);

  return (
    <>
      <mesh frustumCulled={false} geometry={geometryRef.current} scale={15}>
        <meshStandardMaterial color="red" />
      </mesh>
    </>
  );
};

export default SimpleShowModel;

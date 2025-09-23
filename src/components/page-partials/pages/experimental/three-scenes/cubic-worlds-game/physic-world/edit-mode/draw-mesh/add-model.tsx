import { useRef } from "react";
import {
  BufferGeometry,
  InstancedMesh,
  Material,
  Matrix4,
  NormalBufferAttributes,
  ShaderMaterial,
} from "three";
import useCreateInstancedMesh from "./hooks/useCreateInstancedMesh";

type AddModelProps = {
  meshName?: string;
  matrices: Matrix4[];
  material: ShaderMaterial | Material;
  blade: BufferGeometry<NormalBufferAttributes>;
  onMatrixUpdate?: (index: number) => void;
  onAddGeometryData?: (geom: BufferGeometry<NormalBufferAttributes>) => void;
};

const AddModel = ({
  matrices,
  material,
  blade,
  onAddGeometryData,
  onMatrixUpdate,
}: AddModelProps) => {
  const meshRef = useRef<InstancedMesh>(null!);
  const { geometry, COUNT } = useCreateInstancedMesh({
    matrices,
    blade,
    meshRef,
    onAddGeometryData,
    onMatrixUpdate,
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, COUNT]}
      receiveShadow
      castShadow
    />
  );
};

export default AddModel;

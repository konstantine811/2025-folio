import { useRef, useState, useCallback } from "react";
import {
  BufferGeometry,
  InstancedMesh,
  Matrix4,
  NormalBufferAttributes,
  ShaderMaterial,
} from "three";
import { TransformControls as TransformControlsImpl } from "three-stdlib";
import { ThreeEvent } from "@react-three/fiber";
import TransformInstanceMatrix from "../transform-mesh/transform-instance-matrix";
import useCreateInstancedMesh from "./hooks/useCreateInstancedMesh";

type AddModelProps = {
  matrices: Matrix4[];
  material: ShaderMaterial;
  blade: BufferGeometry<NormalBufferAttributes>;
  onAddGeometryData?: (geom: BufferGeometry<NormalBufferAttributes>) => void;
  onMatrixUpdate?: (index: number) => void;
  // новий колбек — сюди віддаємо оновлену матрицю конкретного індексу
  onMatrixChange?: (index: number, next: Matrix4) => void;
};

const AddModel = ({
  matrices,
  material,
  blade,
  onAddGeometryData,
  onMatrixChange,
  onMatrixUpdate,
}: AddModelProps) => {
  const meshRef = useRef<InstancedMesh>(null!);
  const controlsRef = useRef<TransformControlsImpl>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const { geometry, COUNT } = useCreateInstancedMesh({
    matrices,
    blade,
    onAddGeometryData,
    onMatrixUpdate,
    meshRef,
  });

  // вибір інстанса кліком
  const onPickInstance = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const idx = e.instanceId as number | undefined;
    if (idx == null) return;
    setSelected(idx);
  }, []);

  const clearSelection = useCallback(() => {
    setSelected(null);
    controlsRef.current?.detach();
  }, []);

  return (
    <>
      <instancedMesh
        ref={meshRef}
        args={[geometry, material, COUNT]}
        castShadow
        onPointerDown={onPickInstance} // клік = вибір
        onPointerMissed={clearSelection} // клік у порожнє — зняти вибір
      />
      <TransformInstanceMatrix
        ref={controlsRef}
        instancedMesh={meshRef.current}
        onMatrixChange={onMatrixChange}
        selectedId={selected}
        geometry={geometry}
      />
    </>
  );
};

export default AddModel;

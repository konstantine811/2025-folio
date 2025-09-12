import { useCallback, useEffect, useMemo } from "react";
import {
  BufferGeometry,
  DynamicDrawUsage,
  InstancedBufferAttribute,
  Matrix4,
  NormalBufferAttributes,
  ShaderMaterial,
} from "three";
import AddModel from "../add-model";
import AddModelEdit from "../add-model-edit";

type Props = {
  meshName?: string;
  matrices: Matrix4[];
  material: ShaderMaterial;
  blade: BufferGeometry<NormalBufferAttributes>;
  isEditMode: boolean;
  onUpdate?: () => void;
};

const AddWinderInstancedModelWrap = ({
  matrices,
  material,
  blade,
  isEditMode = false,
  onUpdate,
}: Props) => {
  const COUNT = Math.max(matrices.length, 1);

  const aBend = useMemo(() => new Float32Array(COUNT), [COUNT]);
  const aPhase = useMemo(() => new Float32Array(COUNT), [COUNT]); // додатковий атрибут фази

  const onMatrixUpdate = useCallback(
    (index: number) => {
      aBend[index] = 0.7 + ((index * 0.13) % 0.3);
      aPhase[index] = (index * 0.37) % 1.0;
    },
    [aBend, aPhase]
  );

  const onAddGeometryData = useCallback(
    (geom: BufferGeometry<NormalBufferAttributes>) => {
      const bendAttr = new InstancedBufferAttribute(aBend, 1);
      const phaseAttr = new InstancedBufferAttribute(aPhase, 1);
      bendAttr.setUsage(DynamicDrawUsage);
      phaseAttr.setUsage(DynamicDrawUsage);
      geom.setAttribute("aBend", bendAttr);
      geom.setAttribute("aPhase", phaseAttr);
      bendAttr.needsUpdate = true;
      phaseAttr.needsUpdate = true;
    },
    [aBend, aPhase]
  );

  // цей колбек передамо в AddModelEdit
  const handleMatrixChange = useCallback(
    (index: number, nextM: Matrix4) => {
      // Замість: matrices[index] = nextM;
      // Правильно:
      if (matrices[index]) {
        matrices[index].copy(nextM);
      } else {
        matrices[index] = nextM.clone(); // на випадок, якщо індекс новий
      }
      onUpdate?.();
    },
    [matrices, onUpdate]
  );

  useEffect(() => {
    if (isEditMode) {
      material.uniforms._fallbackEdgeDark.value = 5;
    } else {
      material.uniforms._fallbackEdgeDark.value = 2.01;
    }
  }, [material, isEditMode]);

  return (
    <>
      {!isEditMode ? (
        <AddModel
          material={material}
          matrices={matrices}
          blade={blade}
          onMatrixUpdate={onMatrixUpdate}
          onAddGeometryData={onAddGeometryData}
        />
      ) : (
        <AddModelEdit
          material={material}
          matrices={matrices}
          blade={blade}
          onMatrixUpdate={onMatrixUpdate}
          onAddGeometryData={onAddGeometryData}
          onMatrixChange={handleMatrixChange}
        />
      )}
    </>
  );
};

export default AddWinderInstancedModelWrap;

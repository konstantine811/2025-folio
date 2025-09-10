import { useCallback, useMemo } from "react";
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
};

const AddWinderInstancedModelWrap = ({
  matrices,
  material,
  blade,
  isEditMode = false,
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
        />
      )}
    </>
  );
};

export default AddWinderInstancedModelWrap;

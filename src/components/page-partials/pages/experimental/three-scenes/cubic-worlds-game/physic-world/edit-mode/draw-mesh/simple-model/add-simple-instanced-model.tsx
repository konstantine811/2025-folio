import {
  BufferGeometry,
  Material,
  Matrix4,
  NormalBufferAttributes,
} from "three";
import AddModel from "../add-model";
import AddModelEdit from "../add-model-edit";
import { useCallback } from "react";

type Props = {
  meshName?: string;
  matrices: Matrix4[];
  material: Material;
  blade: BufferGeometry<NormalBufferAttributes>;
  isEditMode: boolean;
  onUpdate?: () => void;
};

const AddSimpleInstancedModelWrap = ({
  matrices,
  material,
  blade,
  isEditMode = false,
  onUpdate,
}: Props) => {
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

  return (
    <>
      {!isEditMode ? (
        <AddModel material={material} matrices={matrices} blade={blade} />
      ) : (
        <AddModelEdit
          material={material}
          matrices={matrices}
          blade={blade}
          onMatrixChange={handleMatrixChange}
        />
      )}
    </>
  );
};

export default AddSimpleInstancedModelWrap;

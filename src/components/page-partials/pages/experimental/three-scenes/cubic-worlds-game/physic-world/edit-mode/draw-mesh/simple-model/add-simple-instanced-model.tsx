import {
  BufferGeometry,
  Material,
  Matrix4,
  NormalBufferAttributes,
} from "three";
import AddModel from "../add-model";
import AddModelEdit from "../add-model-edit";
import { useCallback, useState } from "react";
import { PhysicsData } from "../../../../store/useEditModeStore";
import AddModelPhysics from "../add-model-physics";

type Props = {
  meshName?: string;
  matrices: Matrix4[];
  material: Material;
  blade: BufferGeometry<NormalBufferAttributes>;
  isEditMode: boolean;
  onUpdate?: () => void;
  physicsData?: PhysicsData | null;
  id: string;
};

const AddSimpleInstancedModelWrap = ({
  matrices,
  material,
  blade,
  isEditMode = false,
  onUpdate,
  physicsData,
  id,
}: Props) => {
  // цей колбек передамо в AddModelEdit
  const [update, setUpdate] = useState(true);
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

  const handleDeleteMatrixChange = useCallback(
    (index: number) => {
      // Замість: matrices[index] = nextM;
      // Правильно:
      setUpdate(false);
      matrices.splice(index, 1);

      onUpdate?.();
      // невелика затримка, щоб скинути ререндер
      setTimeout(() => {
        setUpdate(true);
      }, 0);
    },
    [matrices, onUpdate]
  );
  return (
    <>
      {!isEditMode ? (
        <>
          {physicsData && physicsData.isPhysicsEnabled ? (
            <AddModelPhysics
              material={material}
              matrices={matrices}
              blade={blade}
              physicsData={physicsData}
            />
          ) : (
            <AddModel material={material} matrices={matrices} blade={blade} />
          )}
        </>
      ) : (
        <>
          {update && (
            <AddModelEdit
              material={material}
              matrices={matrices}
              blade={blade}
              onMatrixChange={handleMatrixChange}
              onDelete={handleDeleteMatrixChange}
              isPhysics={!!physicsData?.isPhysicsEnabled}
              id={id}
            />
          )}
        </>
      )}
    </>
  );
};

export default AddSimpleInstancedModelWrap;

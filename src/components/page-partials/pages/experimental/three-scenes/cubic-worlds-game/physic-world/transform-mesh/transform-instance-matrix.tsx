import { forwardRef, useCallback, useLayoutEffect } from "react";
import { InstancedMesh, Matrix4, Object3D, Object3DEventMap } from "three";
import { TransformControls as TransformControlsImpl } from "three-stdlib";
import { updateWorldUpwards } from "../../utils/updateWorld";
import { TransformControls } from "@react-three/drei";
import { TransformMode } from "@/config/three-world/transform.config";

type Props = {
  instancedMesh: InstancedMesh | null;
  onMatrixChange?: (index: number, next: Matrix4) => void;
  selectedId: number | null;
  mode?: TransformMode;
  editDummy: Object3D<Object3DEventMap>;
  outlineInstance: InstancedMesh | null;
};

const TransformInstanceMatrix = forwardRef<TransformControlsImpl, Props>(
  (
    {
      instancedMesh,
      onMatrixChange,
      selectedId,
      mode = TransformMode.Translate,
      editDummy,
      outlineInstance,
    },
    ref
  ) => {
    // dummy, яким рухаємо через TransformControls

    useLayoutEffect(() => {
      if (selectedId == null || !instancedMesh) return;

      updateWorldUpwards(instancedMesh); // <— важливо

      // локальна матриця інстанса
      const localM = new Matrix4();
      instancedMesh.getMatrixAt(selectedId, localM);

      // світова матриця: M_world = M_meshWorld * M_instance
      const worldM = instancedMesh.matrixWorld.clone().multiply(localM);

      // задаємо dummy через де-композицію
      editDummy.matrixAutoUpdate = false; // щоб поважати виставлену нами matrix
      editDummy.matrix.copy(worldM);
      editDummy.matrix.decompose(
        editDummy.position,
        editDummy.quaternion,
        editDummy.scale
      );
      editDummy.matrixAutoUpdate = true; // назад, щоб гізмо міг рухати обʼєкт
      editDummy.updateMatrixWorld(true);
    }, [selectedId, editDummy, instancedMesh]);

    // запис назад у інстанс і у зовнішній масив матриць
    const commitTransform = useCallback(() => {
      if (selectedId == null || !instancedMesh) return;
      // updateOutline(selectedId);
      editDummy.updateMatrixWorld(true);
      editDummy.updateMatrix(); // з pos/quat/scale → matrix

      // повертаємо ЛОКАЛЬНУ інстанс-матрицю, не світову!
      // local = inverse(M_meshWorld) * world
      const local = new Matrix4()
        .copy(instancedMesh.matrixWorld)
        .invert()
        .multiply(editDummy.matrix);

      instancedMesh.setMatrixAt(selectedId, local);
      instancedMesh.instanceMatrix.needsUpdate = true;
      if (outlineInstance) {
        outlineInstance.setMatrixAt(0, local);
        outlineInstance.instanceMatrix.needsUpdate = true;
      }
      onMatrixChange?.(selectedId, local.clone());
    }, [selectedId, onMatrixChange, editDummy, instancedMesh, outlineInstance]);

    return (
      <>
        {selectedId !== null && (
          <>
            <TransformControls
              object={editDummy}
              ref={ref}
              mode={mode}
              key={selectedId}
              space="local"
              onObjectChange={commitTransform}
              showX
              showY
              showZ
            />
            <primitive object={editDummy} visible={false} />
          </>
        )}
      </>
    );
  }
);

export default TransformInstanceMatrix;

import { forwardRef, useCallback, useLayoutEffect, useMemo } from "react";
import {
  BackSide,
  BufferGeometry,
  InstancedMesh,
  Matrix4,
  NormalBufferAttributes,
  Object3D,
} from "three";
import { TransformControls as TransformControlsImpl } from "three-stdlib";
import { updateWorldUpwards } from "../../utils/updateWorld";
import { TransformControls } from "@react-three/drei";

type Props = {
  instancedMesh: InstancedMesh | null;
  onMatrixChange?: (index: number, next: Matrix4) => void;
  selectedId: number | null;
  geometry: BufferGeometry<NormalBufferAttributes>;
  mode?: "translate" | "rotate" | "scale";
};

const TransformInstanceMatrix = forwardRef<TransformControlsImpl, Props>(
  (
    { instancedMesh, onMatrixChange, selectedId, geometry, mode = "translate" },
    ref
  ) => {
    // dummy, яким рухаємо через TransformControls
    const editDummy = useMemo(() => {
      const o = new Object3D();
      o.matrixAutoUpdate = true; // потрібно для TransformControls
      return o;
    }, []);

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
      onMatrixChange?.(selectedId, local.clone());
    }, [selectedId, onMatrixChange, editDummy, instancedMesh]);

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
              onChange={commitTransform}
              onPointerDown={commitTransform}
              showX
              showY
              showZ
            />
            <primitive object={editDummy}>
              {/* Силует: збільшений бекфейс тієї ж геометрії */}
              <mesh
                geometry={geometry}
                scale={1.06} // трішки більший
                renderOrder={999} // поверх іншого
                frustumCulled={false}
              >
                <meshBasicMaterial
                  color={0xff0000}
                  side={BackSide} // бекфейс → силует
                  transparent
                  opacity={1}
                  polygonOffset // без з-файту
                  polygonOffsetFactor={-1}
                  polygonOffsetUnits={-1}
                />
              </mesh>
            </primitive>
          </>
        )}
      </>
    );
  }
);

export default TransformInstanceMatrix;

import { useRef, useState, useCallback, useMemo, useEffect } from "react";
import {
  BufferGeometry,
  FrontSide,
  InstancedMesh,
  Material,
  Matrix4,
  MeshBasicMaterial,
  NormalBufferAttributes,
  Object3D,
  ShaderMaterial,
} from "three";
import { ThreeEvent } from "@react-three/fiber";
import TransformInstanceMatrix from "../../transform-mesh/transform-instance-matrix";
import useCreateInstancedMesh from "./hooks/useCreateInstancedMesh";
import EditKeyModelInstance from "./edit/edit-key-model-instance";
import { useEditModeStore } from "../../../store/useEditModeStore";

type AddModelProps = {
  matrices: Matrix4[];
  material: ShaderMaterial | Material;
  blade: BufferGeometry<NormalBufferAttributes>;
  onAddGeometryData?: (geom: BufferGeometry<NormalBufferAttributes>) => void;
  onMatrixUpdate?: (index: number) => void;
  // новий колбек — сюди віддаємо оновлену матрицю конкретного індексу
  onMatrixChange: (index: number, next: Matrix4) => void;
  onDelete: (index: number) => void;
};

const AddModelEdit = ({
  matrices,
  material,
  blade,
  onAddGeometryData,
  onMatrixChange,
  onMatrixUpdate,
  onDelete,
}: AddModelProps) => {
  const meshRef = useRef<InstancedMesh>(null!);
  const { editTransformMode } = useEditModeStore();
  // ⬇️ outline instancedMesh (count=1) — показує обвідку вибраного
  const outlineRef = useRef<InstancedMesh>(null!);
  const editDummy = useMemo(() => {
    const o = new Object3D();
    o.matrixAutoUpdate = true; // потрібно для TransformControls
    return o;
  }, []);
  const [selected, setSelected] = useState<number | null>(null);

  const { geometry, COUNT } = useCreateInstancedMesh({
    matrices,
    blade,
    onAddGeometryData,
    onMatrixUpdate,
    meshRef,
  });

  const outlineMat = useMemo(
    () =>
      new MeshBasicMaterial({
        color: 0xff0055,
        side: FrontSide,
        transparent: true,
        opacity: 0.5,
        depthTest: false,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      }),
    []
  );

  // оновити outline під конкретний індекс
  const updateOutline = useCallback(
    (idx: number | null) => {
      const om = outlineRef.current;
      const im = meshRef.current;
      if (!om || !im) return;

      if (idx == null) {
        om.count = 0;
        om.visible = false;
        om.instanceMatrix.needsUpdate = true;
        return;
      }

      im.getMatrixAt(idx, editDummy.matrix);
      // злегка збільшуємо
      editDummy.matrix.decompose(
        editDummy.position,
        editDummy.quaternion,
        editDummy.scale
      );
      editDummy.scale.multiplyScalar(1.06);
      editDummy.matrix.compose(
        editDummy.position,
        editDummy.quaternion,
        editDummy.scale
      );

      om.setMatrixAt(0, editDummy.matrix);
      om.count = 1;
      om.visible = true;
      om.instanceMatrix.needsUpdate = true;
    },
    [editDummy]
  );

  // вибір інстансу кліком
  const onPickInstance = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      const idx = e.instanceId as number | undefined;
      if (idx == null) return;
      setSelected(idx);
      updateOutline(idx);
    },
    [updateOutline]
  );

  const onMissOrConfirm = useCallback(() => {
    setSelected(null);
    updateOutline(null);
  }, [updateOutline]);

  useEffect(() => {
    if (!outlineRef.current) return;
    outlineRef.current.raycast = () => null; // ігнорувати хіти
  }, []);

  return (
    <>
      <instancedMesh
        ref={meshRef}
        args={[geometry, material, COUNT]}
        castShadow
        onPointerDown={onPickInstance} // клік = вибір
        onPointerMissed={onMissOrConfirm} // клік у порожнє — зняти вибір
      />
      <instancedMesh
        ref={outlineRef}
        args={[geometry, outlineMat, 1]}
        frustumCulled={false}
        visible={false}
      />
      {editTransformMode ? (
        <TransformInstanceMatrix
          selectedId={selected}
          editDummy={editDummy}
          mode={editTransformMode}
          instancedMesh={meshRef.current}
          onMatrixChange={onMatrixChange}
          outlineInstance={outlineRef.current}
        />
      ) : (
        <EditKeyModelInstance
          meshRef={meshRef}
          editDummy={editDummy}
          onMatrixChange={onMatrixChange}
          selected={selected}
          updateOutline={updateOutline}
          onSelect={setSelected}
          onDelete={onDelete}
        />
      )}
    </>
  );
};

export default AddModelEdit;

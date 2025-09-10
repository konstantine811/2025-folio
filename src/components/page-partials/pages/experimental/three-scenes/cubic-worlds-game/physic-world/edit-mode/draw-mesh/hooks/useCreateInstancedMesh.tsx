import { RefObject, useLayoutEffect, useMemo } from "react";
import {
  Box3,
  BufferGeometry,
  DynamicDrawUsage,
  InstancedMesh,
  NormalBufferAttributes,
  Sphere,
} from "three";
import { Matrix4 } from "three";

type Props = {
  matrices: Matrix4[];
  blade: BufferGeometry<NormalBufferAttributes>;
  onAddGeometryData?: (geom: BufferGeometry<NormalBufferAttributes>) => void;
  onMatrixUpdate?: (index: number) => void;
  meshRef: RefObject<InstancedMesh<
    BufferGeometry<NormalBufferAttributes>
  > | null>;
};

const useCreateInstancedMesh = ({
  matrices,
  blade,
  onAddGeometryData,
  onMatrixUpdate,
  meshRef,
}: Props) => {
  const COUNT = Math.max(matrices.length, 1);

  const { geometry, bbox } = useMemo(() => {
    const g = blade.clone();
    if (!g.boundingBox) g.computeBoundingBox();
    return { geometry: g, bbox: g.boundingBox!.clone() };
  }, [blade]);

  useLayoutEffect(() => {
    if (!meshRef.current) return;

    const inst = meshRef.current;
    if (!inst) return;

    // зводимо AABB усіх інстансів у локалі inst

    // навіть якщо в осередку 0 штук — тримаємо 1 «пустий» слот
    // запис матриць
    for (let i = 0; i < matrices.length; i++) {
      inst.setMatrixAt(i, matrices[i]);
      if (onMatrixUpdate) {
        onMatrixUpdate(i);
      }
    }
    inst.count = matrices.length; // скільки рендерити реально
    inst.instanceMatrix.needsUpdate = true;

    if (matrices.length > 0) {
      const worldBB = new Box3().makeEmpty();
      const tmpBB = new Box3();
      const tmpM = new Matrix4();

      for (let i = 0; i < matrices.length; i++) {
        inst.getMatrixAt(i, tmpM);
        tmpBB.copy(bbox).applyMatrix4(tmpM);
        worldBB.union(tmpBB);
      }
      // призначаємо boundingSphere САМЕ МЕШУ (це важливо для frustum)
      const bs = worldBB.getBoundingSphere(new Sphere());
      inst.boundingSphere = bs;
    } else {
      // пустий чанк — дайте крихітну сферу, щоб не зникали матеріали
      inst.boundingSphere = new Sphere();
    }

    inst.frustumCulled = true;

    const geom = meshRef.current.geometry as BufferGeometry;
    if (onAddGeometryData) {
      onAddGeometryData(geom);
    }
    geom.computeBoundingSphere(); // або frustumCulled=false
    meshRef.current.instanceMatrix.setUsage(DynamicDrawUsage);
    meshRef.current.instanceMatrix.needsUpdate = true;
    return () => {
      // важливо, бо geometry клонована
      inst.geometry?.dispose();
    };
  }, [COUNT, matrices, bbox, onMatrixUpdate, onAddGeometryData, meshRef]);

  return { geometry, COUNT };
};

export default useCreateInstancedMesh;

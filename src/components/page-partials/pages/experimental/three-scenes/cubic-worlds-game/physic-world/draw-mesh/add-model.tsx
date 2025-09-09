import { useLayoutEffect, useMemo, useRef } from "react";
import {
  Box3,
  BufferGeometry,
  DynamicDrawUsage,
  InstancedMesh,
  Matrix4,
  NormalBufferAttributes,
  Object3D,
  ShaderMaterial,
  Sphere,
} from "three";

type AddModelProps = {
  meshName?: string;
  matrices: Matrix4[];
  material: ShaderMaterial;
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
  const dummy = useMemo(() => new Object3D(), []);
  const COUNT = Math.max(matrices.length, 1);

  // ❗ Кожному інстанс-мешу — своя геометрія (щоб не ділити інстанс-атрибути)
  const { geometry, bbox } = useMemo(() => {
    const g = blade.clone();
    // якщо є interleaved-атрибути/морфи — інколи краще g = bladeGeom.toNonIndexed().clone()
    if (!g.boundingBox) g.computeBoundingBox();
    return { geometry: g, bbox: g.boundingBox!.clone() };
  }, [blade]);

  // базовий локальний AABB геометрії (1 раз

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
  }, [dummy, COUNT, matrices, bbox, onMatrixUpdate, onAddGeometryData]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, COUNT]}
      receiveShadow
    />
  );
};

export default AddModel;

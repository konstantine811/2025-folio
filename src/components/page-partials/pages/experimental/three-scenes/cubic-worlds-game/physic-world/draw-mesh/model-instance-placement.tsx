import { useLayoutEffect, useMemo, useRef } from "react";
import {
  Box3,
  BufferGeometry,
  InstancedMesh,
  Matrix4,
  MeshBasicMaterial,
  Sphere,
} from "three";

type ModelInstancedPlacementProps = {
  matrices: Matrix4[];
  geometry: BufferGeometry;
  material: MeshBasicMaterial;
};

export function ModelInstancedPlacement({
  matrices,
  geometry,
  material,
}: ModelInstancedPlacementProps) {
  const COUNT = Math.max(matrices.length, 1);
  const instRef = useRef<InstancedMesh>(null!);
  // базовий локальний AABB геометрії (1 раз)
  const baseBB = useMemo(() => {
    if (!geometry.boundingBox) geometry.computeBoundingBox();
    return geometry.boundingBox!.clone();
  }, [geometry]);

  useLayoutEffect(() => {
    const inst = instRef.current;
    if (!inst) return;

    // зводимо AABB усіх інстансів у локалі inst

    // навіть якщо в осередку 0 штук — тримаємо 1 «пустий» слот
    // запис матриць
    for (let i = 0; i < matrices.length; i++) inst.setMatrixAt(i, matrices[i]);
    inst.count = matrices.length; // скільки рендерити реально
    inst.instanceMatrix.needsUpdate = true;

    if (matrices.length > 0) {
      const worldBB = new Box3().makeEmpty();
      const tmpBB = new Box3();
      const tmpM = new Matrix4();

      for (let i = 0; i < matrices.length; i++) {
        inst.getMatrixAt(i, tmpM);
        tmpBB.copy(baseBB).applyMatrix4(tmpM);
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
  }, [matrices, baseBB]);

  return (
    <instancedMesh
      ref={instRef}
      args={[geometry, material, COUNT]}
      receiveShadow
    />
  );
}

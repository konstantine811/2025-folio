import { Box3, InstancedMesh, Matrix4, Sphere } from "three";

export function updateInstancedBoundingSphere(geom: InstancedMesh) {
  // 1) базовий локальний бокс геометрії (роби один раз і кешуй)
  geom.computeBoundingBox();
  const baseBB = geom.boundingBox!.clone();

  // 2) зводимо загальний WORLD-бокс для всіх інстансів
  const worldBB = new Box3().makeEmpty();
  const tmpBB = new Box3();
  const tmpM = new Matrix4();

  for (let i = 0; i < geom.count; i++) {
    geom.getMatrixAt(i, tmpM); // матриця інстанса (локально до inst)
    tmpBB.copy(baseBB).applyMatrix4(tmpM); // переносимо бокс у простір inst
    worldBB.union(tmpBB);
  }

  // 3) рахуємо сферу і призначаємо ЇЇ САМЕ МЕШУ (inst)
  const bs = worldBB.getBoundingSphere(new Sphere());
  geom.boundingSphere = bs;
}

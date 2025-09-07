import { BufferAttribute, BufferGeometry } from "three";

// Додаємо aTip (0..1) за Y-віссю
export function prepareGeomtry(src: BufferGeometry) {
  const geom = src.clone();
  geom.computeBoundingBox();
  const bb = geom.boundingBox!;
  const pos = geom.attributes.position as BufferAttribute;
  const count = pos.count;

  const tip = new Float32Array(count);
  const height = Math.max(1e-6, bb.max.y - bb.min.y);
  for (let i = 0; i < count; i++) {
    const y = pos.getY(i);
    tip[i] = (y - bb.min.y) / height;
  }
  geom.setAttribute("aTip", new BufferAttribute(tip, 1));
  geom.computeBoundingSphere();
  return geom;
}

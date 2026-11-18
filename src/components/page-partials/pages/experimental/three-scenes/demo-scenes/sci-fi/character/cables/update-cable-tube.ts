import { Curve, TubeGeometry, Vector3 } from "three";

const point = new Vector3();
const normal = new Vector3();

/** Deform existing GPU buffers; indices and UVs do not change as ropes move. */
export function updateCableTube(geometry: TubeGeometry, curve: Curve<Vector3>) {
  const { tubularSegments, radialSegments, radius } = geometry.parameters;
  const frames = curve.computeFrenetFrames(tubularSegments, false);
  const positions = geometry.getAttribute("position");
  const normals = geometry.getAttribute("normal");

  for (let i = 0; i <= tubularSegments; i++) {
    curve.getPointAt(i / tubularSegments, point);
    const n = frames.normals[i];
    const b = frames.binormals[i];
    for (let j = 0; j <= radialSegments; j++) {
      const angle = j / radialSegments * Math.PI * 2;
      const cosine = -Math.cos(angle);
      const sine = Math.sin(angle);
      normal.set(
        cosine * n.x + sine * b.x,
        cosine * n.y + sine * b.y,
        cosine * n.z + sine * b.z,
      ).normalize();
      const index = i * (radialSegments + 1) + j;
      normals.setXYZ(index, normal.x, normal.y, normal.z);
      positions.setXYZ(index,
        point.x + radius * normal.x,
        point.y + radius * normal.y,
        point.z + radius * normal.z,
      );
    }
  }
  positions.needsUpdate = true;
  normals.needsUpdate = true;
}

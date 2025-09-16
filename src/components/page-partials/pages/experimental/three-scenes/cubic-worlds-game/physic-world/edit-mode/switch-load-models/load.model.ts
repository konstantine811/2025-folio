import {
  BufferGeometry,
  Material,
  NormalBufferAttributes,
  ShaderMaterial,
} from "three";

export type MeshData = { geometry: BufferGeometry; material: Material };
export type MeshShaderData = {
  geometry: BufferGeometry;
  material: ShaderMaterial;
};
export type LoadModelProps = {
  modelUrl: string;
  onCreateModelGeom: (
    geom: BufferGeometry<NormalBufferAttributes>,
    material: Material | ShaderMaterial
  ) => void;
};

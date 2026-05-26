import { Mesh, MeshStandardMaterial, Object3D } from "three";

export const TABLE_GLOW_MATERIAL_NAME = "Glow";

/** GLB default via KHR_materials_emissive_strength — too hot with Bloom. */
export const tableGlowMaterialDefaults: {
  emissiveIntensity: number;
  emissiveColorScale: number;
} = {
  emissiveIntensity: 7,
  emissiveColorScale: 0.45,
};

export type TableGlowTune = {
  emissiveIntensity: number;
  emissiveColorScale: number;
};

export function createTunedTableGlowMaterial(
  source: MeshStandardMaterial,
  tune: TableGlowTune = tableGlowMaterialDefaults,
) {
  const material = source.clone();
  material.emissive
    .copy(source.emissive)
    .multiplyScalar(tune.emissiveColorScale);
  material.emissiveIntensity = tune.emissiveIntensity;
  material.toneMapped = true;
  return material;
}

export function applyTableGlowMaterial(root: Object3D, glowMaterial: MeshStandardMaterial) {
  root.traverse((child) => {
    const mesh = child as Mesh;
    if (!mesh.isMesh) return;

    if (Array.isArray(mesh.material)) {
      mesh.material = mesh.material.map((material) =>
        material.name === TABLE_GLOW_MATERIAL_NAME ? glowMaterial : material,
      );
      return;
    }

    if (mesh.material?.name === TABLE_GLOW_MATERIAL_NAME) {
      mesh.material = glowMaterial;
    }
  });
}

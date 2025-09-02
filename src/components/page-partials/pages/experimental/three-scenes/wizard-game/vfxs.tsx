import { RenderMode } from "@/types/three/vfx-particles.model";
import VFXParticles from "../vfx-engine/vfxs/vfx-particles";
import { useGLTF, useTexture } from "@react-three/drei";
import { SkinnedMesh } from "three";

const VFXS = () => {
  const texture = useTexture(
    "/images/textures/kenney_particle-pack/png_transparent/magic_01.png"
  );
  const { nodes } = useGLTF("/3d-models/wizard-model/Icicle.glb");
  return (
    <>
      <VFXParticles
        name="sparks"
        geometry={<coneGeometry args={[0.5, 1, 8, 1]} />}
        settings={{
          nbParticles: 100000,
          renderMode: RenderMode.billboard,
          intensity: 3,
          fadeSize: [0.1, 0.1],
        }}
      />
      <VFXParticles
        name="spheres"
        geometry={<sphereGeometry args={[1, 32, 32]} />}
        settings={{
          nbParticles: 1000,
          renderMode: RenderMode.mesh,
          intensity: 5,
          fadeSize: [0.7, 0.9],
          fadeAlpha: [0, 1],
        }}
      />
      <VFXParticles
        name="writings"
        geometry={<circleGeometry args={[1, 32]} />}
        alphaMap={texture}
        settings={{
          nbParticles: 100,
          renderMode: RenderMode.mesh,
          fadeAlpha: [0.9, 1.0],
          fadeSize: [0.3, 0.9],
        }}
      />
      <VFXParticles
        name="icicle"
        geometry={<primitive object={(nodes.icicle as SkinnedMesh).geometry} />}
        settings={{
          nbParticles: 100,
          renderMode: RenderMode.mesh,
          fadeAlpha: [0, 1.0],
          fadeSize: [0.2, 0.8],
        }}
      />
    </>
  );
};

export default VFXS;

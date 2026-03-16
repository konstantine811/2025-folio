import {
  RenderMode,
  SpawnMode,
  VFXSettings,
} from "@/types/three/vfx-particles.model";
import VFXParticles from "../../vfx-engine/vfxs/vfx-particles";
import { Object3D } from "three";

const swordSlashSettings: Partial<VFXSettings> = {
  nbParticles: 12,
  duration: 0.04,
  delay: 0,
  spawnMode: SpawnMode.burst,
  loop: false,

  renderMode: RenderMode.mesh, // або billboard
  particlesLifetime: [0.08, 0.16],

  speed: [2, 6],
  size: [0.6, 1.4],

  startPositionMin: [-0.05, -0.05, -0.05],
  startPositionMax: [0.05, 0.05, 0.05],

  startRotationMin: [0, 0, -0.3],
  startRotationMax: [0, 0, 0.3],

  rotationSpeedMin: [0, 0, -6],
  rotationSpeedMax: [0, 0, 6],

  directionMin: [-0.2, -0.1, 0.6],
  directionMax: [0.2, 0.1, 1.2],

  colorStart: ["#7dd3fc", "#ffffff"],
  colorEnd: ["#2563eb", "#60a5fa"],

  fadeSize: [0.02, 0.75],
  fadeAlpha: [0.03, 0.65],

  gravity: [0, 0, 0],
  intensity: 2.5,
};

export const SlashTrail = () => {
  return (
    <VFXParticles
      name="swordSlash"
      settings={swordSlashSettings}
      //   alphaMap={slashTexture}
      geometry={<planeGeometry args={[0.25, 1.6]} />}
    />
  );
};

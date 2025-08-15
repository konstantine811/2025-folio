import { Environment, OrbitControls, Stats } from "@react-three/drei";
import VFXParticles from "./vfxs/vfx-particles";
import VFXEmitter from "./vfxs/vfx-emitter";

const Experience = () => {
  return (
    <>
      <Stats />
      <Environment preset="sunset" />
      <OrbitControls enablePan={false} />
      <VFXParticles name="sparks" settings={{ nbParticles: 1000 }} />
      <VFXEmitter emitter="sparks" />
    </>
  );
};

export default Experience;

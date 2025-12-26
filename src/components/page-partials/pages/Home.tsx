import { useHeaderSizeStore } from "@/storage/headerSizeStore";
import Portfolio from "./portfolio/Portfolio";
import HorizontalLine from "@/components/ui-abc/shapes/horizontal-line";
import TechStack from "./portfolio/TechStack/TechStack";
import Experience from "./portfolio/Experience/Experience";
import ScollParticleMorphing from "./experimental/three-scenes/scroll-particle-morphing/init";
const Home = () => {
  const hs = useHeaderSizeStore((state) => state.size);
  // const uid = import.meta.env.VITE_CONSTANTINE_UID;
  return (
    <ScollParticleMorphing
      totalPages={3.2}
      pathModel="/3d-models/folio-scene/morphScene.glb"
    >
      <div
        className="relative w-screen bg-background/30 backdrop-blur-xs"
        style={{ top: `${hs}px` }}
      >
        <div>
          <Portfolio />
          <HorizontalLine className="my-5 lg:my-20 container mx-auto" />
        </div>
        <div>
          <TechStack />
          <HorizontalLine className="my-5 lg:my-20 container mx-auto" />
        </div>
        <Experience />
      </div>
    </ScollParticleMorphing>
  );
};

export default Home;

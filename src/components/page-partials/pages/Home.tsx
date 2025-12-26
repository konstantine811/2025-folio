import { useHeaderSizeStore } from "@/storage/headerSizeStore";
import Portfolio from "./portfolio/Portfolio";
import HorizontalLine from "@/components/ui-abc/shapes/horizontal-line";
import TechStack from "./portfolio/TechStack/TechStack";
import Experience from "./portfolio/Experience/Experience";
import ScollParticleMorphing from "./experimental/three-scenes/scroll-particle-morphing/init";
const Home = () => {
  const hs = useHeaderSizeStore((state) => state.size);
  return (
    <ScollParticleMorphing totalPages={3}>
      <div
        className="relative z-10"
        style={{ top: `${hs}px`, paddingBottom: "20vh" }}
      >
        <Portfolio />
        <HorizontalLine className="my-5 lg:my-20 container mx-auto" />
        <TechStack />
        <HorizontalLine className="my-5 lg:my-20 container mx-auto" />
        <Experience />
      </div>
    </ScollParticleMorphing>
  );
};

export default Home;

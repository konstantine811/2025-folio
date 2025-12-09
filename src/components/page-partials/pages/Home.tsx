import { useHeaderSizeStore } from "@/storage/headerSizeStore";
import Portfolio from "./portfolio/Portfolio";
import HorizontalLine from "@/components/ui-abc/shapes/horizontal-line";
import TechStack from "./portfolio/TechStack/TechStack";
import Experience from "./portfolio/Experience/Experience";
const Home = () => {
  const hs = useHeaderSizeStore((state) => state.size);
  // const uid = import.meta.env.VITE_CONSTANTINE_UID;
  return (
    <div className="relative" style={{ top: `${hs}px` }}>
      <Portfolio />
      <HorizontalLine className="my-5 lg:my-20 container mx-auto" />
      <TechStack />
      <HorizontalLine className="my-5 lg:my-20 container mx-auto" />
      <Experience />
    </div>
  );
};

export default Home;

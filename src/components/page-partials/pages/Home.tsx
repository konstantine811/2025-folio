import { useHeaderSizeStore } from "@/storage/headerSizeStore";
import Portfolio from "./portfolio/Portfolio";
import HorizontalLine from "@/components/ui-abc/shapes/horizontal-line";
import TechStack from "./portfolio/TechStack/TechStack";
import Experience from "./portfolio/Experience/Experience";
import { Canvas } from "@react-three/fiber";
import { useRef } from "react";
import ExperienceCanvas from "@/components/page-partials/pages/experimental/three-scenes/scroll-particle-morphing/Experience";
import ScrollSectionProgress from "@/components/common/scroll/scroll-section-progress";
const Home = () => {
  const hs = useHeaderSizeStore((state) => state.size);
  const pageIndexRef = useRef(0);
  const sectionProgressRef = useRef(0);
  return (
    <>
      <div className="fixed inset-0 top-0 w-full h-full z-0 pointer-events-auto pb-20">
        <Canvas camera={{ position: [0, 10, 85], fov: 70 }}>
          <ExperienceCanvas
            uSectionProgressRef={sectionProgressRef}
            uPageIndexRef={pageIndexRef}
            pathModel={"/3d-models/folio-scene/morphScene.glb"}
          />
        </Canvas>
      </div>
      <ScrollSectionProgress
        childrens={[
          <div>
            <Portfolio />
            <HorizontalLine className="my-5 lg:my-20 container mx-auto" />
          </div>,
          <div>
            <TechStack />
            <HorizontalLine className="my-5 lg:my-20 container mx-auto" />
          </div>,
          <Experience />,
        ]}
        className="relative z-10 bg-background/50 backdrop-blur-xs"
        style={{ top: `${hs}px`, paddingBottom: "20vh" }}
        pageIndexRef={pageIndexRef}
        sectionProgressRef={sectionProgressRef}
      />
    </>
  );
};

export default Home;

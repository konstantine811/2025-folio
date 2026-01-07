import { useHeaderSizeStore } from "@/storage/headerSizeStore";
import Portfolio from "./portfolio/Portfolio";
import HorizontalLine from "@/components/ui-abc/shapes/horizontal-line";
import TechStack from "./portfolio/TechStack/TechStack";
import Experience from "./portfolio/Experience/Experience";
import { Canvas } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import ExperienceCanvas from "@/components/page-partials/pages/experimental/three-scenes/scroll-particle-morphing/Experience";
import ScrollSectionProgress from "@/components/common/scroll/scroll-section-progress";
import SelectedWorks from "./portfolio/Experience/SelectedWorks";
import ProjectSlideOver from "./portfolio/ProjectSlideOver";
import { Project, getProjectsData } from "./portfolio/Experience/constant";
import { useTranslation } from "react-i18next";

const Home = () => {
  const { t } = useTranslation();
  const hs = useHeaderSizeStore((state) => state.size);
  const pageIndexRef = useRef(0);
  const sectionProgressRef = useRef(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const projectsData = getProjectsData(t);

  const openProject = (id: string) => {
    const project = projectsData[id];
    if (project) {
      setSelectedProject(project);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
        setIsContactOpen(false);
        setSelectedProject(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
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
      <ProjectSlideOver
        project={selectedProject}
        isOpen={!!selectedProject}
        onClose={() => setSelectedProject(null)}
      />
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
          <div>
            <Experience />
          </div>,
          <div className="mt-10">
            <SelectedWorks openProject={openProject} />
          </div>,
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

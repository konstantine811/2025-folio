import { Canvas } from "@react-three/fiber";
import Experience from "./Experience";
import { Suspense, useRef } from "react";
import ScrollSectionProgress from "@/components/common/scroll/scroll-section-progress";
import { useHeaderSizeStore } from "@/storage/headerSizeStore";

const ScollParticleMorphing = ({
  pathModel = "/3d-models/folio-scene/morphScene.glb",
}: {
  children: React.ReactNode;
  totalPages?: number;
  pathModel?: string;
}) => {
  const hs = useHeaderSizeStore((state) => state.size);
  const pageIndexRef = useRef(0);
  const sectionProgressRef = useRef(0);

  return (
    <>
      {/* Fixed Canvas Background */}
      <div className="fixed inset-0 top-0 w-full h-full z-0 pointer-events-auto">
        <Canvas camera={{ position: [0, 10, 85], fov: 70 }}>
          <Suspense fallback={null}>
            <Experience
              pathModel={pathModel}
              uSectionProgressRef={sectionProgressRef}
              uPageIndexRef={pageIndexRef}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Scrollable Content */}
      <div className="relative top-0 z-10">
        <ScrollSectionProgress
          childrens={[
            <section
              className="flex flex-col items-center justify-center"
              style={{ height: `calc(100vh - ${hs}px)` }}
            >
              <h1 className="text-4xl font-bold text-foreground mb-4">
                Particle Morphing
              </h1>
              <p className="text-lg text-gray-500 mb-16">
                This is a description of the particle morphing scene.
              </p>
            </section>,

            <section
              className="p-8 rounded-lg flex flex-col items-center justify-center"
              style={{ height: `calc(100vh - ${hs}px)` }}
            >
              <h2 className="text-2xl font-bold mb-4">Section 1</h2>
              <p className="text-foreground/80">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
            </section>,

            <section
              className="p-8 rounded-lg flex flex-col items-center justify-center"
              style={{ height: `calc(100vh - ${hs}px)` }}
            >
              <h2 className="text-2xl font-bold mb-4">Section 2</h2>
              <p className="text-foreground/80">
                Ut enim ad minim veniam, quis nostrud exercitation ullamco
                laboris nisi ut aliquip ex ea commodo consequat.
              </p>
            </section>,

            <section
              className="p-8 rounded-lg flex flex-col items-center justify-center"
              style={{ height: `calc(100vh - ${hs}px)` }}
            >
              <h2 className="text-2xl font-bold mb-4">Section 3</h2>
              <p className="text-foreground/80">
                Duis aute irure dolor in reprehenderit in voluptate velit esse
                cillum dolore eu fugiat nulla pariatur.
              </p>
            </section>,

            <section
              className="p-8 rounded-lg flex flex-col items-center justify-center"
              style={{ height: `calc(100vh - ${hs}px)` }}
            >
              <h2 className="text-2xl font-bold mb-4">Section 4</h2>
              <p className="text-foreground/80">
                Excepteur sint occaecat cupidatat non proident, sunt in culpa
                qui officia deserunt mollit anim id est laborum.
              </p>
            </section>,
          ]}
          className="relative z-10 bg-background/50 backdrop-blur-xs"
          pageIndexRef={pageIndexRef}
          sectionProgressRef={sectionProgressRef}
        />
      </div>
    </>
  );
};

export default ScollParticleMorphing;

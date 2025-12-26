import { Canvas } from "@react-three/fiber";
import Experience from "./Experience";
import { Suspense, useRef } from "react";
import UI from "./ui";
import { useScroll } from "framer-motion";

const ScollParticleMorphing = ({
  children,
  totalPages = 4,
  pathModel = "/3d-models/folio-scene/morphScene.glb",
}: {
  children: React.ReactNode;
  totalPages?: number;
  pathModel?: string;
}) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["end end", "start start"],
  });

  return (
    <>
      {/* Fixed Canvas Background */}
      <div className="fixed inset-0 top-0 w-full h-full z-0 pointer-events-auto">
        <Canvas camera={{ position: [0, 10, 85], fov: 70 }}>
          <Suspense fallback={null}>
            <Experience
              totalPages={totalPages}
              pathModel={pathModel}
              scrollYProgress={scrollYProgress}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Scrollable Content */}
      <div ref={ref} className="relative top-0 z-10">
        {children ? children : <UI />}
      </div>
    </>
  );
};

export default ScollParticleMorphing;

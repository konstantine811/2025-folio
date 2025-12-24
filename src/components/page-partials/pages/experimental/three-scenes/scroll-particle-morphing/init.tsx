import { Canvas } from "@react-three/fiber";
import Experience from "./Experience";
import { Suspense } from "react";

const Init = () => {
  return (
    <div className="relative w-full">
      {/* Fixed Canvas Background */}
      <div className="fixed inset-0 z-0">
        <div className="h-screen w-full">
          <Canvas camera={{ position: [0, 10, 85], fov: 70 }}>
            <Suspense fallback={null}>
              <Experience
                showIndexModel={1}
                pathModel={"/3d-models/models.glb"}
              />
            </Suspense>
          </Canvas>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="relative z-10 min-h-screen">
        <div className="flex flex-col items-center justify-center w-full py-32">
          <div className="min-h-screen flex flex-col items-center justify-center">
            <h1 className="text-4xl font-bold text-foreground mb-4 ">
              Particle Morphing
            </h1>
            <p className="text-lg text-gray-500 mb-16">
              This is a description of the particle morphing scene.
            </p>
          </div>

          {/* Add more content to enable scrolling */}
          <div className="w-full max-w-4xl mx-auto px-6 space-y-8">
            <section className="p-8 rounded-lg flex flex-col items-center justify-center min-h-screen">
              <h2 className="text-2xl font-bold mb-4">Section 1</h2>
              <p className="text-foreground/80">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
            </section>

            <section className="p-8 rounded-lg flex flex-col items-center justify-center min-h-screen">
              <h2 className="text-2xl font-bold mb-4">Section 2</h2>
              <p className="text-foreground/80">
                Ut enim ad minim veniam, quis nostrud exercitation ullamco
                laboris nisi ut aliquip ex ea commodo consequat.
              </p>
            </section>

            <section className="p-8 rounded-lg flex flex-col items-center justify-center min-h-screen">
              <h2 className="text-2xl font-bold mb-4">Section 3</h2>
              <p className="text-foreground/80">
                Duis aute irure dolor in reprehenderit in voluptate velit esse
                cillum dolore eu fugiat nulla pariatur.
              </p>
            </section>

            <section className="p-8 rounded-lg flex flex-col items-center justify-center min-h-screen">
              <h2 className="text-2xl font-bold mb-4">Section 4</h2>
              <p className="text-foreground/80">
                Excepteur sint occaecat cupidatat non proident, sunt in culpa
                qui officia deserunt mollit anim id est laborum.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Init;

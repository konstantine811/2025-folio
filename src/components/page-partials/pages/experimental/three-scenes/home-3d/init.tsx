import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect } from "react";
import ThreeLoader from "../common/three-loader";
import { Environment } from "@react-three/drei";
import Experience from "./experience";
import { getProject } from "@theatre/core";
import { SheetProvider } from "@theatre/r3f";
// import extension from "@theatre/r3f/dist/extension";
// import studio from "@theatre/studio";
import Camera from "./partials/camera";
import projectState from "@/data/theatre/Earth.theatre-project-state.json";

const isTheatre = false;

// if (isTheatre) {
//   studio.initialize();
//   studio.extend(extension);
// }
const project = getProject(
  "Earth",
  !isTheatre
    ? {
        state: projectState,
      }
    : undefined
);
const mainSheet = project.sheet("Main");

const Init = () => {
  useEffect(() => {
    if (isTheatre) return;
    project.ready.then(() => {
      mainSheet.sequence.play({
        range: [0, 10], // замість "Main"
        direction: "normal",
        rate: 1,
        iterationCount: 1,
      });
    });
  }, []);
  return (
    <div className="h-screen">
      <ThreeLoader />

      <Canvas
        gl={{ preserveDrawingBuffer: true }}
        camera={{ position: [1, 1, 0], fov: 65, near: 0.001 }}
      >
        <Suspense fallback={null}>
          <Environment preset="sunset" blur={5} />
          <SheetProvider sheet={mainSheet}>
            <Camera />
            <Experience />
          </SheetProvider>
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Init;

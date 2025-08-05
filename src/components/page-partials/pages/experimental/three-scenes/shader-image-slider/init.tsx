import MainWrapperOffset from "@/components/ui-abc/main-wrapper-offset";
import { useHeaderSizeStore } from "@/storage/headerSizeStore";
import { motion } from "framer-motion";
import ThreeLoader from "../common/three-loader";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import Slider from "./slider";
import AnimateBackground from "./animate-background";
import ImageSlider from "./image-slider";

const Init = () => {
  const hs = useHeaderSizeStore((s) => s.size);
  return (
    <main className="bg-background">
      <section
        className="w-full relative"
        style={{ height: `calc(100vh - ${hs}px)` }}
      >
        <motion.img
          src="/images/shader-slider/logo.png"
          className="absolute top-4 left-4 w-20 h-10 z-10 brightness-0 invert object-contain"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            duration: 0.6,
            delay: 0.2,
            type: "spring",
            bounce: 0.2,
          }}
        />
        <Slider />
        <MainWrapperOffset>
          <ThreeLoader />
          <Canvas
            camera={{ position: [0, 0, 5], fov: 30 }}
            className="top-0 left-0"
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
            }}
          >
            <Suspense fallback={null}>
              <AnimateBackground />
              {/* <ImageSlider /> */}
              <ImageSlider />
            </Suspense>
          </Canvas>
        </MainWrapperOffset>
      </section>
      <section
        className="w-full grid place-content-center"
        style={{ height: `calc(100vh - ${hs}px)` }}
      >
        <p className="text-foreground">Work in progress ...</p>
      </section>
    </main>
  );
};

export default Init;

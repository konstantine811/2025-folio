import { useHeaderSizeStore } from "@/storage/headerSizeStore";
import Portfolio from "./portfolio/Portfolio";
import HorizontalLine from "@/components/ui-abc/shapes/horizontal-line";
import TechStack from "./portfolio/TechStack/TechStack";
import Experience from "./portfolio/Experience/Experience";
import { useEffect, useRef } from "react";
import { useScroll } from "framer-motion";
const Home = () => {
  const hs = useHeaderSizeStore((state) => state.size);
  // const uid = import.meta.env.VITE_CONSTANTINE_UID;
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["end end", "start start"],
  });

  useEffect(() => {
    console.log(scrollYProgress);
    scrollYProgress.on("change", (latest) => {
      console.log(latest);
    });
  }, [scrollYProgress]);

  return (
    <div
      ref={ref}
      className="relative w-screen bg-background/30 backdrop-blur-xs"
      style={{ top: `${hs}px`, paddingBottom: "20vh" }}
    >
      <div>
        <Portfolio />
        <HorizontalLine className="my-5 lg:my-20 container mx-auto" />
      </div>
      <div>
        <TechStack />
        <HorizontalLine className="my-5 lg:my-20 container mx-auto" />
      </div>
      <div>
        <Experience />
      </div>
    </div>
  );
};

export default Home;

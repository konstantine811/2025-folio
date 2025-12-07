import { useHeaderSizeStore } from "@/storage/headerSizeStore";
import Portfolio from "./portfolio/Portfolio";
const Home = () => {
  const hs = useHeaderSizeStore((state) => state.size);
  // const uid = import.meta.env.VITE_CONSTANTINE_UID;
  return (
    <div className="relative" style={{ top: `${hs}px` }}>
      <Portfolio />
    </div>
  );
};

export default Home;

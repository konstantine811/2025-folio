import { useHeaderSizeStore } from "@/storage/headerSizeStore";
import RevealButton from "./map-ui-overlay/reveal-button";

const MapOverlay = () => {
  const hs = useHeaderSizeStore((s) => s.size);
  return (
    <>
      <div
        className="absolute left-0 w-full h-full pointer-events-none z-50 grid grid-cols-3 grid-rows-3"
        style={{ top: hs }}
      >
        <div className="col-span-1 row-span-1 pt-5">
          <RevealButton />
        </div>
      </div>
    </>
  );
};

export default MapOverlay;

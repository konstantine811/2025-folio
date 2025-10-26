import { useHeaderSizeStore } from "@/storage/headerSizeStore";
import PromptUI from "./text-area";

const UI = () => {
  const hs = useHeaderSizeStore((s) => s.size);
  return (
    <>
      <div
        className="fixed h-full left-4 right-4 z-10 flex flex-col gap-4 max-w-4xl mx-auto pointer-events-none"
        style={{ top: `${hs + 16}px` }}
      >
        <div className="flex flex-col gap-2 pointer-events-auto">
          <PromptUI />
        </div>
      </div>
    </>
  );
};

export default UI;

import { Perf } from "r3f-perf";
import { useEditModeStore } from "./store/useEditModeStore";

const DebugMode = () => {
  const isDebug = useEditModeStore((s) => s.isDebug);
  if (!isDebug) return null;
  return <Perf position="bottom-left" showGraph deepAnalyze antialias />;
};

export default DebugMode;

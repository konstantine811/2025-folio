import ListScatter from "./list-scatters";
import { ScatterModalWindow } from "./scatter-modal-window";
import TabMode from "./tab-mode";
import TabScatterDraw from "./tab-scatter-draw";

const RightSidePanel = () => {
  return (
    <div className="bg-background/5 backdrop-blur-2xl pointer-events-auto py-4 px-1 rounded-tl-md rounded-bl-md min-w-40 h-full">
      <TabMode />
      <TabScatterDraw />
      <ListScatter />
      <ScatterModalWindow />
    </div>
  );
};

export default RightSidePanel;

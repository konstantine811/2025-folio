import CanvasWrap from "./canvas-wrap";
import SelectExample from "./select-example";
import { useState } from "react";
import { ModelItem } from "./models/items-config";

const Init = () => {
  const [selectedItem, setSelectedItem] = useState<ModelItem>();
  return (
    <>
      <SelectExample onSelectItem={setSelectedItem} />
      <CanvasWrap>{selectedItem?.element}</CanvasWrap>
    </>
  );
};

export default Init;

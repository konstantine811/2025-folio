import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEditModeStore } from "../../../../../store/useEditModeStore";
import { PainterModelConfig } from "../../../../../config/3d-model.config";

const SelectScatterModel = () => {
  const setScatterModelDraw = useEditModeStore((s) => s.setScatterModelDraw);
  const scatterModelDraw = useEditModeStore((s) => s.scatterModelDraw);
  return (
    <Select
      defaultValue={scatterModelDraw.name}
      onValueChange={(value) => {
        const model = PainterModelConfig.find((m) => m.name === value);
        if (model) {
          setScatterModelDraw(model);
        }
      }}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Theme" />
      </SelectTrigger>
      <SelectContent>
        {PainterModelConfig.map((model) => (
          <SelectItem key={model.name} value={model.name}>
            {model.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default SelectScatterModel;

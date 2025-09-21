import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SingleAddModelConfig } from "../../config/3d-model.config";
import { useEditModeStore } from "../../store/useEditModeStore";

const SelectDrawInstanceModel = () => {
  const setInstanceModelDraw = useEditModeStore((s) => s.setInstanceModelDraw);
  const instanceModelDraw = useEditModeStore((s) => s.instanceModelDraw);
  return (
    <Select
      defaultValue={instanceModelDraw.name}
      onValueChange={(value) => {
        const model = SingleAddModelConfig.find((m) => m.name === value);
        if (model) {
          setInstanceModelDraw(model);
        }
      }}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Theme" />
      </SelectTrigger>
      <SelectContent>
        {SingleAddModelConfig.map((model) => (
          <SelectItem key={model.name} value={model.name}>
            {model.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default SelectDrawInstanceModel;

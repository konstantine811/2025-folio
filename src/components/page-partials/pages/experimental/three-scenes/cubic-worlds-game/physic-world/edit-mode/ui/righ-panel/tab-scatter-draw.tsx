import { useEditModeStore } from "../../../../store/useEditModeStore";
import { useEffect } from "react";
import { Label } from "@/components/ui/label";
import NumberInputSlider from "@components/ui-abc/inputs/three-world/number-input-slider";
import { useEditPainterStore } from "../../../../store/useEditPainterStore";

const TabScatterDraw = () => {
  const { isDrawScatter, setIsDrawScatter, isEditMode } = useEditModeStore();
  const {
    setDensity,
    density,
    setOffset,
    offset,
    setRadius,
    radius,
    setRandomness,
    randomness,
    setRotationDeg,
    rotationDeg,
    setScale,
    scale,
    setSeed,
    seed,
    setSpacing,
    spacing,
  } = useEditPainterStore();
  useEffect(() => {
    if (!isEditMode) {
      setIsDrawScatter(false);
    }
  }, [isEditMode, setIsDrawScatter]);
  return (
    <>
      {isDrawScatter ? (
        <div className="w-full mt-3 min-w-60">
          <div className="pb-3 flex flex-col gap-1">
            <Label className="justify-center text-background">
              Painter optitons
            </Label>
            <NumberInputSlider
              label="Spacing"
              value={spacing}
              onChange={setSpacing}
              min={0.02}
              max={1}
              step={0.01}
              precision={2}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="justify-center text-background">
              Scatter optitons
            </Label>
            <NumberInputSlider
              label="Density"
              value={density}
              onChange={setDensity}
              min={0.1}
              max={100}
              step={1}
              precision={0}
            />
            <NumberInputSlider
              label="Radius"
              value={radius}
              onChange={setRadius}
              min={0.05}
              max={5}
              step={0.05}
              precision={2}
            />
            <NumberInputSlider
              label="Scale"
              value={scale}
              onChange={setScale}
              min={0.02}
              max={5}
              step={0.05}
              precision={2}
            />
            <NumberInputSlider
              label="Randomness"
              value={randomness}
              onChange={setRandomness}
              min={0}
              max={1}
              step={0.01}
              precision={2}
            />
            <NumberInputSlider
              label="RotationDeg"
              value={rotationDeg}
              onChange={setRotationDeg}
              min={-180}
              max={180}
              step={1}
              precision={0}
            />
            <NumberInputSlider
              label="Offset"
              value={offset}
              onChange={setOffset}
              min={-2}
              max={2}
              step={0.01}
              precision={2}
            />
            <NumberInputSlider
              label="Seed"
              value={seed}
              onChange={setSeed}
              min={0}
              max={9999}
              step={1}
              precision={0}
            />
          </div>
        </div>
      ) : null}
    </>
  );
};

export default TabScatterDraw;

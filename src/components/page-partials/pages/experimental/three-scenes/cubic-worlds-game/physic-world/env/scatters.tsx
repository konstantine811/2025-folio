import AddWinderInstanceModel from "../instanced-world/add-winder-instance-model";
import { ScatterObject, useEditModeStore } from "../../store/useEditModeStore";
import { useEffect } from "react";
import { useScatters } from "../../hooks/getData/getScatterData";
import { useGameDataStore } from "../character-controller/stores/game-data-store";

const Scatters = () => {
  // const [scatterData, setScatterData] = useState<ScatterWithData[]>();
  const onAddScatters = useEditModeStore((s) => s.onAddScatters);
  const idEditScatter = useEditModeStore((s) => s.idEditScatter);
  const touchTextureData = useGameDataStore((s) => s.characterTextureData);
  const { data: scatterData } = useScatters();

  useEffect(() => {
    const scatterNames: ScatterObject[] = [];
    scatterData.filter((i) => {
      if (i.matrices && i.matrices.length) {
        scatterNames.push({
          id: i.name,
          name: i.name,
          isEdit: false,
        });
        return true;
      }
    });
    onAddScatters(scatterNames);
  }, [scatterData, onAddScatters]);
  return (
    <>
      {scatterData?.length
        ? scatterData.map((data) => {
            return (
              <AddWinderInstanceModel
                key={data.updatedAt}
                modelUrl="/3d-models/cubic-worlds-model/grass.glb"
                metrices={data.matrices}
                isEditMode={idEditScatter === data.name}
                fileName={data.name}
                textureData={touchTextureData}
              />
            );
          })
        : null}
    </>
  );
};

export default Scatters;

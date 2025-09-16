import AddWinderInstanceModel from "../instanced-world/add-winder-instance-model";
import { ScatterObject, useEditModeStore } from "../../store/useEditModeStore";
import { useEffect } from "react";
import { useScatters } from "../../hooks/getData/getScatterData";
import { TypeModel } from "../../config/3d-model.config";
import AddSimpleInstanceModel from "../instanced-world/add-simple-instance-model";

const Scatters = () => {
  // const [scatterData, setScatterData] = useState<ScatterWithData[]>();
  const onAddScatters = useEditModeStore((s) => s.onAddScatters);
  const idEditScatter = useEditModeStore((s) => s.idEditScatter);

  const { data: scatterData } = useScatters();

  useEffect(() => {
    const scatterNames: ScatterObject[] = [];
    console.log("scatterData", scatterData);
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
            switch (data.type) {
              case TypeModel.winder:
                return (
                  <AddWinderInstanceModel
                    key={data.updatedAt}
                    modelUrl={data.modelPath}
                    metrices={data.matrices}
                    isEditMode={idEditScatter === data.name}
                    fileName={data.name}
                    modelName={data.name}
                    type={data.type}
                    hint={data.hint}
                  />
                );
              case TypeModel.simple:
                return (
                  <AddSimpleInstanceModel
                    key={data.updatedAt}
                    modelUrl={data.modelPath}
                    metrices={data.matrices}
                    isEditMode={idEditScatter === data.name}
                    fileName={data.name}
                    modelName={data.name}
                    type={data.type}
                    hint={data.hint}
                  />
                );
            }
          })
        : null}
    </>
  );
};

export default Scatters;

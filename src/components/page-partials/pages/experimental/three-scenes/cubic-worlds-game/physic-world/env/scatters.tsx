import AddWinderInstanceModel from "../instanced-world/add-winder-instance-model";
import { InstanceObject, useEditModeStore } from "../../store/useEditModeStore";
import { useEffect } from "react";
import { useScatters } from "../../hooks/getData/getScatterData";
import { TypeModel } from "../../config/3d-model.config";
import AddSimpleInstanceModel from "../instanced-world/add-simple-instance-model";

const Scatters = () => {
  // const [scatterData, setScatterData] = useState<ScatterWithData[]>();
  const onAddInstances = useEditModeStore((s) => s.onAddInstances);
  const idEditInstance = useEditModeStore((s) => s.idEditInstance);

  const { data: scatterData } = useScatters();

  useEffect(() => {
    const scatterNames: InstanceObject[] = [];
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
    onAddInstances(scatterNames);
  }, [scatterData, onAddInstances]);
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
                    isEditMode={idEditInstance === data.name}
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
                    isEditMode={idEditInstance === data.name}
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

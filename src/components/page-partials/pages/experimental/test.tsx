import { useState, useMemo } from "react";
import Card from "@/components/ui-abc/card/card";
import {
  EXPERIMENTAL_ROUTERS,
  ExperimentalTypes,
} from "@/config/router-config";
import useTransitionRouteTo from "@/hooks/useRouteTransitionTo";
import { useHeaderSizeStore } from "@/storage/headerSizeStore";
import LabsHeader from "./main/header";
import { Pagination } from "@/components/ui-abc/pagination";
import { ExperimentalFilters } from "@/components/ui-abc/experimental-filters";

const Test = () => {
  const hs = useHeaderSizeStore((s) => s.size);
  const navigateTo = useTransitionRouteTo();
  const [selectedType, setSelectedType] = useState<
    ExperimentalTypes | "ALL" | null
  >("ALL");

  // Filter items based on selected type
  const filteredItems = useMemo(() => {
    if (selectedType === "ALL" || selectedType === null) {
      return EXPERIMENTAL_ROUTERS;
    }
    return EXPERIMENTAL_ROUTERS.filter((item) => item.type === selectedType);
  }, [selectedType]);

  return (
    <div className="container mx-auto mt-10" style={{ paddingTop: hs }}>
      <LabsHeader />
      <div className="pt-5 pb-6 sticky z-10" style={{ top: `${hs}px` }}>
        <ExperimentalFilters
          items={EXPERIMENTAL_ROUTERS}
          selectedType={selectedType}
          onTypeChange={setSelectedType}
        />
      </div>
      <Pagination
        items={filteredItems}
        itemsPerPage={8}
        renderItem={(item) => (
          <Card
            onClick={() => {
              navigateTo(
                item.path.startsWith("/") ? item.path : `/${item.path}`
              );
            }}
            srcImage={item.imageUrl}
            title={item.id}
            description={item.description}
          />
        )}
      />
    </div>
  );
};

export default Test;

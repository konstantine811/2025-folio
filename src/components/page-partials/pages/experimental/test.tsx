import Card from "@/components/ui-abc/card/card";
import { EXPERIMENTAL_ROUTERS } from "@/config/router-config";
import useTransitionRouteTo from "@/hooks/useRouteTransitionTo";
import { useHeaderSizeStore } from "@/storage/headerSizeStore";
import LabsHeader from "./main/header";
import { Pagination } from "@/components/ui-abc/pagination";

const Test = () => {
  const hs = useHeaderSizeStore((s) => s.size);
  const navigateTo = useTransitionRouteTo();

  return (
    <div className="container mx-auto mt-10" style={{ paddingTop: hs }}>
      <LabsHeader />
      <Pagination
        items={EXPERIMENTAL_ROUTERS}
        itemsPerPage={8}
        className="pt-10"
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

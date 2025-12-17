import MapComponent from "./map";
import MapOverlay from "./map-overlay";
import MapMenu from "./menu/map-menu";

const SphereMatTest = () => {
  return (
    <>
      <div className="relative bg-background">
        <div className="flex">
          <MapMenu />
          <MapComponent />
        </div>
        <MapOverlay />
      </div>
    </>
  );
};

export default SphereMatTest;

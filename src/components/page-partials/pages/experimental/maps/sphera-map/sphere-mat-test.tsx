import MapComponent from "./map";
import MapOverlay from "./map-overlay";

const SphereMatTest = () => {
  return (
    <>
      <div className="relative bg-background">
        <div className="flex">
          <MapComponent />
        </div>
        <MapOverlay />
      </div>
    </>
  );
};

export default SphereMatTest;

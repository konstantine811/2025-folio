import Main from "./html-content/main";
import MapComponent from "./map";
import MapOverlay from "./map-overlay";

const SphereMatTest = () => {
  return (
    <Main>
      <div className="relative w-full">
        <div className="relative w-full h-full">
          <div className="flex">
            <MapComponent />
          </div>
          <MapOverlay />
        </div>
      </div>
    </Main>
  );
};

export default SphereMatTest;

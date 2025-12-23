import MainWrapperOffset from "@/components/ui-abc/main-wrapper-offset";
import Main from "./components/main";

const NodeWriterPage = () => {
  return (
    <>
      <MainWrapperOffset isFullHeight className="flex flex-col">
        <Main />
      </MainWrapperOffset>
    </>
  );
};

export default NodeWriterPage;

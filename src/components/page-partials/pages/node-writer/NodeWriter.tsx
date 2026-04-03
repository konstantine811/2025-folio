import MainWrapperOffset from "@/components/ui-abc/main-wrapper-offset";
import { useEffect } from "react";
import Main from "./components/main";

const NodeWriterPage = () => {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflowY;
    const prevBody = body.style.overflowY;
    html.style.overflowY = "hidden";
    body.style.overflowY = "hidden";
    return () => {
      html.style.overflowY = prevHtml;
      body.style.overflowY = prevBody;
    };
  }, []);

  return (
    <MainWrapperOffset isFullHeight className="w-full min-h-0">
      <Main />
    </MainWrapperOffset>
  );
};

export default NodeWriterPage;

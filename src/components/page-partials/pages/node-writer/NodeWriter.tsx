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
    <MainWrapperOffset isFullHeight className="flex min-h-0 w-full min-w-0 flex-1 flex-col">
      <Main />
    </MainWrapperOffset>
  );
};

export default NodeWriterPage;

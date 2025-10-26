import { useState } from "react";
import { useAutoResize } from "./hooks/useAutoResize";
import { sendSceneCommand } from "../api/apiClient";
import { useSceneStore } from "../store/useSceneStore";
import { SceneObjectFromServer } from "../types/object.model";

const PromptUI = () => {
  const [value, setValue] = useState("");

  const textareaRef = useAutoResize(value);

  // дістали з zustand метод додати обʼєкти
  const addObjectsFromServer = useSceneStore(
    (state) => state.addObjectsFromServer
  );

  async function handleSubmit() {
    if (!value.trim()) return;
    console.log("value", value);
    const serverResp = await sendSceneCommand(value);
    console.log("serverResp", serverResp);
    // захист на випадок дичі
    if (
      serverResp &&
      Array.isArray(serverResp.objects) &&
      serverResp.objects.length > 0
    ) {
      // змінимо глобальний store
      addObjectsFromServer(serverResp.objects as SceneObjectFromServer[]);
    }

    // очистити інпут
    setValue("");
  }

  return (
    <div
      className="
        fixed left-4 right-4 bottom-4
        z-10 flex flex-col gap-2 max-w-4xl mx-auto
        bg-card/70  backdrop-blur-md
        rounded-xl
        overflow-hidden
      "
    >
      <div
        className="
           border border-muted-foreground/30 
         rounded-xl
          px-4 py-3
          flex
        "
      >
        <textarea
          ref={textareaRef}
          className="
            w-full
            bg-transparent
            text-sm text-foreground/90
            placeholder:text-foreground/40
            outline-none
            resize-none
            leading-relaxed
            max-h-40 overflow-y-auto
          "
          rows={1}
          placeholder="type your prompt here"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            // Enter = відправити, Shift+Enter = новий рядок
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />
      </div>
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          className="
            rounded-lg bg-card text-accent text-xs
             border border-muted-foreground/30 
            px-3 py-1.5 font-medium
            hover:bg-muted-foreground/30 active:bg-card/80
            duration-300
            cursor-pointer
            transition-colors
          "
        >
          Add Object to the Scene
        </button>
      </div>
    </div>
  );
};

export default PromptUI;

import { Project } from "../types/types";

interface EditorViewProps {
  project: Project;
  onContentChange: (content: string) => void;
}

const EditorView = ({ project, onContentChange }: EditorViewProps) => {
  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col py-24 px-12 overflow-y-auto">
      <div className="mb-16">
        <h2 className="text-5xl font-black tracking-tighter italic uppercase">
          Текстовий протокол
        </h2>
        <div className="mono text-[9px] text-white/20 uppercase tracking-widest mt-2 italic">
          Data input engine v4.1
        </div>
      </div>
      <textarea
        value={project.content}
        onChange={(e) => onContentChange(e.target.value)}
        className="flex-1 w-full h-full p-12 bg-black border-l border-white/10 outline-none resize-none text-white/50 text-base leading-relaxed mono focus:text-white transition-all"
        placeholder="Введіть дані дослідження..."
      />
    </div>
  );
};

export default EditorView;

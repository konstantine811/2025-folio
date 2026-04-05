import { Project } from "../types/types";

interface EditorViewProps {
  project: Project;
  onContentChange: (content: string) => void;
}

const EditorView = ({ project, onContentChange }: EditorViewProps) => {
  return (
    <div className="mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col overflow-y-auto py-24 px-12">
      <div className="mb-16">
        <h2 className="text-5xl font-black tracking-tighter italic uppercase text-foreground">
          Текстовий протокол
        </h2>
        <div className="mono text-[9px] text-muted-foreground uppercase tracking-widest mt-2 italic">
          Data input engine v4.1
        </div>
      </div>
      <textarea
        value={project.content}
        onChange={(e) => onContentChange(e.target.value)}
        className="flex-1 w-full h-full min-h-[40vh] p-12 bg-muted/30 border-l border-border outline-none resize-none text-foreground/90 text-base leading-relaxed mono placeholder:text-muted-foreground focus:bg-background"
        placeholder="Введіть дані дослідження..."
      />
    </div>
  );
};

export default EditorView;

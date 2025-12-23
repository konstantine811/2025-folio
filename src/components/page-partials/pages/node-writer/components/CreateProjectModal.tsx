import { Icons } from "./Icons";

interface CreateProjectModalProps {
  isOpen: boolean;
  creationPrompt: string;
  onClose: () => void;
  onPromptChange: (value: string) => void;
  onCreate: () => void;
}

const CreateProjectModal = ({
  isOpen,
  creationPrompt,
  onClose,
  onPromptChange,
  onCreate,
}: CreateProjectModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-black w-full max-w-4xl border border-white/10 p-12">
        <div className="flex justify-between items-start mb-16">
          <div>
            <div className="mono text-[9px] text-white/20 uppercase tracking-[0.3em] mb-4">
              Protocol Initialization
            </div>
            <h3 className="text-6xl font-black tracking-tighter uppercase italic text-white leading-none">
              Новий протокол
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/20 hover:text-white transition-colors"
          >
            <Icons.Close />
          </button>
        </div>
        <textarea
          autoFocus
          value={creationPrompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder="ВВЕДІТЬ ТЕМУ ДОСЛІДЖЕННЯ..."
          className="w-full h-40 bg-transparent border-l border-white/10 pl-8 outline-none text-4xl font-black uppercase placeholder:text-white/5 text-white tracking-tighter leading-none resize-none"
        />
        <div className="mt-16 flex justify-between items-end">
          <div className="mono text-[8px] text-white/20 uppercase tracking-widest max-w-xs leading-relaxed">
            Система згенерує граф логіки та структуру виступу на основі AI.
          </div>
          <button
            onClick={onCreate}
            disabled={!creationPrompt.trim()}
            className="px-12 py-4 bg-white text-black font-black text-xs hover:bg-[#00FF9C] disabled:opacity-20 transition-all uppercase tracking-widest"
          >
            Запустити_Процес
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectModal;

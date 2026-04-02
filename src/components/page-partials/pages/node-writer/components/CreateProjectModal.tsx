import { Icons } from "./Icons";

interface CreateProjectModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  onTitleChange: (value: string) => void;
  onCreate: () => void;
}

const CreateProjectModal = ({
  isOpen,
  title,
  onClose,
  onTitleChange,
  onCreate,
}: CreateProjectModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-6 backdrop-blur-xl duration-300">
      <div className="w-full max-w-4xl border border-white/10 bg-black p-12">
        <div className="mb-16 flex items-start justify-between">
          <div>
            <div className="mono mb-4 text-[9px] uppercase tracking-[0.3em] text-white/20">
              Новий документ
            </div>
            <h3 className="text-6xl font-black leading-none tracking-tighter text-white uppercase italic">
              Створити
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/20 transition-colors hover:text-white"
          >
            <Icons.Close />
          </button>
        </div>
        <input
          autoFocus
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="НАЗВА ДОКУМЕНТА…"
          className="w-full border-b border-white/10 bg-transparent py-4 pl-2 text-4xl font-black tracking-tighter text-white uppercase outline-none placeholder:text-white/5"
        />
        <div className="mt-16 flex items-end justify-between">
          <div className="mono max-w-md text-[8px] leading-relaxed uppercase tracking-widest text-white/20">
            Далі додавайте ноди на полотні, з&apos;єднуйте їх у режимі зв&apos;язку та
            вводьте текст у кожній ноді.
          </div>
          <button
            type="button"
            onClick={onCreate}
            disabled={!title.trim()}
            className="bg-white px-12 py-4 text-xs font-black tracking-widest text-black uppercase transition-all hover:bg-[#00FF9C] disabled:opacity-20"
          >
            Створити
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectModal;

import { Icons } from "./Icons";

interface CreateProjectModalProps {
  isOpen: boolean;
  title: string;
  /** Якщо задано — документ створюється всередині цієї папки (підказка в UI). */
  targetFolderLabel?: string | null;
  onClose: () => void;
  onTitleChange: (value: string) => void;
  onCreate: () => void;
}

const CreateProjectModal = ({
  isOpen,
  title,
  targetFolderLabel,
  onClose,
  onTitleChange,
  onCreate,
}: CreateProjectModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-background/90 p-6 backdrop-blur-xl duration-300">
      <div className="w-full max-w-4xl border border-border/30 bg-card p-12 shadow-lg">
        <div className="mb-16 flex items-start justify-between">
          <div>
            <div className="mono mb-4 text-[9px] tracking-wide text-muted-foreground">
              Новий документ
              {targetFolderLabel ? (
                <span className="mt-2 block text-foreground/80">
                  У папці: {targetFolderLabel}
                </span>
              ) : null}
            </div>
            <h3 className="text-6xl font-black leading-none tracking-tighter text-foreground italic">
              Створити
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <Icons.Close />
          </button>
        </div>
        <input
          autoFocus
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Назва документа…"
          className="w-full border-b border-border/40 bg-transparent py-4 pl-2 text-4xl font-semibold tracking-tight text-foreground outline-none placeholder:text-muted-foreground/40"
        />
        <div className="mt-16 flex items-end justify-between gap-8">
          <div className="mono max-w-md text-[8px] leading-relaxed tracking-wide text-muted-foreground">
            Далі додавайте ноди на полотні, з&apos;єднуйте їх у режимі зв&apos;язку та
            вводьте текст у кожній ноді.
          </div>
          <button
            type="button"
            onClick={onCreate}
            disabled={!title.trim()}
            className="shrink-0 bg-primary px-12 py-4 text-xs font-black tracking-wide text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-20"
          >
            Створити
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectModal;

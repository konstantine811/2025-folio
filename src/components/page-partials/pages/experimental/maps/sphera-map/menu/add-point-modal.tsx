import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

type AddPointModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (count: number) => void;
  lng: number;
  lat: number;
  initialCount?: number;
  isEdit?: boolean;
};

const AddPointModal = ({
  isOpen,
  onClose,
  onConfirm,
  lng,
  lat,
  initialCount,
  isEdit = false,
}: AddPointModalProps) => {
  const [count, setCount] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numCount = parseInt(count, 10);
    if (numCount > 0) {
      onConfirm(numCount);
      setCount("");
      onClose();
    }
  };

  // Reset or set count when modal opens
  useEffect(() => {
    if (isOpen) {
      if (isEdit && initialCount) {
        setCount(initialCount.toString());
      } else {
        setCount("");
      }
    }
  }, [isOpen, isEdit, initialCount]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0f172a] border border-white/10 rounded-lg shadow-2xl z-50 p-6 min-w-[300px] backdrop-blur-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4 text-white">
              {isEdit ? "Редагувати точку" : "Додати точку"}
            </h2>
            <p className="text-sm text-slate-400 mb-4">
              Координати: {lat.toFixed(4)}, {lng.toFixed(4)}
            </p>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="count"
                  className="block text-sm font-medium mb-2 text-slate-300"
                >
                  Кількість точок
                </label>
                <input
                  id="count"
                  type="number"
                  min="1"
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                  className="w-full px-3 py-2 border border-white/10 rounded-md bg-white/[0.02] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                  placeholder="Введіть кількість"
                  autoFocus
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-white/10 rounded-md hover:bg-white/5 transition-colors text-slate-300"
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  disabled={!count || parseInt(count, 10) <= 0}
                  className="px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/50 rounded-md hover:bg-blue-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Підтвердити
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddPointModal;

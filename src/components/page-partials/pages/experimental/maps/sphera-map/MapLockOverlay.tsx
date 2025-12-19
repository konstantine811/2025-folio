import { motion, AnimatePresence } from "framer-motion";
import { MapPin, X } from "lucide-react";

interface MapLockOverlayProps {
  isLocked: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
}

const MapLockOverlay = ({
  isLocked,
  onActivate,
  onDeactivate,
}: MapLockOverlayProps) => {
  return (
    <>
      {/* Activation Overlay */}
      <AnimatePresence>
        {isLocked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#020408]/5 z-50 flex items-center justify-center cursor-pointer"
            onClick={onActivate}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white/[0.02] border border-white/10 rounded-xl p-8 max-w-md text-center backdrop-blur-md"
            >
              <div className="mb-4 flex justify-center">
                <div className="w-16 h-16 rounded-full bg-blue-500/20 border border-blue-500/50 flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-blue-400" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Мапа заблокована
              </h3>
              <p className="text-slate-400 mb-4">
                Натисніть, щоб активувати взаємодію з мапою
              </p>
              <p className="text-xs text-slate-500">
                Scroll щоб зумити, перетягуйте щоб рухати
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Deactivation Button */}
      <AnimatePresence>
        {!isLocked && (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onClick={onDeactivate}
            className="absolute top-4 right-4 z-50 px-4 py-2 bg-white/[0.02] border border-white/10 rounded-lg text-slate-300 hover:bg-white/[0.05] hover:border-white/20 transition-all backdrop-blur-sm flex items-center gap-2 text-sm"
            title="Натисніть Esc або цю кнопку, щоб заблокувати мапу"
          >
            <X className="w-4 h-4" />
            <span>Заблокувати мапу</span>
            <span className="text-xs text-slate-500 ml-2">(Esc)</span>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
};

export default MapLockOverlay;

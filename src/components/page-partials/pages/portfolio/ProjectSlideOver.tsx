import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Share2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Project } from "./Experience/constant";

interface ProjectSlideOverProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProjectSlideOver: React.FC<ProjectSlideOverProps> = ({
  project,
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();
  return (
    <AnimatePresence>
      {isOpen && project && (
        <div className="fixed inset-0 z-[110]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute right-0 top-0 h-full w-full max-w-2xl bg-card-background border-l border-white/10 shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between px-8 py-6 border-b border-foreground/5 bg-card-background">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  {t("portfolio.project_slideover.project_details")}
                </span>
              </div>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-foreground/5 rounded-full"
              >
                <X className="w-6 h-6 stroke-[1.5]" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="font-display text-3xl md:text-4xl text-foreground tracking-tight mb-2">
                  {project.title}
                </h2>
                <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-10 border-b border-foreground/10 pb-4">
                  {project.subtitle}
                </p>
                <div
                  className="text-foreground"
                  dangerouslySetInnerHTML={{ __html: project.content }}
                />
              </motion.div>
            </div>

            <div className="px-8 py-6 border-t border-foreground/5 bg-card-background flex justify-between items-center">
              <span className="font-mono text-[10px] text-muted-foreground">
                {t("portfolio.project_slideover.confidentiality")}
              </span>
              <div className="flex gap-4">
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ProjectSlideOver;

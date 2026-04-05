import type { Project, ProjectPatchFn } from "../types/types";
import { PresentationEditor } from "../presentation/PresentationEditor";

interface PresentationViewProps {
  project: Project;
  /** Застосування змін до проєкту (лише для адмінів). */
  onProjectPatch?: (fn: ProjectPatchFn) => void;
  /** Режим лише перегляду (гості): без панелі джерел і редагування. */
  readOnlyViewer?: boolean;
}

const PresentationView = ({
  project,
  onProjectPatch,
  readOnlyViewer = false,
}: PresentationViewProps) => {
  const readOnly = readOnlyViewer || !onProjectPatch;

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden">
      <PresentationEditor
        project={project}
        onProjectPatch={onProjectPatch ?? (() => {})}
        readOnly={readOnly}
      />
    </div>
  );
};

export default PresentationView;

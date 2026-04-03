import WorkspaceCloudPreloader from "./WorkspaceCloudPreloader";

/** Плейсхолдер зони документа під час завантаження workspace з хмари (deep link на /doc/…). */
const DocumentRouteLoading = () => {
  return (
    <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col animate-in fade-in duration-500 fill-mode-both">
      <div className="z-10 flex h-14 shrink-0 items-center border-b border-border/20 bg-card px-8">
        <span className="mono text-[10px] tracking-wide text-primary">
          Документ
        </span>
      </div>
      <div
        className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-background"
        role="status"
        aria-live="polite"
        aria-busy="true"
        aria-label="Завантаження документа"
      >
        <WorkspaceCloudPreloader />
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-8">
          <p className="mono text-[10px] tracking-wide text-muted-foreground">
            Завантаження документа…
          </p>
        </div>
      </div>
    </div>
  );
};

export default DocumentRouteLoading;

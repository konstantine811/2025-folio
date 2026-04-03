/** Смуга-індикатор у кольорі теми (primary). */
const WorkspaceCloudPreloader = () => {
  return (
    <>
      <div
        className="h-0.5 w-full shrink-0 overflow-hidden bg-primary/20"
        role="progressbar"
        aria-hidden
      >
        <div className="h-full w-1/2 bg-primary animate-[nw-cloud-stripe_1.2s_infinite_linear]" />
      </div>
      <style>{`@keyframes nw-cloud-stripe { 0% { transform: translateX(-100%); } 100% { transform: translateX(250%); } }`}</style>
    </>
  );
};

export default WorkspaceCloudPreloader;

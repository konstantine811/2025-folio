const LoadingOverlay = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="text-center space-y-4">
        <div className="mono text-[10px] tracking-[0.5em] text-[#00FF9C] uppercase animate-pulse">
          Running_Neural_Core...
        </div>
        <div className="w-48 h-px bg-white/5 mx-auto overflow-hidden">
          <div className="w-1/2 h-full bg-[#00FF9C] animate-[loading_1.5s_infinite_linear]"></div>
        </div>
      </div>
      <style>{`@keyframes loading { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }`}</style>
    </div>
  );
};

export default LoadingOverlay;

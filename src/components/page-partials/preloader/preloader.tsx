const Preloader = () => {
  return (
    <div className="fixed w-full h-full left-0 z-50">
      <div className="flex items-center justify-center w-full h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-foreground"></div>
      </div>
    </div>
  );
};

export default Preloader;

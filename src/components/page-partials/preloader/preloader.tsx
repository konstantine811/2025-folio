const Preloader = () => {
  return (
    <div className="fixed w-full h-full">
      <div className="flex items-center justify-center w-full h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-fg"></div>
      </div>
    </div>
  );
};

export default Preloader;

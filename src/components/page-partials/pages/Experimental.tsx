import useTransitionHide from "@hooks/useTransitionHide";

const Experimental = () => {
  useTransitionHide();
  return <h1 className="text-fg text-9xl">Hello from Experimental page</h1>;
};

export default Experimental;

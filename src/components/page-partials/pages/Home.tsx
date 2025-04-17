import useTransitionHide from "@hooks/useTransitionHide";

const Home = () => {
  useTransitionHide();
  return <h1 className="text-fg text-9xl">Hello from home</h1>;
};

export default Home;

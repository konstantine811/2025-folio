import TestDrawerOpen from "./experimental/test-drawer-open";
import { Outlet } from "react-router";

const Experimental = () => {
  return (
    <>
      <Outlet />
      <TestDrawerOpen />
    </>
  );
};

export default Experimental;

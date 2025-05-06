import CellReveal from "@components/common/efx/cell-reveal";
import { useHeaderSizetore } from "@storage/headerSizeStore";
import { useTransitionStore } from "@storage/transitionRoutePath";

const TransitionPage = () => {
  const isShow = useTransitionStore((state) => state.isTransition);
  const offsetTop = useHeaderSizetore((state) => state.size);
  return (
    <CellReveal
      show={isShow}
      duration={300}
      delayPerPixel={0.9}
      offsetTop={offsetTop}
      invertRipple={isShow}
    />
  );
};

export default TransitionPage;

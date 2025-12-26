import { useRef } from "react";

const ScrollSectionProgress = ({
  childrens,
}: {
  childrens: React.ReactNode[];
}) => {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div>
      {childrens.map((child, index) => (
        <div ref={ref} key={index}>
          {child}
        </div>
      ))}
    </div>
  );
};

export default ScrollSectionProgress;

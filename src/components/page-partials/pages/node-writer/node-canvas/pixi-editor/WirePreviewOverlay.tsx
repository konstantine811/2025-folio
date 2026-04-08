type Props = {
  wirePath: string | null;
  rootWidth: number;
  rootHeight: number;
};

const WirePreviewOverlay = ({ wirePath, rootWidth, rootHeight }: Props) => {
  if (!wirePath) return null;

  return (
    <svg
      className="pointer-events-none absolute inset-0"
      width="100%"
      height="100%"
      viewBox={`0 0 ${rootWidth} ${rootHeight}`}
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <marker
          id="pixi-wire-preview-arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="8"
          markerHeight="8"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path d="M0 0 L10 5 L0 10 Z" fill="#94a3b8" fillOpacity={0.72} />
        </marker>
      </defs>
      <path
        d={wirePath}
        fill="none"
        stroke="#94a3b8"
        strokeOpacity={0.72}
        strokeWidth={2.1}
        strokeDasharray="5 4"
        strokeLinecap="round"
        markerEnd="url(#pixi-wire-preview-arrow)"
      />
    </svg>
  );
};

export default WirePreviewOverlay;

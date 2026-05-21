import {
  BUILDING_CATALOG,
  BuildingTypeId,
} from "../experience/utils/buildingCatalog";

type BuildPanelProps = {
  selectedType: BuildingTypeId | null;
  onSelectType: (type: BuildingTypeId | null) => void;
  buildingCount: number;
  onClearBuildings: () => void;
};

export function BuildPanel({
  selectedType,
  onSelectType,
  buildingCount,
  onClearBuildings,
}: BuildPanelProps) {
  return (
    <div className="pointer-events-auto absolute right-4 top-4 z-20 w-[min(100%-2rem,280px)] rounded-xl border border-white/10 bg-[#1a1522]/92 p-4 shadow-2xl backdrop-blur-md">
      <div className="mb-3">
        <h2 className="text-base font-semibold text-white">Buildings</h2>
        <p className="text-xs text-white/60">
          Pick a test cube, then click grass tiles on the map.
        </p>
      </div>

      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-white/50">
        Test cubes
      </p>

      <div className="grid grid-cols-2 gap-2">
        {BUILDING_CATALOG.map((definition) => {
          const isSelected = selectedType === definition.id;

          return (
            <button
              key={definition.id}
              type="button"
              onClick={() =>
                onSelectType(isSelected ? null : definition.id)
              }
              className={`flex items-center gap-2 rounded-md border px-2.5 py-2 text-left text-xs transition ${
                isSelected
                  ? "border-emerald-400 bg-white/10 text-white"
                  : "border-white/10 text-white/75 hover:bg-white/5"
              }`}
            >
              <span
                className="h-7 w-7 shrink-0 rounded-sm border border-black/30 shadow-inner"
                style={{ backgroundColor: definition.color }}
              />
              <span>{definition.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 border-t border-white/10 pt-3">
        <span className="text-xs text-white/55">
          Placed: {buildingCount}
        </span>
        <button
          type="button"
          onClick={onClearBuildings}
          disabled={buildingCount === 0}
          className="rounded-md border border-white/15 px-2.5 py-1 text-xs text-white/80 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Clear all
        </button>
      </div>
    </div>
  );
}

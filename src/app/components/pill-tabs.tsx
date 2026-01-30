import clsx from "clsx";

type PillTabsProps = {
  tabs: string[];
  active: string;
  onSelect?: (tab: string) => void;
};

export function PillTabs({ tabs, active, onSelect }: PillTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onSelect?.(tab)}
          className={clsx(
            "rounded-full px-4 py-2 text-sm font-semibold transition",
            active === tab
              ? "bg-gradient-to-r from-teal-400/80 to-indigo-500/80 text-white shadow-[0_10px_30px_rgba(109,243,231,0.35)]"
              : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white",
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

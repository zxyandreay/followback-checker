"use client";

export type ResultTabId = "notFollowingBack" | "fansYouDontFollowBack" | "mutuals";

type TabDef = { id: ResultTabId; label: string; count: number };

type ResultsTabsProps = {
  tabs: TabDef[];
  active: ResultTabId;
  onChange: (id: ResultTabId) => void;
};

export function ResultsTabs({ tabs, active, onChange }: ResultsTabsProps) {
  return (
    <div className="-mx-1 flex gap-1 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
      {tabs.map(({ id, label, count }) => {
        const isActive = id === active;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={[
              "shrink-0 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
              isActive
                ? "bg-indigo-600 text-white shadow-sm dark:bg-indigo-500"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700",
            ].join(" ")}
          >
            <span className="block truncate">{label}</span>
            <span
              className={
                isActive
                  ? "text-xs text-indigo-100"
                  : "text-xs text-zinc-500 dark:text-zinc-400"
              }
            >
              {count.toLocaleString()}
            </span>
          </button>
        );
      })}
    </div>
  );
}

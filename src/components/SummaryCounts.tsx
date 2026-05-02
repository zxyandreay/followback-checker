"use client";

import type { ResultCategoryId } from "@/lib/result-category";
import { CATEGORY_LABELS } from "@/lib/result-category";

type SummaryCountsProps = {
  totalFollowing: number;
  totalFollowers: number;
  notFollowingBack: number;
  peopleYouDontFollowBack: number;
  mutuals: number;
  selectedCategory: ResultCategoryId;
  onSelect: (id: ResultCategoryId) => void;
};

const CARD_ORDER: ResultCategoryId[] = [
  "following",
  "followers",
  "notFollowingBack",
  "peopleYouDontFollowBack",
  "mutuals",
];

function countForCategory(
  id: ResultCategoryId,
  props: Omit<
    SummaryCountsProps,
    "selectedCategory" | "onSelect"
  >,
): number {
  switch (id) {
    case "following":
      return props.totalFollowing;
    case "followers":
      return props.totalFollowers;
    case "notFollowingBack":
      return props.notFollowingBack;
    case "peopleYouDontFollowBack":
      return props.peopleYouDontFollowBack;
    case "mutuals":
      return props.mutuals;
  }
}

export function SummaryCounts({
  selectedCategory,
  onSelect,
  ...counts
}: SummaryCountsProps) {
  return (
    <div
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
      role="group"
      aria-label="Choose which list to show"
    >
      {CARD_ORDER.map((id) => {
        const isActive = id === selectedCategory;
        const value = countForCategory(id, counts);
        return (
          <button
            key={id}
            type="button"
            aria-pressed={isActive}
            onClick={() => onSelect(id)}
            className={[
              "cursor-pointer rounded-xl border px-4 py-3 text-left shadow-sm transition-colors",
              isActive
                ? "border-indigo-600 bg-indigo-600 text-white dark:border-indigo-500 dark:bg-indigo-500"
                : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 dark:hover:bg-zinc-900",
            ].join(" ")}
          >
            <div
              className={[
                "text-2xl font-semibold tabular-nums",
                isActive
                  ? "text-white"
                  : "text-zinc-900 dark:text-zinc-50",
              ].join(" ")}
            >
              {value.toLocaleString()}
            </div>
            <div
              className={[
                "mt-1 text-xs font-medium",
                isActive
                  ? "text-indigo-100"
                  : "text-zinc-500 dark:text-zinc-400",
              ].join(" ")}
            >
              {CATEGORY_LABELS[id]}
            </div>
          </button>
        );
      })}
    </div>
  );
}

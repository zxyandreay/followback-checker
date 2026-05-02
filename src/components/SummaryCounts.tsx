type SummaryCountsProps = {
  totalFollowing: number;
  totalFollowers: number;
  notFollowingBack: number;
  peopleYouDontFollowBack: number;
  mutuals: number;
};

export function SummaryCounts({
  totalFollowing,
  totalFollowers,
  notFollowingBack,
  peopleYouDontFollowBack,
  mutuals,
}: SummaryCountsProps) {
  const items = [
    { label: "Following", value: totalFollowing },
    { label: "Followers", value: totalFollowers },
    { label: "Not following back", value: notFollowingBack },
    { label: "People you don’t follow back", value: peopleYouDontFollowBack },
    { label: "Mutuals", value: mutuals },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {items.map(({ label, value }) => (
        <div
          key={label}
          className="rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
        >
          <div className="text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
            {value.toLocaleString()}
          </div>
          <div className="mt-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}

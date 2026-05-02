type UsernameListProps = {
  usernames: string[];
  emptyMessage: string;
};

export function UsernameList({ usernames, emptyMessage }: UsernameListProps) {
  if (usernames.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-zinc-200 px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul className="max-h-[min(420px,50vh)] divide-y divide-zinc-100 overflow-y-auto rounded-lg border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
      {usernames.map((u) => (
        <li
          key={u}
          className="px-4 py-2.5 font-mono text-sm text-zinc-900 dark:text-zinc-100"
        >
          @{u}
        </li>
      ))}
    </ul>
  );
}

type UsernameListProps = {
  usernames: string[];
  emptyMessage: string;
};

function instagramProfileUrl(username: string): string {
  return `https://www.instagram.com/${encodeURIComponent(username)}/`;
}

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
          <a
            href={instagramProfileUrl(u)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open @${u} on Instagram`}
            title={`Open @${u} on Instagram`}
            className="cursor-pointer underline-offset-2 hover:text-indigo-600 hover:underline dark:hover:text-indigo-400"
          >
            @{u}
          </a>
        </li>
      ))}
    </ul>
  );
}

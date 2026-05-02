export const KOFI_URL = "https://ko-fi.com/zxyandreay";

export function SupportKofi() {
  return (
    <div className="rounded-xl border border-indigo-200/50 bg-indigo-50/40 px-4 py-3 dark:border-indigo-900/40 dark:bg-indigo-950/25">
      <p className="max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        Found this useful? Support the project and help keep FollowBack Checker
        free and privacy-friendly.
      </p>
      <a
        href={KOFI_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex rounded-lg border border-indigo-600/40 bg-indigo-600/10 px-3 py-2 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-600/15 dark:text-indigo-300 dark:hover:bg-indigo-500/15"
      >
        Support me on Ko-fi
      </a>
    </div>
  );
}

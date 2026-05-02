export const KOFI_URL = "https://ko-fi.com/zxyandreay";

type SupportKofiProps = {
  variant?: "default" | "compact";
};

export function SupportKofi({ variant = "default" }: SupportKofiProps) {
  const isCompact = variant === "compact";

  return (
    <div
      className={[
        "rounded-xl border border-indigo-200/50 bg-indigo-50/40 dark:border-indigo-900/40 dark:bg-indigo-950/25",
        isCompact ? "px-3 py-3 sm:px-4" : "px-4 py-3",
      ].join(" ")}
    >
      <p
        className={[
          "max-w-2xl leading-relaxed text-zinc-600 dark:text-zinc-400",
          isCompact ? "text-xs sm:text-sm" : "text-sm",
        ].join(" ")}
      >
        Found this useful? Support the project and help keep FollowBack Checker
        free and privacy-friendly.
      </p>
      <a
        href={KOFI_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={[
          "mt-3 inline-flex rounded-lg border border-indigo-600/40 bg-indigo-600/10 px-3 py-2 font-medium text-indigo-700 transition-colors hover:bg-indigo-600/15 dark:text-indigo-300 dark:hover:bg-indigo-500/15",
          isCompact ? "text-xs sm:text-sm" : "text-sm",
        ].join(" ")}
      >
        Support me on Ko-fi
      </a>
    </div>
  );
}

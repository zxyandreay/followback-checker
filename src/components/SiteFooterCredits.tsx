export const KOFI_URL = "https://ko-fi.com/zxyandreay";

export function SiteFooterCredits() {
  return (
    <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
      Made by zxyandreay{" "}
      <span aria-hidden="true" className="text-zinc-400 dark:text-zinc-500">
        ·
      </span>{" "}
      <a
        href={KOFI_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="text-zinc-500 underline-offset-2 hover:text-zinc-700 hover:underline dark:text-zinc-400 dark:hover:text-zinc-300"
      >
        Support on Ko-fi
      </a>
    </p>
  );
}

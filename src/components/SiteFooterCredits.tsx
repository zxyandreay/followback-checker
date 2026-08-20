export const AUTHOR_URL = "https://zxyandreay.is-a.dev";
export const KOFI_URL = "https://ko-fi.com/zxyandreay";
export const REPOSITORY_URL = "https://github.com/zxyandreay/followback-checker";

export function SiteFooterCredits() {
  const footerLinkClass =
    "text-zinc-500 underline-offset-2 hover:text-zinc-700 hover:underline dark:text-zinc-400 dark:hover:text-zinc-300";

  return (
    <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
      Made by{" "}
      <a
        href={AUTHOR_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={footerLinkClass}
      >
        zxyandreay
      </a>{" "}
      <span aria-hidden="true" className="text-zinc-400 dark:text-zinc-500">
        ·
      </span>{" "}
      <a
        href={KOFI_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={footerLinkClass}
      >
        Support on Ko-fi
      </a>{" "}
      <span aria-hidden="true" className="text-zinc-400 dark:text-zinc-500">
        ·
      </span>{" "}
      <a
        href={REPOSITORY_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={footerLinkClass}
      >
        View source
      </a>
    </p>
  );
}

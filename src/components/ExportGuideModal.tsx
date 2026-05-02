"use client";

import { useEffect, useRef } from "react";

type ExportGuideModalProps = {
  open: boolean;
  onClose: () => void;
  onScrollToUpload: () => void;
};

export function ExportGuideModal({
  open,
  onClose,
  onScrollToUpload,
}: ExportGuideModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const onDialogClose = () => {
      onClose();
    };
    el.addEventListener("close", onDialogClose);
    return () => el.removeEventListener("close", onDialogClose);
  }, [onClose]);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open) {
      if (!el.open) el.showModal();
    } else if (el.open) {
      el.close();
    }
  }, [open]);

  const handleZipReady = () => {
    onClose();
    onScrollToUpload();
  };

  const handleJsonOnly = () => {
    onClose();
    onScrollToUpload();
  };

  return (
    <dialog
      ref={dialogRef}
      className="z-50 m-auto max-h-[90vh] w-[calc(100%-1.5rem)] max-w-lg overflow-hidden rounded-2xl border border-zinc-200 bg-white p-0 text-zinc-900 shadow-xl [&::backdrop]:bg-black/50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
    >
      <div className="flex max-h-[90vh] flex-col">
        <div className="flex items-start justify-between gap-3 border-b border-zinc-200 px-5 py-4 dark:border-zinc-700">
          <h2 className="text-lg font-semibold leading-snug pr-2">
            How to Export Your Instagram Data
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg px-2 py-1 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            aria-label="Close guide"
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 text-sm leading-relaxed">
          <p className="mb-4 text-zinc-600 dark:text-zinc-400">
            To use FollowBack Checker, you need to download your official
            Instagram data export. The app does not need your Instagram password.
            Your files are processed locally in your browser.
          </p>

          <div className="mb-6 flex flex-wrap gap-2">
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-900 dark:bg-amber-950/80 dark:text-amber-100">
              Use JSON, not HTML
            </span>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-100">
              No password needed
            </span>
            <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-900 dark:bg-indigo-950/80 dark:text-indigo-100">
              Upload ZIP or JSON files
            </span>
          </div>

          <ol className="mb-6 list-decimal space-y-3 pl-5 marker:font-semibold">
            <li>
              <strong>Open Instagram.</strong> Open the Instagram app or go to
              Instagram in your browser and log in to your account.
            </li>
            <li>
              <strong>Go to your profile.</strong> Tap your profile picture in
              the bottom-right corner (app) or open your profile (web).
            </li>
            <li>
              <strong>Open Settings.</strong> Tap the menu icon (often three lines)
              in the top-right, then open{" "}
              <strong>Settings and privacy</strong>.
            </li>
            <li>
              <strong>Open Accounts Center.</strong> Find and open{" "}
              <strong>Accounts Center</strong>.
            </li>
            <li>
              <strong>Your information and permissions.</strong> Inside Accounts
              Center, open <strong>Your information and permissions</strong>.
            </li>
            <li>
              <strong>Export or download.</strong> Tap{" "}
              <strong>Export your information</strong> or{" "}
              <strong>Download your information</strong>. The exact label may
              vary.
            </li>
            <li>
              <strong>Select your Instagram account.</strong> Choose the account
              you want to export.
            </li>
            <li>
              <strong>Choose the data to export.</strong> If you can pick
              categories, select <strong>Followers and following</strong> (or the
              option that includes connections / followers / following).
            </li>
            <li>
              <strong>Choose JSON format.</strong> Select <strong>JSON</strong>{" "}
              as the file format. Do not choose HTML — this app reads JSON files.
            </li>
            <li>
              <strong>Request the export.</strong> Submit the request and wait
              while Instagram prepares your download.
            </li>
            <li>
              <strong>Download the ZIP.</strong> When it is ready, download the
              ZIP file from Instagram / Meta.
            </li>
            <li>
              <strong>Upload here.</strong> Return to FollowBack Checker and
              upload the ZIP directly. The app looks for{" "}
              <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-800">
                following.json
              </code>{" "}
              and{" "}
              <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-800">
                followers_1.json
              </code>
              ,{" "}
              <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-800">
                followers_2.json
              </code>
              , etc.
            </li>
          </ol>

          <section className="mb-6 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-950/50">
            <h3 className="mb-2 font-semibold text-zinc-900 dark:text-zinc-50">
              Where are the files located?
            </h3>
            <p className="mb-2 text-zinc-600 dark:text-zinc-400">
              In most exports, they are under:
            </p>
            <code className="mb-3 block rounded bg-white px-2 py-1.5 text-xs dark:bg-zinc-900">
              connections/followers_and_following/
            </code>
            <ul className="list-disc space-y-1 pl-5 text-zinc-600 dark:text-zinc-400">
              <li>
                <code className="text-xs">following.json</code>
              </li>
              <li>
                <code className="text-xs">followers_1.json</code>, and if split:{" "}
                <code className="text-xs">followers_2.json</code>,{" "}
                <code className="text-xs">followers_3.json</code>, …
              </li>
            </ul>
          </section>

          <section className="mb-6 rounded-xl border border-indigo-200 bg-indigo-50/80 p-4 dark:border-indigo-900/60 dark:bg-indigo-950/30">
            <h3 className="mb-2 font-semibold text-indigo-950 dark:text-indigo-100">
              Correct export settings
            </h3>
            <ul className="list-disc space-y-1 pl-5 text-indigo-950/90 dark:text-indigo-100/90">
              <li>
                <strong>Format:</strong> JSON
              </li>
              <li>
                <strong>Date range:</strong> All time, if you can choose it
              </li>
              <li>
                <strong>Media quality:</strong> Any option is fine
              </li>
              <li>
                <strong>Data type:</strong> Followers and following / Connections
              </li>
            </ul>
          </section>

          <section className="mb-6">
            <h3 className="mb-2 font-semibold text-zinc-900 dark:text-zinc-50">
              Common mistakes
            </h3>
            <ol className="list-decimal space-y-2 pl-5 text-zinc-600 dark:text-zinc-400">
              <li>
                <strong>Choosing HTML instead of JSON</strong> — this app needs
                JSON files.
              </li>
              <li>
                <strong>Uploading only following.json</strong> — you also need at
                least one <code className="text-xs">followers_*.json</code> file.
              </li>
              <li>
                <strong>Uploading screenshots</strong> — the app cannot read them.
              </li>
              <li>
                <strong>Wrong ZIP</strong> — use the ZIP from your official data
                export, not another archive.
              </li>
              <li>
                <strong>Renaming or editing files</strong> — prefer uploading the
                original ZIP unchanged.
              </li>
            </ol>
          </section>

          <p className="rounded-lg border border-emerald-200 bg-emerald-50/90 px-3 py-2 text-emerald-950 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-100">
            <strong className="font-semibold">Privacy note:</strong> FollowBack
            Checker does not ask for your Instagram login. Your files are
            processed locally in your browser and are not uploaded to a server.
          </p>

          <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-950/50">
            <p className="mb-2 font-medium text-zinc-800 dark:text-zinc-200">
              I only have JSON files
            </p>
            <p className="text-zinc-600 dark:text-zinc-400">
              You can upload the JSON files directly: select{" "}
              <code className="rounded bg-white px-1 text-xs dark:bg-zinc-900">
                following.json
              </code>{" "}
              and every{" "}
              <code className="rounded bg-white px-1 text-xs dark:bg-zinc-900">
                followers_*.json
              </code>{" "}
              file together (multi-select). Then use the button below to jump back
              to the upload area.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-zinc-200 bg-zinc-50 px-5 py-4 dark:border-zinc-700 dark:bg-zinc-950/80 sm:flex-row sm:flex-wrap sm:justify-end">
          <button
            type="button"
            onClick={handleJsonOnly}
            className="order-2 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 sm:order-1"
          >
            I only have JSON files — go to upload
          </button>
          <button
            type="button"
            onClick={handleZipReady}
            className="order-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400 sm:order-2"
          >
            I have my ZIP file — upload now
          </button>
        </div>
      </div>
    </dialog>
  );
}

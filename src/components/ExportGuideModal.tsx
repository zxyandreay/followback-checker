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
          <h2 className="pr-2 text-lg font-semibold leading-snug">
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
            To use FollowBack Checker, you need to download your official Instagram
            data export. The app does not need your Instagram password. Your files
            are processed locally in your browser.
          </p>

          <div className="mb-4 rounded-xl border-2 border-indigo-400 bg-indigo-50 px-4 py-3 text-indigo-950 dark:border-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-50">
            <p className="text-center text-sm font-semibold">
              Best export settings: Followers and following only + All time + JSON
            </p>
          </div>

          <div className="mb-5 flex flex-wrap gap-2">
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-900 dark:bg-amber-950/80 dark:text-amber-100">
              JSON required
            </span>
            <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-900 dark:bg-sky-950/80 dark:text-sky-100">
              All time recommended
            </span>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-100">
              No password needed
            </span>
            <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-900 dark:bg-violet-950/80 dark:text-violet-100">
              Local processing
            </span>
          </div>

          <section className="mb-5">
            <h3 className="mb-2 font-semibold text-zinc-900 dark:text-zinc-50">
              Recommended Export Settings
            </h3>
            <ul className="list-disc space-y-1 pl-5 text-zinc-600 dark:text-zinc-400">
              <li>
                <strong>Data to export:</strong> Followers and following only
              </li>
              <li>
                <strong>Date range:</strong> All time
              </li>
              <li>
                <strong>Format:</strong> JSON
              </li>
              <li>
                <strong>Media quality:</strong> Any option is okay
              </li>
            </ul>
          </section>

          <section className="mb-6 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-950/50">
            <h3 className="mb-2 font-semibold text-zinc-900 dark:text-zinc-50">
              Why these settings matter
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400">
              Selecting only <strong>Followers and following</strong> keeps the
              export smaller and faster to prepare. Choosing{" "}
              <strong>All time</strong> helps make sure Instagram includes your
              complete follower and following lists. Shorter date ranges may only
              export recent relationship activity and can result in missing files.
            </p>
          </section>

          <h3 className="mb-3 font-semibold text-zinc-900 dark:text-zinc-50">
            Step-by-step guide
          </h3>
          <ol className="mb-6 list-decimal space-y-3 pl-5 marker:font-semibold">
            <li>
              <strong>Open Instagram.</strong> Open the Instagram app or Instagram
              website and log in to your account.
            </li>
            <li>
              <strong>Go to your profile.</strong> Tap your profile picture.
            </li>
            <li>
              <strong>Open Settings and privacy.</strong> Tap the menu icon,
              usually the three lines in the top-right corner, then open{" "}
              <strong>Settings and privacy</strong>.
            </li>
            <li>
              <strong>Open Accounts Center.</strong> Find and open Accounts Center.
            </li>
            <li>
              <strong>Open Your information and permissions.</strong> Inside
              Accounts Center, select Your information and permissions.
            </li>
            <li>
              <strong>Choose Export or Download.</strong> Tap{" "}
              <strong>Export your information</strong> or{" "}
              <strong>Download your information</strong>. The exact wording may
              vary depending on Instagram&apos;s current interface.
            </li>
            <li>
              <strong>Select your Instagram account.</strong> Choose the Instagram
              account you want to export data from.
            </li>
            <li>
              <strong>Select the data to export.</strong> Choose{" "}
              <strong>Followers and following only</strong>. Avoid exporting all
              data unless necessary, because it creates a much larger ZIP file and
              takes longer to prepare.
            </li>
            <li>
              <strong>Set the date range.</strong> Choose <strong>All time</strong>
              . This helps make sure both followers and following data are included.
            </li>
            <li>
              <strong>Choose the format.</strong> Select <strong>JSON</strong>. Do
              not choose HTML because FollowBack Checker reads JSON files.
            </li>
            <li>
              <strong>Submit the export request.</strong> Submit the request and
              wait for Instagram/Meta to prepare the download.
            </li>
            <li>
              <strong>Download the ZIP file.</strong> Once the export is ready,
              download the ZIP file.
            </li>
            <li>
              <strong>Upload to FollowBack Checker.</strong> Return to the app and
              upload the ZIP file directly. The app should automatically detect the
              needed files.
            </li>
          </ol>

          <section className="mb-6 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-950/50">
            <h3 className="mb-2 font-semibold text-zinc-900 dark:text-zinc-50">
              Where the needed files are usually located
            </h3>
            <code className="mb-3 block rounded bg-white px-2 py-1.5 text-xs dark:bg-zinc-900">
              connections/followers_and_following/
            </code>
            <p className="mb-2 font-medium text-zinc-800 dark:text-zinc-200">
              Required files:
            </p>
            <ul className="list-disc space-y-1 pl-5 text-zinc-600 dark:text-zinc-400">
              <li>
                <code className="text-xs">following.json</code>
              </li>
              <li>
                <code className="text-xs">followers_1.json</code>
              </li>
              <li>
                <code className="text-xs">followers_2.json</code>,{" "}
                <code className="text-xs">followers_3.json</code>, etc. if
                available
              </li>
            </ul>
          </section>

          <section className="mb-6">
            <h3 className="mb-2 font-semibold text-zinc-900 dark:text-zinc-50">
              Common mistakes
            </h3>
            <ol className="list-decimal space-y-2 pl-5 text-zinc-600 dark:text-zinc-400">
              <li>
                <strong>Choosing HTML instead of JSON</strong> — FollowBack Checker
                needs JSON files.
              </li>
              <li>
                <strong>Choosing a short date range</strong> — Short date ranges may
                only export recent changes and may not include the complete
                followers/following files.
              </li>
              <li>
                <strong>Uploading only following.json</strong> — The app needs{" "}
                <code className="text-xs">following.json</code> and at least one{" "}
                <code className="text-xs">followers_*.json</code> file.
              </li>
              <li>
                <strong>Exporting all Instagram data</strong> — This may still work,
                but it creates a larger ZIP file and takes longer to prepare.
              </li>
              <li>
                <strong>Uploading screenshots</strong> — Screenshots cannot be read
                by the app.
              </li>
              <li>
                <strong>Uploading the wrong ZIP file</strong> — Make sure the ZIP
                file came from your official Instagram data export.
              </li>
              <li>
                <strong>Renaming or editing the files manually</strong> — It is
                better to upload the original ZIP file directly.
              </li>
            </ol>
          </section>

          <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50/90 px-3 py-2 text-emerald-950 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-100">
            <strong className="font-semibold">Privacy note:</strong> FollowBack
            Checker does not ask for your Instagram username, password, or login.
            Your data is processed locally in your browser and is not uploaded to a
            server.
          </p>

          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-950/50">
            <p className="mb-2 font-medium text-zinc-800 dark:text-zinc-200">
              I only have JSON files
            </p>
            <p className="text-zinc-600 dark:text-zinc-400">
              You can upload{" "}
              <code className="rounded bg-white px-1 text-xs dark:bg-zinc-900">
                following.json
              </code>{" "}
              and every{" "}
              <code className="rounded bg-white px-1 text-xs dark:bg-zinc-900">
                followers_*.json
              </code>{" "}
              file directly — select them together (multi-select). Use the button
              below to return to the upload area.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-zinc-200 bg-zinc-50 px-5 py-4 dark:border-zinc-700 dark:bg-zinc-950/80 sm:flex-row sm:flex-wrap sm:justify-end">
          <button
            type="button"
            onClick={handleJsonOnly}
            className="order-2 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 sm:order-1"
          >
            I only have JSON files
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

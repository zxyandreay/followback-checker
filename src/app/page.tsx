"use client";

import { ExportCsvButton } from "@/components/ExportCsvButton";
import { ExportGuideModal } from "@/components/ExportGuideModal";
import { PrivacyBanner } from "@/components/PrivacyBanner";
import { SummaryCounts } from "@/components/SummaryCounts";
import {
  UploadDropzone,
  type UploadDropzoneHandle,
} from "@/components/UploadDropzone";
import { UsernameList } from "@/components/UsernameList";
import type { CompareResult } from "@/lib/compare-follow-lists";
import { compareFollowLists } from "@/lib/compare-follow-lists";
import type { CsvRow } from "@/lib/csv";
import type { ResultCategoryId } from "@/lib/result-category";
import { CATEGORY_LABELS } from "@/lib/result-category";
import { parseInstagramExportFromFiles } from "@/lib/instagram-export";
import { useCallback, useMemo, useRef, useState } from "react";

function filterUsernames(usernames: string[], query: string): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return usernames;
  return usernames.filter((u) => u.includes(q));
}

export default function Home() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [compare, setCompare] = useState<CompareResult | null>(null);
  const [totals, setTotals] = useState<{
    following: number;
    followers: number;
  } | null>(null);
  const [sourceLists, setSourceLists] = useState<{
    following: string[];
    followers: string[];
  } | null>(null);
  const [activeCategory, setActiveCategory] =
    useState<ResultCategoryId>("notFollowingBack");
  const [search, setSearch] = useState("");
  const [guideOpen, setGuideOpen] = useState(false);
  const uploadDropzoneRef = useRef<UploadDropzoneHandle>(null);

  const scrollToUpload = useCallback(() => {
    document.getElementById("upload-section")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  const afterGuideClosePickFiles = useCallback(
    (mode: "json" | "zipOrJson") => {
      setGuideOpen(false);
      scrollToUpload();
      queueMicrotask(() => uploadDropzoneRef.current?.openFilePicker(mode));
    },
    [scrollToUpload],
  );

  const resetForNewUpload = useCallback(() => {
    setCompare(null);
    setTotals(null);
    setSourceLists(null);
    setError(null);
    setSearch("");
    setActiveCategory("notFollowingBack");
    scrollToUpload();
    // Still part of the same user gesture; may be blocked in some browsers.
    queueMicrotask(() =>
      uploadDropzoneRef.current?.openFilePicker("zipOrJson"),
    );
  }, [scrollToUpload]);

  const handleFiles = useCallback(async (files: File[]) => {
    setBusy(true);
    setError(null);
    setCompare(null);
    setTotals(null);
    setSourceLists(null);
    try {
      const result = await parseInstagramExportFromFiles(files);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      const followingSorted = [...result.followingUsernames].sort((a, b) =>
        a.localeCompare(b),
      );
      const followersSorted = [...result.followerUsernames].sort((a, b) =>
        a.localeCompare(b),
      );
      const compared = compareFollowLists(
        result.followingUsernames,
        result.followerUsernames,
      );
      setCompare(compared);
      setTotals({
        following: result.followingUsernames.length,
        followers: result.followerUsernames.length,
      });
      setSourceLists({
        following: followingSorted,
        followers: followersSorted,
      });
      setActiveCategory("notFollowingBack");
      setSearch("");
    } catch {
      setError(
        "Something went wrong while reading your files. Try again with a fresh export.",
      );
    } finally {
      setBusy(false);
    }
  }, []);

  const activeList = useMemo(() => {
    if (!compare || !sourceLists) return [];
    switch (activeCategory) {
      case "following":
        return sourceLists.following;
      case "followers":
        return sourceLists.followers;
      case "notFollowingBack":
        return compare.notFollowingBack;
      case "peopleYouDontFollowBack":
        return compare.peopleYouDontFollowBack;
      case "mutuals":
        return compare.mutuals;
    }
  }, [compare, sourceLists, activeCategory]);

  const filteredList = useMemo(
    () => filterUsernames(activeList, search),
    [activeList, search],
  );

  const csvRows: CsvRow[] = useMemo(
    () =>
      filteredList.map((username) => ({
        username,
        category: CATEGORY_LABELS[activeCategory],
      })),
    [filteredList, activeCategory],
  );

  const emptyMessages: Record<ResultCategoryId, string> = {
    following: "No accounts in this list.",
    followers: "No accounts in this list.",
    notFollowingBack: "Everyone you follow follows you back.",
    peopleYouDontFollowBack: "You follow everyone who follows you.",
    mutuals: "No mutual follows found.",
  };

  const categoryHeading = CATEGORY_LABELS[activeCategory];

  return (
    <div className="flex flex-1 flex-col bg-zinc-100 dark:bg-zinc-950">
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6 lg:py-14">
        <header className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            FollowBack Checker
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Compare your{" "}
            <strong className="font-medium text-zinc-800 dark:text-zinc-200">
              Following &amp; Followers
            </strong>{" "}
            lists from Meta&apos;s official export.{" "}
            <button
              type="button"
              onClick={() => setGuideOpen(true)}
              className="font-medium text-indigo-600 underline-offset-2 hover:underline dark:text-indigo-400"
            >
              How to export your data
            </button>
          </p>
          <PrivacyBanner />
        </header>

        <section
          id="upload-section"
          className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <UploadDropzone
            ref={uploadDropzoneRef}
            onFiles={handleFiles}
            disabled={busy}
          />
          {busy && (
            <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
              Reading export…
            </p>
          )}
        </section>

        {error && (
          <div
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-100"
            role="alert"
          >
            <div className="whitespace-pre-wrap">{error}</div>
            <div className="mt-4 border-t border-red-200/80 pt-3 dark:border-red-800/60">
              <p className="mb-2 text-red-950 dark:text-red-50">
                <span className="font-medium">
                  Need help exporting your Instagram data?
                </span>{" "}
                <button
                  type="button"
                  onClick={() => setGuideOpen(true)}
                  className="font-semibold text-indigo-700 underline underline-offset-2 hover:text-indigo-600 dark:text-indigo-300 dark:hover:text-indigo-200"
                >
                  View guide
                </button>
              </p>
            </div>
          </div>
        )}

        <ExportGuideModal
          open={guideOpen}
          onClose={() => setGuideOpen(false)}
          onZipReady={() => afterGuideClosePickFiles("zipOrJson")}
          onJsonFilesReady={() => afterGuideClosePickFiles("json")}
        />

        {compare && totals && sourceLists && (
          <section className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                Results
              </h2>
              <button
                type="button"
                onClick={resetForNewUpload}
                className="inline-flex items-center justify-center rounded-lg border border-indigo-600 bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-500 dark:border-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400"
              >
                Upload New Export
              </button>
            </div>

            <SummaryCounts
              totalFollowing={totals.following}
              totalFollowers={totals.followers}
              notFollowingBack={compare.notFollowingBack.length}
              peopleYouDontFollowBack={compare.peopleYouDontFollowBack.length}
              mutuals={compare.mutuals.length}
              selectedCategory={activeCategory}
              onSelect={setActiveCategory}
            />

            <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div>
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                  {categoryHeading}
                </h3>
                <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                  {activeList.length.toLocaleString()}{" "}
                  {activeList.length === 1 ? "account" : "accounts"}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <label className="flex flex-1 flex-col gap-1 text-sm sm:max-w-md">
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    Search
                  </span>
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Filter by username…"
                    className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                  />
                </label>
                <ExportCsvButton rows={csvRows} />
              </div>

              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Showing {filteredList.length.toLocaleString()} of{" "}
                {activeList.length.toLocaleString()} in {categoryHeading}
                {search.trim() ? " (filtered)" : ""}. CSV includes only this
                filtered list.
              </p>

              <UsernameList
                usernames={filteredList}
                emptyMessage={
                  search.trim()
                    ? "No usernames match your search."
                    : emptyMessages[activeCategory]
                }
              />
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

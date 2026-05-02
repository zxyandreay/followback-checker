"use client";

import { ExportCsvButton } from "@/components/ExportCsvButton";
import { PrivacyBanner } from "@/components/PrivacyBanner";
import type { ResultTabId } from "@/components/ResultsTabs";
import { ResultsTabs } from "@/components/ResultsTabs";
import { SummaryCounts } from "@/components/SummaryCounts";
import { UploadDropzone } from "@/components/UploadDropzone";
import { UsernameList } from "@/components/UsernameList";
import type { CompareResult } from "@/lib/compare-follow-lists";
import { compareFollowLists } from "@/lib/compare-follow-lists";
import type { CsvRow } from "@/lib/csv";
import { parseInstagramExportFromFiles } from "@/lib/instagram-export";
import { useCallback, useMemo, useState } from "react";

function filterUsernames(usernames: string[], query: string): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return usernames;
  return usernames.filter((u) => u.includes(q));
}

const TAB_LABELS: Record<ResultTabId, string> = {
  notFollowingBack: "Not Following Back",
  fansYouDontFollowBack: "Fans You Don’t Follow Back",
  mutuals: "Mutuals",
};

export default function Home() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [compare, setCompare] = useState<CompareResult | null>(null);
  const [totals, setTotals] = useState<{
    following: number;
    followers: number;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<ResultTabId>("notFollowingBack");
  const [search, setSearch] = useState("");

  const handleFiles = useCallback(async (files: File[]) => {
    setBusy(true);
    setError(null);
    setCompare(null);
    setTotals(null);
    try {
      const result = await parseInstagramExportFromFiles(files);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      const compared = compareFollowLists(
        result.followingUsernames,
        result.followerUsernames,
      );
      setCompare(compared);
      setTotals({
        following: result.followingUsernames.length,
        followers: result.followerUsernames.length,
      });
      setActiveTab("notFollowingBack");
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
    if (!compare) return [];
    switch (activeTab) {
      case "notFollowingBack":
        return compare.notFollowingBack;
      case "fansYouDontFollowBack":
        return compare.fansYouDontFollowBack;
      case "mutuals":
        return compare.mutuals;
      default:
        return [];
    }
  }, [compare, activeTab]);

  const filteredList = useMemo(
    () => filterUsernames(activeList, search),
    [activeList, search],
  );

  const csvRows: CsvRow[] = useMemo(
    () =>
      filteredList.map((username) => ({
        username,
        category: TAB_LABELS[activeTab],
      })),
    [filteredList, activeTab],
  );

  const tabDefs = useMemo(() => {
    if (!compare) return [];
    return [
      {
        id: "notFollowingBack" as const,
        label: TAB_LABELS.notFollowingBack,
        count: compare.notFollowingBack.length,
      },
      {
        id: "fansYouDontFollowBack" as const,
        label: TAB_LABELS.fansYouDontFollowBack,
        count: compare.fansYouDontFollowBack.length,
      },
      {
        id: "mutuals" as const,
        label: TAB_LABELS.mutuals,
        count: compare.mutuals.length,
      },
    ];
  }, [compare]);

  const emptyMessages: Record<ResultTabId, string> = {
    notFollowingBack: "Everyone you follow follows you back.",
    fansYouDontFollowBack: "You follow everyone who follows you.",
    mutuals: "No mutual follows found.",
  };

  return (
    <div className="flex flex-1 flex-col bg-zinc-100 dark:bg-zinc-950">
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6 lg:py-14">
        <header className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            FollowBack Checker
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Compare your official Instagram{" "}
            <strong className="font-medium text-zinc-800 dark:text-zinc-200">
              Following &amp; Followers
            </strong>{" "}
            export — no username, password, or login required.
          </p>
          <PrivacyBanner />
        </header>

        <section className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <UploadDropzone onFiles={handleFiles} disabled={busy} />
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
            {error}
          </div>
        )}

        {compare && totals && (
          <section className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                Results
              </h2>
              <button
                type="button"
                onClick={() => {
                  setCompare(null);
                  setTotals(null);
                  setError(null);
                  setSearch("");
                }}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                Upload another export
              </button>
            </div>

            <SummaryCounts
              totalFollowing={totals.following}
              totalFollowers={totals.followers}
              notFollowingBack={compare.notFollowingBack.length}
              fansYouDontFollowBack={compare.fansYouDontFollowBack.length}
              mutuals={compare.mutuals.length}
            />

            <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <ResultsTabs
                tabs={tabDefs}
                active={activeTab}
                onChange={setActiveTab}
              />

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
                {activeList.length.toLocaleString()} in this tab
                {search.trim() ? " (filtered)" : ""}. CSV includes only this
                filtered list.
              </p>

              <UsernameList
                usernames={filteredList}
                emptyMessage={
                  search.trim()
                    ? "No usernames match your search."
                    : emptyMessages[activeTab]
                }
              />
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

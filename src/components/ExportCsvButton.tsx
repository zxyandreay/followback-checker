"use client";

import type { CsvRow } from "@/lib/csv";
import { downloadCsv } from "@/lib/csv";

type ExportCsvButtonProps = {
  rows: CsvRow[];
  filename?: string;
  disabled?: boolean;
};

export function ExportCsvButton({
  rows,
  filename = "followback-checker-export.csv",
  disabled,
}: ExportCsvButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || rows.length === 0}
      onClick={() => downloadCsv(filename, rows)}
      className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
    >
      Export to CSV
    </button>
  );
}

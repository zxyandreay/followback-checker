"use client";

import { useCallback, useRef, useState } from "react";

type UploadDropzoneProps = {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
  onOpenGuide?: () => void;
};

export function UploadDropzone({
  onFiles,
  disabled,
  onOpenGuide,
}: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = useCallback(
    (list: FileList | null) => {
      if (!list?.length || disabled) return;
      onFiles(Array.from(list));
    },
    [disabled, onFiles],
  );

  return (
    <div className="w-full space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-900 dark:bg-amber-950/80 dark:text-amber-100">
            Use JSON, not HTML
          </span>
          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-100">
            No password needed
          </span>
          <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-900 dark:bg-indigo-950/80 dark:text-indigo-100">
            Upload ZIP or JSON files
          </span>
        </div>
        {onOpenGuide && (
          <button
            type="button"
            disabled={disabled}
            onClick={onOpenGuide}
            className="shrink-0 text-left text-sm font-medium text-indigo-600 underline-offset-2 hover:underline disabled:opacity-50 dark:text-indigo-400"
          >
            How to export your Instagram data
          </button>
        )}
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        onDragEnter={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragOver(false);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={[
          "flex min-h-[140px] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors",
          disabled
            ? "cursor-not-allowed border-zinc-200 bg-zinc-50 opacity-60 dark:border-zinc-800 dark:bg-zinc-900/40"
            : dragOver
              ? "border-indigo-500 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-950/30"
              : "border-zinc-300 bg-zinc-50/80 hover:border-indigo-400 hover:bg-indigo-50/50 dark:border-zinc-700 dark:bg-zinc-900/50 dark:hover:border-indigo-500 dark:hover:bg-indigo-950/20",
        ].join(" ")}
      >
        <span className="text-base font-medium text-zinc-900 dark:text-zinc-50">
          Drop your Instagram export ZIP or JSON files here
        </span>
        <span className="max-w-md text-sm text-zinc-600 dark:text-zinc-400">
          Or click to browse — use the official JSON export (ZIP), or select{" "}
          <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs dark:bg-zinc-800">
            following.json
          </code>{" "}
          /{" "}
          <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs dark:bg-zinc-800">
            followers_*.json
          </code>{" "}
          from{" "}
          <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs dark:bg-zinc-800">
            connections/followers_and_following
          </code>
          .
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        accept=".zip,.json,application/zip,application/json"
        multiple
        disabled={disabled}
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}

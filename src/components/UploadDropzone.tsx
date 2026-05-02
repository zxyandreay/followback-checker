"use client";

import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

export type UploadPickerMode = "json" | "zipOrJson";

export type UploadDropzoneHandle = {
  /** Opens the OS file picker. `json` filters to JSON files; `zipOrJson` allows ZIP and JSON. */
  openFilePicker: (mode: UploadPickerMode) => void;
};

type UploadDropzoneProps = {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
};

const ACCEPT_ZIP_AND_JSON =
  ".zip,.json,application/zip,application/json";
const ACCEPT_JSON_ONLY = ".json,application/json";

export const UploadDropzone = forwardRef<
  UploadDropzoneHandle,
  UploadDropzoneProps
>(function UploadDropzone({ onFiles, disabled }, ref) {
  const zipJsonInputRef = useRef<HTMLInputElement>(null);
  const jsonOnlyInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = useCallback(
    (list: FileList | null) => {
      if (!list?.length || disabled) return;
      onFiles(Array.from(list));
    },
    [disabled, onFiles],
  );

  useImperativeHandle(
    ref,
    () => ({
      openFilePicker(mode: UploadPickerMode) {
        if (disabled) return;
        if (mode === "json") {
          jsonOnlyInputRef.current?.click();
        } else {
          zipJsonInputRef.current?.click();
        }
      },
    }),
    [disabled],
  );

  return (
    <div className="w-full">
      <button
        type="button"
        disabled={disabled}
        onClick={() => zipJsonInputRef.current?.click()}
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
          Drop your export ZIP or JSON files here
        </span>
        <span className="max-w-md text-sm text-zinc-600 dark:text-zinc-400">
          Or click to browse — official Instagram JSON export only.
        </span>
      </button>
      <input
        ref={zipJsonInputRef}
        type="file"
        className="sr-only"
        accept={ACCEPT_ZIP_AND_JSON}
        multiple
        disabled={disabled}
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <input
        ref={jsonOnlyInputRef}
        type="file"
        className="sr-only"
        accept={ACCEPT_JSON_ONLY}
        multiple
        disabled={disabled}
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
});

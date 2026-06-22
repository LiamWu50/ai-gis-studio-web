"use client";

import type { UploadHookControl } from "@better-upload/client";
import { Loader2, Upload } from "lucide-react";
import { useId } from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";

type UploadDropzoneProps = {
  control: UploadHookControl<true>;
  id?: string;
  accept?: string;
  metadata?: Record<string, unknown>;
  description?:
    | {
        fileTypes?: string;
        maxFileSize?: string;
        maxFiles?: number;
      }
    | string;
  uploadOverride?: (
    ...args: Parameters<UploadHookControl<true>["upload"]>
  ) => Promise<unknown> | void;
};

export function UploadDropzone({
  control: { upload, isPending },
  id: idProp,
  accept,
  metadata,
  description,
  uploadOverride,
}: UploadDropzoneProps) {
  const generatedId = useId();
  const id = idProp || generatedId;

  const { getRootProps, getInputProps, isDragActive, inputRef } = useDropzone({
    disabled: isPending,
    noClick: true,
    onDrop: (files) => {
      if (files.length > 0 && !isPending) {
        if (uploadOverride) {
          uploadOverride(files, { metadata });
        } else {
          upload(files, { metadata });
        }
      }

      if (inputRef.current) inputRef.current.value = "";
    },
  });

  const descriptionContent =
    typeof description === "string" ? (
      description
    ) : (
      <>
        {description?.maxFiles &&
          `最多上传 ${description.maxFiles} 个文件。`}{" "}
        {description?.maxFileSize && `单文件不超过 ${description.maxFileSize}。`}{" "}
        {description?.fileTypes && `支持 ${description.fileTypes}。`}
      </>
    );

  return (
    <div
      className={cn(
        "relative rounded-lg border border-dashed border-input text-foreground transition-colors",
        isDragActive && "border-primary/80",
      )}
    >
      <label
        {...getRootProps()}
        className={cn(
          "flex min-h-40 w-full min-w-72 cursor-pointer flex-col items-center justify-center rounded-lg bg-transparent px-4 py-8 text-center transition-colors",
          isPending && "cursor-not-allowed text-muted-foreground",
          !isPending && "hover:bg-muted/40",
          isDragActive && "opacity-0",
        )}
        htmlFor={id}
      >
        <div className="my-2">
          {isPending ? (
            <Loader2 className="size-6 animate-spin" />
          ) : (
            <Upload className="size-6" />
          )}
        </div>

        <div className="mt-3 space-y-1">
          <p className="text-sm font-semibold">拖拽文件到这里，或点击选择</p>
          <p className="mx-auto max-w-72 text-xs text-muted-foreground">
            {descriptionContent}
          </p>
        </div>

        <input
          {...getInputProps()}
          id={id}
          type="file"
          multiple
          accept={accept}
          disabled={isPending}
        />
      </label>

      {isDragActive && (
        <div className="pointer-events-none absolute inset-0 rounded-lg">
          <div className="flex size-full flex-col items-center justify-center rounded-lg bg-muted/50">
            <div className="my-2">
              <Upload className="size-6" />
            </div>
            <p className="mt-3 text-sm font-semibold">松开即可上传</p>
          </div>
        </div>
      )}
    </div>
  );
}

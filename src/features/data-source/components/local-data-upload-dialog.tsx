"use client";

import type { UploadHookControl } from "@better-upload/client";
import { CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UploadDropzone } from "@/components/ui/upload-dropzone";

type LocalDataUploadDialogProps = {
  isOpen: boolean;
  isUploading: boolean;
  lastUploadedFileName: string;
  uploadError: string;
  onFileChange: (file: File | undefined) => void;
  onOpenChange: (open: boolean) => void;
};

export function LocalDataUploadDialog({
  isOpen,
  isUploading,
  lastUploadedFileName,
  uploadError,
  onFileChange,
  onOpenChange,
}: LocalDataUploadDialogProps) {
  const uploadControl = {
    allSucceeded: false,
    averageProgress: 0,
    error: null,
    failedFiles: [],
    hasFailedFiles: false,
    isAborted: false,
    isError: Boolean(uploadError),
    isPending: isUploading,
    isSettled: !isUploading,
    metadata: {},
    progresses: [],
    reset: () => {},
    upload: async () => ({ files: [], failedFiles: [], metadata: {} }),
    uploadAsync: async () => ({ files: [], failedFiles: [], metadata: {} }),
    uploadedFiles: [],
  } satisfies UploadHookControl<true>;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[468px]">
        <DialogHeader>
          <DialogTitle>上传本地数据</DialogTitle>
          <DialogDescription>
            选择 GeoJSON 或 JSON 文件，上传后会自动加入本地数据列表。
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-2">
          <UploadDropzone
            accept=".geojson,.json,application/geo+json,application/json"
            control={uploadControl}
            description={{
              fileTypes: "GeoJSON、JSON",
              maxFiles: 1,
            }}
            uploadOverride={(files) => {
              void onFileChange(files[0]);
            }}
          />

          {uploadError && (
            <p className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {uploadError}
            </p>
          )}

          {lastUploadedFileName && !uploadError && (
            <p className="flex items-center gap-2 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700">
              <CheckCircle2 className="size-4" />
              {lastUploadedFileName} 已上传
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { RefreshCw, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatasetSearchInput } from "./dataset-search-input";

type LocalDataToolbarProps = {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  isLoading: boolean;
  isUploading: boolean;
  searchKeyword: string;
  onFileChange: (file: File | undefined) => void;
  onRefresh: () => void;
  onSearchChange: (value: string) => void;
  onUploadClick: () => void;
};

export function LocalDataToolbar({
  fileInputRef,
  isLoading,
  isUploading,
  searchKeyword,
  onFileChange,
  onRefresh,
  onSearchChange,
  onUploadClick,
}: LocalDataToolbarProps) {
  return (
    <div className="flex items-center gap-2">
      <DatasetSearchInput
        ariaLabel="搜索本地数据"
        disabled={isUploading}
        placeholder="搜索本地数据"
        value={searchKeyword}
        onChange={onSearchChange}
      />
      <input
        ref={fileInputRef}
        accept=".geojson,.json,application/geo+json,application/json"
        className="sr-only"
        disabled={isUploading}
        type="file"
        onChange={(event) => void onFileChange(event.target.files?.[0])}
      />
      <Button
        type="button"
        size="sm"
        className="h-8 w-20 transition-colors duration-200 ease-out"
        disabled={isUploading}
        onClick={onUploadClick}
      >
        <Upload className="size-3.5" />
        {isUploading ? "上传中" : "上传"}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-8 w-20 transition-colors duration-200 ease-out hover:border-foreground/30 hover:bg-muted/60 hover:text-foreground"
        disabled={isLoading}
        onClick={onRefresh}
      >
        <RefreshCw className="size-3.5" />
        刷新
      </Button>
    </div>
  );
}

import { Check, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatasetSearchInput } from "./dataset-search-input";

type SelectLayerToolbarProps = {
  isAdding: boolean;
  isLoading: boolean;
  searchKeyword: string;
  selectedRowId: string | null;
  onAddLayer: () => void;
  onRefresh: () => void;
  onSearchChange: (value: string) => void;
};

export function SelectLayerToolbar({
  isAdding,
  isLoading,
  searchKeyword,
  selectedRowId,
  onAddLayer,
  onRefresh,
  onSearchChange,
}: SelectLayerToolbarProps) {
  return (
    <div className="flex items-center gap-2">
      <DatasetSearchInput
        ariaLabel="搜索数据源"
        disabled={isAdding}
        placeholder="搜索数据源"
        value={searchKeyword}
        onChange={onSearchChange}
      />
      <Button
        type="button"
        size="sm"
        className="h-8 w-28 transition-colors duration-200 ease-out"
        disabled={!selectedRowId || isAdding}
        onClick={onAddLayer}
      >
        <Check className="size-3.5" />
        {isAdding ? "添加中" : "添加到图层"}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-8 w-20 transition-colors duration-200 ease-out hover:border-foreground/30 hover:bg-muted/60 hover:text-foreground"
        disabled={isLoading || isAdding}
        onClick={onRefresh}
      >
        <RefreshCw className="size-3.5" />
        刷新
      </Button>
    </div>
  );
}

import { Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatasetSearchInput } from "./dataset-search-input";

type OnlineDataToolbarProps = {
  isLoading: boolean;
  isSubmitting: boolean;
  searchKeyword: string;
  onAddClick: () => void;
  onRefresh: () => void;
  onSearchChange: (value: string) => void;
};

export function OnlineDataToolbar({
  isLoading,
  isSubmitting,
  searchKeyword,
  onAddClick,
  onRefresh,
  onSearchChange,
}: OnlineDataToolbarProps) {
  return (
    <div className="flex items-center gap-2">
      <DatasetSearchInput
        ariaLabel="搜索在线数据"
        disabled={isSubmitting}
        placeholder="搜索在线数据"
        value={searchKeyword}
        onChange={onSearchChange}
      />
      <Button
        type="button"
        size="sm"
        className="h-8 w-20 transition-colors duration-200 ease-out"
        disabled={isSubmitting}
        onClick={onAddClick}
      >
        <Plus className="size-3.5" />
        新增
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

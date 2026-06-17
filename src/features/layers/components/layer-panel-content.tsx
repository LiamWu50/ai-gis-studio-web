import type { FileTreeElement } from "@/components/unlumen-ui/file-tree";
import { cn } from "@/lib/utils";
import { LayerPanelHeader } from "./layer-panel-header";
import { LayerSearch } from "./layer-search";
import { LayerTree } from "./layer-tree";

type LayerPanelContentProps = {
  isOpen: boolean;
  searchValue: string;
  filteredElements: FileTreeElement[];
  defaultOpenIds: string[];
  onAddLayerClick: () => void;
  onSearchChange: (value: string) => void;
};

export function LayerPanelContent({
  isOpen,
  searchValue,
  filteredElements,
  defaultOpenIds,
  onAddLayerClick,
  onSearchChange,
}: LayerPanelContentProps) {
  return (
    <div
      aria-hidden={!isOpen}
      className={cn(
        "absolute left-12 top-0 w-[260px] bg-background px-4 py-3 shadow-lg backdrop-blur transition-all duration-200 ease-out",
        isOpen
          ? "pointer-events-auto translate-x-0 scale-100 opacity-100"
          : "pointer-events-none -translate-x-2 scale-95 opacity-0",
      )}
    >
      <LayerPanelHeader onAddLayerClick={onAddLayerClick} />
      <LayerSearch value={searchValue} onChange={onSearchChange} />
      <LayerTree
        elements={filteredElements}
        defaultOpenIds={defaultOpenIds}
        searchValue={searchValue}
      />
    </div>
  );
}

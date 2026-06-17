import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type LayerPanelHeaderProps = {
  onAddLayerClick: () => void;
};

export function LayerPanelHeader({ onAddLayerClick }: LayerPanelHeaderProps) {
  return (
    <div className="mb-2 flex items-center justify-between gap-3">
      <h2 className="text-sm font-semibold text-foreground">图层</h2>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-4 justify-end p-0 text-foreground hover:bg-transparent hover:text-foreground focus-visible:bg-transparent focus-visible:text-foreground"
        aria-label="添加图层"
        onClick={onAddLayerClick}
      >
        <Plus className="size-4" />
      </Button>
    </div>
  );
}
